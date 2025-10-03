import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function ImpactZoneD3() {
  const svgRef = useRef();

  useEffect(() => {
    const width = 800, height = 500;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove(); // clear before redraw

    // Projection
    const projection = d3.geoMercator()
      .center([0, 20]) // longitude, latitude
      .scale(width / 6)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load world map
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .then(world => {
        svg.append("g")
          .selectAll("path")
          .data(world.features)
          .join("path")
          .attr("d", path)
          .attr("fill", "#d9e3f0")
          .attr("stroke", "#777")
          .attr("stroke-width", 0.5);

        // Impact point
        const impact = { lat: 53.3498, lon: -6.2603 };

        // radii in km
        const severeKm = 200;
        const moderateKm = 500;
        const lightKm = 1000;

        const makeCircle = (lat, lon, radiusKm) =>
          d3.geoCircle()
            .center([lon, lat])
            .radius(radiusKm / 111)(); // km → degrees approx

        const zones = [
          { data: makeCircle(impact.lat, impact.lon, severeKm), color: "red" },
          { data: makeCircle(impact.lat, impact.lon, moderateKm), color: "orange" },
          { data: makeCircle(impact.lat, impact.lon, lightKm), color: "green" },
        ];

        svg.append("g")
          .selectAll("path.zone")
          .data(zones)
          .join("path")
          .attr("class", "zone")
          .attr("d", d => path(d.data))
          .attr("fill", d => d.color)
          .attr("opacity", 0.3);

        // Draw impact point
        const [x, y] = projection([impact.lon, impact.lat]);
        svg.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 5)
          .attr("fill", "black");
      });
  }, []);

  return <svg ref={svgRef}></svg>;
}