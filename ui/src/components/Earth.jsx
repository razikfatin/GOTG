import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function Globe() {
  const svgRef = useRef();

  useEffect(() => {
    const width = 600, height = 600;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove(); // clear previous render

    // Initial rotation
    let rotation = [0, -20]; // [longitude, latitude]
    let isDragging = false;
    let lastPos = null;

    // Orthographic (globe) projection
    const projection = d3.geoOrthographic()
      .scale(width / 2.3)
      .translate([width / 2, height / 2])
      .rotate(rotation);

    const path = d3.geoPath().projection(projection);

    // Globe outline (ocean circle)
    svg.append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", projection.scale())
      .attr("fill", "#1E90FF") // ocean blue
      .attr("stroke", "#000");

    // Graticule (lat/lon grid)
    const graticule = d3.geoGraticule10();
    svg.append("path")
      .datum(graticule)
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.7);

    // Group for countries
    const countriesGroup = svg.append("g");

    // Group for impacts
    const impactsGroup = svg.append("g");

    // Load world data (all countries)
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .then(world => {
        countriesGroup.selectAll("path")
          .data(world.features)
          .join("path")
          .attr("fill", "#f0f0f0") // land color
          .attr("stroke", "#333")  // borders
          .attr("stroke-width", 0.5);
        render();
      });

    // Sample impacts array: lat, lon, radius in degrees
    const impacts = [
      { lat: 34.0522, lon: -118.2437, radius: 5 },  // Los Angeles
      { lat: 40.7128, lon: -74.0060, radius: 3 },   // New York
      { lat: 51.5074, lon: -0.1278, radius: 4 },    // London
    ];

    function render() {
      svg.select("circle")
        .attr("r", projection.scale());

      svg.select("path")
        .attr("d", path);

      countriesGroup.selectAll("path")
        .attr("d", path);

      // Clear previous impact paths/dots
      impactsGroup.selectAll("*").remove();

      impacts.forEach(({lat, lon, radius}) => {
        // Create geoCircles for each severity level
        const severe = d3.geoCircle().center([lon, lat]).radius(radius)();
        const moderate = d3.geoCircle().center([lon, lat]).radius(radius * 0.6)();
        const light = d3.geoCircle().center([lon, lat]).radius(radius * 0.3)();

        // Append circles for each severity with colors and opacity
        impactsGroup.append("path")
          .datum(severe)
          .attr("d", path)
          .attr("fill", "red")
          .attr("opacity", 0.5)
          .attr("stroke", "none");

        impactsGroup.append("path")
          .datum(moderate)
          .attr("d", path)
          .attr("fill", "orange")
          .attr("opacity", 0.4)
          .attr("stroke", "none");

        impactsGroup.append("path")
          .datum(light)
          .attr("d", path)
          .attr("fill", "green")
          .attr("opacity", 0.3)
          .attr("stroke", "none");

        // Add small black dot at impact center
        const [x, y] = projection([lon, lat]) || [null, null];
        if (x !== null && y !== null) {
          impactsGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 3)
            .attr("fill", "black");
        }
      });
    }

    // Drag to rotate
    const drag = d3.drag()
      .on("start", (event) => {
        isDragging = true;
        lastPos = [event.x, event.y];
      })
      .on("drag", (event) => {
        if (!isDragging) return;
        const dx = event.x - lastPos[0];
        const dy = event.y - lastPos[1];
        rotation[0] += dx / 2;
        rotation[1] -= dy / 2;
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]));
        projection.rotate(rotation);
        render();
        lastPos = [event.x, event.y];
      })
      .on("end", () => {
        isDragging = false;
      });

    svg.call(drag);

    // Auto-rotation timer
    const timer = d3.timer(elapsed => {
      if (!isDragging) {
        rotation[0] += 0.1; // degrees per frame
        if (rotation[0] > 360) rotation[0] -= 360;
        projection.rotate(rotation);
        render();
      }
    });

    return () => {
      timer.stop();
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}