const svgWidth = 1200;
const svgHeight = 1200;

const svgContainer = d3.select("body")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight);

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const tooltip = d3.select("body")
.append("div")
.attr("class", "tooltip")
.style("opacity", 0)
.style("background-color", "white")
.style("border", "solid 1px")
.style("border-radius", "5px")
.style("padding", "10px");

d3.csv("https://raw.githubusercontent.com/NgSang0127/DSVS/main/pronvince.csv", function(csvData) {
  const confirmExtent = d3.extent(csvData, d => parseFloat(d.Confirm));
  colorScale.domain(confirmExtent);

  d3.json("https://raw.githubusercontent.com/TungTh/tungth.github.io/master/data/vn-provinces.json", function(jsonData) {
    jsonData.features.forEach(jsonFeature => {
      const jsonProvinceCode = jsonFeature.properties.Ma;
      const dataMatch = csvData.find(d => parseFloat(d.ma) === parseFloat(jsonProvinceCode));
      if (dataMatch) {
        jsonFeature.properties.Confirm = parseFloat(dataMatch.Confirm.replace(/\./g, ''));
      }
    });


    const geoCenter = d3.geoCentroid(jsonData);
    const scale = 45;
    const projection = d3.geoMercator()
    .scale(scale)
    .center(geoCenter)
    .translate([svgWidth / 2, svgHeight / 2]);

    const path = d3.geoPath().projection(projection);

    const bounds = d3.geoBounds(jsonData);
    const hscale = scale * svgWidth / (bounds[1][0] - bounds[0][0]);
    const vscale = scale * svgHeight / (bounds[1][1] - bounds[0][1]);
    const newScale = Math.min(hscale, vscale);

    projection.scale(newScale);

    const zooming = function() {
      const offset = [d3.event.transform.x, d3.event.transform.y];
      const newScale = d3.event.transform.k * 3000;

      projection.translate(offset).scale(newScale);

      svgContainer.selectAll("path").attr("d", path);
    };

    const zoom = d3.zoom().on("zoom", zooming);

    const map = svgContainer.append("g").attr("id", "map").call(zoom);

    map.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("opacity", 0);

    const handleMouseOver = function(d) {
      d3.select(this).transition().duration(100)
      .style("opacity", 1)
      .style("stroke", "white")
      .style("stroke-width", 3);

      tooltip.transition().duration(100).style("opacity", 1);

      tooltip.html(`Province: ${d.properties.Name}<br>Confirm: ${d.properties.Confirm.toLocaleString()} cases`)


      .style("left", (d3.event.pageX + 15) + "px")
      .style("top", (d3.event.pageY - 18) + "px");
    };

    const handleMouseOut = function(d) {
      d3.select(this).transition().duration(200)
      .style("opacity", 0.8)
      .style("stroke", "white")
      .style("stroke-width", 0.3);

      tooltip.transition().duration(100).style("opacity", 0);
    };

    svgContainer.selectAll("path")
    .data(jsonData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", d => d.properties.Confirm ? colorScale(d.properties.Confirm) : "#9370DB")
    .style('stroke', 'white')
    .style('stroke-width', 1.5)
    .style("opacity", 0.8)
    .on('mouseover', handleMouseOver)
    .on("mouseout", handleMouseOut);
  });
});
