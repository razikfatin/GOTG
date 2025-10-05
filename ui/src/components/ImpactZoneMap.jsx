import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function ImpactZoneMap({ zones = [], tsunami = false, earthquake = false }) {
  const svgRef = useRef();

  useEffect(() => {
    const width = 800, height = 500;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove(); // clear before redraw

    // Projection
    const projection = d3.geoMercator()
      .center([0, 20])
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

        // Draw impact zones dynamically
        const makeCircle = (lat, lon, radiusKm) =>
          d3.geoCircle()
            .center([lon, lat])
            .radius(radiusKm / 111)();

        const zoneData = zones.map(zone => {
          const color =
            zone.type === "tsunami"
              ? "blue"
              : zone.type === "earthquake"
              ? "red"
              : "gray";
          return { data: makeCircle(zone.latitude, zone.longitude, zone.scale * 50), color };
        });

        svg.append("g")
          .selectAll("path.zone")
          .data(zoneData)
          .join("path")
          .attr("class", "zone")
          .attr("d", d => path(d.data))
          .attr("fill", d => d.color)
          .attr("opacity", 0.4);

        // Draw impact points
        zones.forEach(zone => {
          const [x, y] = projection([zone.longitude, zone.latitude]);
          svg.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 5)
            .attr("fill", zone.type === "tsunami" ? "blue" : zone.type === "earthquake" ? "red" : "black");
        });
      });
  }, [zones, tsunami, earthquake]);

  return <svg ref={svgRef}></svg>;
}