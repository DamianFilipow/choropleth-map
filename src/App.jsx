import { useState, useEffect } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'

function App() {

  const [educationData, setEducationData] = useState(null)
  const [tooltipStyle, setTooltipStyle] = useState({
    "visibility": 'hidden',
    "position": "absolute",
    "left": 0,
    "top": 0
  })
  const [tooltipContent, setTooltipContent] = useState({
    bachelorsOrHigher: '',
    area_name: '',
    state: ''
  })

  useEffect(() => {

      fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json')
      .then(response => {
        if (!response.ok)
          throw new Error("Failed to fetch education data");
        return response.json();
      })
      .then((eduData) => {
        setEducationData(eduData)
      })
      .catch(error => {
        console.error("Error: ", error)
      });
              
  }, []);


  useEffect(() => {


      d3.select('section').select('svg').remove()

      const w = 900
      const h = 700

      if (educationData !== null) {
      
      const svg = d3.select('section')
                    .append('svg')
                    .attr('width', w)
                    .attr('height', h)

      const path = d3.geoPath()

      const legendValues = [3, 12, 21, 30, 39, 48, 57, 66]

      const colorLegend = d3.scaleBand()
                            .domain(legendValues.map(el => el / 100))
                            .range([0, 300])

      d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')
      .then((us) => {
        
        const colorScale = d3.scaleSequential(d3.interpolateGreens)
                           .domain([d3.min(educationData, d => d.bachelorsOrHigher), d3.max(educationData, d => d.bachelorsOrHigher)]);
        
        svg.append('g')
           .selectAll('path')
           .data(topojson.feature(us, us.objects.counties).features)
           .enter()
           .append('path')
           .attr('d', path)
           .attr('class', 'county')
           .attr('fill', d => colorScale(educationData.find((el) => el.fips === d.id).bachelorsOrHigher))
           .attr('data-fips', d => educationData.find((el) => el.fips === d.id).fips)
           .attr('data-education', d => educationData.find((el) => el.fips === d.id).bachelorsOrHigher)
           .on('mouseover', (event, d) => {
            const countyData = educationData.find(el => el.fips === d.id);
            if (countyData) {
              setTooltipStyle(t => ({
                ...t,
                'visibility': 'visible',
                'left': `${event.pageX + 30}px`,
                'top': `${event.pageY - 30}px`,
              }));
              setTooltipContent({bachelorsOrHigher: countyData.bachelorsOrHigher,
                                area_name: countyData.area_name,
                                state: countyData.state})
            }
         })
           .on('mouseout', () => {
            setTooltipStyle(t => ({
              ...t,
              "visibility": 'hidden',
            })) 
           })
      
  
        svg.append('path')
           .attr('class', 'county-borders')
           .attr('d', path(topojson.mesh(us, us.objects.counties, (a, b) => a !== b)));


        const legend = svg.append('g')
           .attr('transform', `translate(${w - 425},${h - 70})`)
           .attr('id', 'legend')
           .call(d3.axisBottom(colorLegend).tickFormat(d3.format(".0%")))
     
     
        legend.append('g')
             .selectAll('rect')
             .data(legendValues)
             .enter()
             .append('rect')
             .attr('width', 300 / legendValues.length)
             .attr('height', 15)
             .attr('x', (d, i) => 300 / legendValues.length * i)
             .attr('y', -15)
             .attr('fill', d => colorScale(d))
      })
      .catch(error => {
        console.error(error);
      });
      
      return () => {
        d3.selectAll('path').on("mouseover", null).on('mouseout', null)
      }
    }
  }, [educationData])


  return (
    <>
      <section>
        <header>
          <h1 id='title'>United States Educational Attainment</h1>
          <p id='description'>Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</p>
        </header>
      </section>
      <div id='tooltip' style={tooltipStyle} data-education={tooltipContent.bachelorsOrHigher}>
        {tooltipContent.area_name}, {tooltipContent.state}, {tooltipContent.bachelorsOrHigher}%
      </div>
    </>
  )
}

export default App
