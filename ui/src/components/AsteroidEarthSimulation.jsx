import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function AsteroidEarthSimulation({ width = 600, height = 600, initialRotation = [0, -20], asteroid = { lat: 0, lon: 180, distance: 3, size: 16 }, autoRotateSpeed = 0.1, approachSpeed = 0.005, trajectory = { curvature: 0, angle: 0 } }) {
  const svgRef = useRef();

  useEffect(() => {

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove(); // clear previous render

    // Initial rotation
    let rotation = [...initialRotation]; // [longitude, latitude]

    // Orthographic (globe) projection
    const projection = d3.geoOrthographic()
      .scale(Math.min(width, height) * 0.4)
      .translate([width / 2, height / 2])
      .rotate(rotation);

    const path = d3.geoPath().projection(projection);

    // Globe outline (replace ocean circle with Earth image)
    const earthRadius = projection.scale();
    svg.append("image")
      .attr("href", "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg")
      .attr("x", width / 2 - earthRadius)
      .attr("y", height / 2 - earthRadius)
      .attr("width", earthRadius * 2)
      .attr("height", earthRadius * 2)
      .attr("clip-path", "url(#globe-clip)");

    // Define a clip path for the globe shape
    svg.append("clipPath")
      .attr("id", "globe-clip")
      .append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", earthRadius);

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

    // Group for asteroid
    const asteroidGroup = svg.append("g");

    // Group for asteroid trajectory line
    const asteroidTrajectory = svg.append("g");

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

    // Use asteroid from props
    let currentAsteroid = { ...asteroid };

    function render() {
      svg.select("image")
        .attr("width", projection.scale() * 2)
        .attr("height", projection.scale() * 2)
        .attr("x", width / 2 - projection.scale())
        .attr("y", height / 2 - projection.scale());

      svg.select("path")
        .attr("d", path);

      countriesGroup.selectAll("path")
        .attr("d", path);

      // Clear previous asteroid rendering
      asteroidGroup.selectAll("*").remove();
      asteroidTrajectory.selectAll("*").remove();

      // Calculate asteroid position using angle and distance
      const [cx, cy] = [width / 2, height / 2];
      const r = projection.scale();
      const angleRad = (trajectory.angle * Math.PI) / 180;
      const ax = cx + r * currentAsteroid.distance * Math.cos(angleRad);
      const ay = cy + r * currentAsteroid.distance * Math.sin(angleRad);

      // Render asteroid as image
      const asteroidSize = currentAsteroid.size || 16;
      asteroidGroup.append("image")
        .attr("href", "https://upload.wikimedia.org/wikipedia/commons/0/0f/Asteroid_243_Ida.jpg")
        .attr("x", ax - asteroidSize / 2)
        .attr("y", ay - asteroidSize / 2)
        .attr("width", asteroidSize)
        .attr("height", asteroidSize)
        .attr("preserveAspectRatio", "xMidYMid slice")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

      // Compute control point for quadratic Bézier curve
      const controlX = (cx + ax) / 2 + trajectory.curvature * 100;
      const controlY = (cy + ay) / 2 - trajectory.curvature * 100;

      // Render trajectory path from asteroid to Earth's center
      asteroidTrajectory.append("path")
        .attr("d", `M ${cx},${cy} Q ${controlX},${controlY} ${ax},${ay}`)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("stroke-dasharray", "5,5");
    }

    render();

  }, [width, height, initialRotation, asteroid, autoRotateSpeed, approachSpeed, trajectory]);

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}
// New: Asteroid Deflection Simulation (2D, not globe)
export function AsteroidDeflectionSim({
  width = 600,
  height = 600,
  asteroid = { distance: 3, angle: 0, size: 16 },
  deflectionAngle = 30,
}) {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    svg.selectAll("*").remove();

    // Center of canvas is Earth
    const cx = width / 2;
    const cy = height / 2;
    const earthRadius = Math.min(width, height) * 0.13;

    // Asteroid's starting position (polar coordinates)
    const r = earthRadius * asteroid.distance;
    const angleRad = (asteroid.angle * Math.PI) / 180;
    const ax = cx + r * Math.cos(angleRad);
    const ay = cy + r * Math.sin(angleRad);

    // Draw Earth as image
    svg.append("image")
      .attr("href", "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg")
      .attr("x", cx - earthRadius)
      .attr("y", cy - earthRadius)
      .attr("width", earthRadius * 2)
      .attr("height", earthRadius * 2)
      .attr("clip-path", "url(#earth-clip)");

    // Define clip path for Earth circle
    svg.append("clipPath")
      .attr("id", "earth-clip")
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", earthRadius);

    // Draw Asteroid as image
    const asteroidSize = asteroid.size || 16;
    svg.append("image")
      .attr("href", "https://upload.wikimedia.org/wikipedia/commons/0/0f/Asteroid_243_Ida.jpg")
      .attr("x", ax - asteroidSize / 2)
      .attr("y", ay - asteroidSize / 2)
      .attr("width", asteroidSize)
      .attr("height", asteroidSize)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5);

    const curvature = 0.3;

    // Draw incoming trajectory (red dashed quadratic Bézier path)
    const controlX = (ax + cx) / 2 + curvature * earthRadius;
    const controlY = (ay + cy) / 2 - curvature * earthRadius;
    svg.append("path")
      .attr("d", `M ${ax},${ay} Q ${controlX},${controlY} ${cx},${cy}`)
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("stroke-dasharray", "7,6");

    // Calculate deflected trajectory (green quadratic Bézier path) after passing Earth
    // Start at Earth's center, angle = asteroid.angle + deflectionAngle
    const deflectRad = ((asteroid.angle + deflectionAngle) * Math.PI) / 180;
    const deflectLength = r * 1.2;
    const dx = cx + deflectLength * Math.cos(deflectRad);
    const dy = cy + deflectLength * Math.sin(deflectRad);

    const controlDefX = (cx + dx) / 2 + curvature * earthRadius;
    const controlDefY = (cy + dy) / 2 - curvature * earthRadius;

    svg.append("path")
      .attr("d", `M ${cx},${cy} Q ${controlDefX},${controlDefY} ${dx},${dy}`)
      .attr("stroke", "green")
      .attr("stroke-width", 2.5)
      .attr("fill", "none")
      .attr("stroke-linecap", "round");

    // Optionally, add arrowheads for direction (simple triangle for green line)
    // Compute direction vector for arrowhead
    const arrowLen = 20;
    const arrowAngle = Math.PI / 8;
    const angleMain = deflectRad;
    const arrX1 = dx - arrowLen * Math.cos(angleMain - arrowAngle);
    const arrY1 = dy - arrowLen * Math.sin(angleMain - arrowAngle);
    const arrX2 = dx - arrowLen * Math.cos(angleMain + arrowAngle);
    const arrY2 = dy - arrowLen * Math.sin(angleMain + arrowAngle);
    svg.append("polygon")
      .attr("points", `${dx},${dy} ${arrX1},${arrY1} ${arrX2},${arrY2}`)
      .attr("fill", "green");
  }, [width, height, asteroid, deflectionAngle]);

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}

AsteroidDeflectionSim.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  asteroid: PropTypes.shape({
    distance: PropTypes.number,
    angle: PropTypes.number,
    size: PropTypes.number,
  }),
  deflectionAngle: PropTypes.number,
};