/**
 * using citibike data from citibikenyc
 */

const bikeFeedUrl = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json';
const colorScale1 =  d3.scaleCategory20();


let docWidth = document.getElementById("animation").offsetWidth ;
var svg = d3.select("#animation")
            .append('svg')
              .attr('width', docWidth)
              .attr('height',docWidth);
let foci = [{id: 0, x: svg.attr('width') * 0.5, y:svg.attr('height') * 0.5} ];
let radius = docWidth * 0.4;
d3.range(10).map(d => {
  foci.push({
    id: d + 1,
    x: radius * Math.sin(Math.PI * d/ 5) + docWidth * 0.5,
    y: radius * Math.cos(Math.PI * d/ 5) + docWidth * 0.5
  })
});


console.log(foci);
d3.json(bikeFeedUrl, (err, data) => {
  let bikeData = data.data.stations;
  let updatedTime = data['last_updated'];

  let testSet = bikeData.slice(0, 10);
  let nodeArr = testSet.map((d, i) => {
    let numBikes = d.num_bikes_available;
    let focalInfo = foci.filter(j => j.id == i + 1)[0];
    if(!focalInfo){
      console.log( i)
      return
    }
    let nodes = d3.range(numBikes).map(e => {
      return {
        group: d.station_id,
        x: focalInfo.x + (Math.random() - 0.5) * 3,
        y: focalInfo.y + (Math.random() - 0.5) * 3,
        radius: 3,
        color: colorScale1(i),
        id: `${e.toString()}_${d.station_id}`,
        forceCenter: [focalInfo.x, focalInfo.y]
      }
    });
    return nodes;
  });
  console.log(testSet, nodeArr);

  let forceArr = nodeArr.map(nodes => {
    return d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(nodes[0].forceCenter));

  });
  
  svg.selectAll('g.nodeG')
      .data(nodeArr).enter().append('g')
});