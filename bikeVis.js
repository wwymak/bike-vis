/**
 * using citibike data from citibikenyc
 */

const bikeFeedUrl = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json';
const colorScale1 =  d3.scaleCategory20();

var width = 900;
var height = 900;
let foci = [{id: 0, x: width * 0.5, y:height * 0.5} ];
let radius = Math.min(width, height) * 0.4;

d3.range(10).map(d => {
  foci.push({
    id: d + 1,
    x: radius * Math.sin(Math.PI * d/ 5) + width * 0.5,
    y: radius * Math.cos(Math.PI * d/ 5) + height * 0.5
  })
});

var canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    tau = 2 * Math.PI;
    context.canvas.width = width;
    context.canvas.height = height;

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
        // x: 30,
        // y:30,
        x: focalInfo.x + (Math.random() - 0.5) * 10,
        y: focalInfo.y + (Math.random() - 0.5) * 10,
        radius: 5,
        color: colorScale1(i),
        id: `${e.toString()}_${d.station_id}`,
        forceCenter: [focalInfo.x, focalInfo.y]
      }
    });
    return nodes;
  });
  console.log(testSet, nodeArr[0]);

  var nodes = [].concat.apply([], nodeArr);
  console.log(nodes)
  var simulation = d3.forceSimulation(nodes)
      .drag(0.02)
      .alphaDecay(0)
      .force("x", d3.forceX().x(d => d.forceCenter[0]).strength(0.1))
      .force("y", d3.forceY().y(d => d.forceCenter[1]).strength(0.1))
      .force("collide", d3.forceCollide().radius(d => d.radius + 1.5).iterations(1))
      // .on("tick", ticked);
    simulation.on('tick', ticked);

  d3.select("#nAlphaDecay").on('input', function () {
    simulation.alphaDecay(this.value);
    simulation.alphaTarget(0).alpha(1);
    simulation.restart();
    d3.select("#nAlphaDecay-value").text(this.value)
  });

  d3.select("#nDrag").on('input', function () {
    simulation.drag(this.value);
    simulation.alphaTarget(0).alpha(1);
    simulation.restart();
    d3.select("#nDrag-value").text(this.value)
  });
  d3.select("#nPostionStrength").on('input', function () {
    simulation
        .force("x", d3.forceX().x(d => d.forceCenter[0]).strength(this.value))
        .force("y", d3.forceY().y(d => d.forceCenter[1]).strength(this.value));
    reheatSimulation(simulation);
    d3.select("#nPostionStrength-value").text(this.value)
  });

    simulation.on('end', () => {console.log(nodes)});

  function ticked() {
    context.clearRect(0, 0, width, height);
    context.save();


    nodes.forEach(function(d) {
      context.beginPath();
      context.moveTo(d.x + d.radius, d.y);
      context.arc(d.x, d.y, d.radius, 0, tau);
      context.fillStyle = d.color;
      context.fill();
      context.strokeStyle = d.color;
      context.stroke();
    });


    context.restore();
  }

  function reheatSimulation(simulation) {
    simulation.alphaTarget(0).alpha(1);
    simulation.restart();
  }

});