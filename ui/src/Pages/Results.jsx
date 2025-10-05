import React, { useEffect, useRef, useMemo } from "react";
import { Box, Heading, Text, SimpleGrid } from "@chakra-ui/react";
import ImpactZoneMap from "../components/ImpactZoneMap";
import * as d3 from "d3";
import { feature } from "topojson-client";

// ---------- D3 Globe (inline component) ----------
function GlobeD3({ zones, colorByType }) {
  const ref = useRef(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // Sizing
    const size = 420; // canvas size in px (square)
    svg.attr("viewBox", `0 0 ${size} ${size}`).style("width", "100%");

    // Groups
    const gRoot = svg.append("g");
    const gOcean = gRoot.append("g");
    const gLand = gRoot.append("g");
    const gGraticule = gRoot.append("g");
    const gClipped = gRoot.append("g"); // everything clipped to the sphere
    const gPoints = gClipped.append("g");

    // Projection / path
    const projection = d3
      .geoOrthographic()
      .translate([size / 2, size / 2])
      .scale(size * 0.46)
      .clipAngle(90) // clip back hemisphere
      .rotate([0, -20]); // a little tilt

    const path = d3.geoPath(projection);
    const graticule = d3.geoGraticule10();

    // Ocean (the sphere)
    gOcean
      .append("path")
      .datum({ type: "Sphere" })
      .attr("d", path)
      .attr("fill", "#3A86FF"); // brighter ocean blue

    // Clip path so points/land don’t draw outside the sphere
    const clipId = "globe-clip";
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", clipId)
      .append("path")
      .datum({ type: "Sphere" })
      .attr("d", path);

    gClipped.attr("clip-path", `url(#${clipId})`);

    // Graticule
    gGraticule
      .append("path")
      .datum(graticule)
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#A0AEC0")
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", 0.6);

    // Fetch and draw land (countries)
    const worldUrl =
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

    let lambda = 0; // current rotation around Y
    let phi = -20;  // current tilt
    const spinSpeed = 0.015; // degrees per ms
    let spinning;  // d3.timer

    const redraw = (landGeo) => {
      // Update ocean + clip path
      svg.select(`#${clipId} path`).attr("d", path);
      gOcean.select("path").attr("d", path);
      gGraticule.select("path").attr("d", path);

      // Land
      if (landGeo) {
        const landSel = gClipped.selectAll("path.land").data(landGeo.features);
        landSel
          .join("path")
          .attr("class", "land")
          .attr("d", path)
          .attr("fill", "#5DBB63") // bright greenish-blue for land
          .attr("stroke", "#3A506B")
          .attr("stroke-width", 0.5);
      } else {
        gClipped.selectAll("path.land").attr("d", path);
      }

      // Points
      const pts = gPoints.selectAll("circle.zone").data(zones, (d) => d.id);
      pts
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("class", "zone")
              .attr("r", (d) => 2 + Math.max(0, (d.scale || 0) - 4)) // size ~ scale
              .attr("fill", (d) => colorByType(d.type))
              .attr("stroke", "white")
              .attr("stroke-width", 0.6)
              .attr("opacity", 0.95)
              .append("title")
              .text(
                (d) =>
                  `${d.name}\n${d.type} · M${d.scale ?? "–"}\n(${d.latitude}, ${d.longitude})`
              ),
          (update) => update,
          (exit) => exit.remove()
        )
        .attr("cx", (d) => projection([d.longitude, d.latitude])[0])
        .attr("cy", (d) => projection([d.longitude, d.latitude])[1]);
    };

    const startSpin = (landGeo) => {
      stopSpin();
      spinning = d3.timer((elapsed) => {
        lambda = (lambda + spinSpeed) % 360;
        projection.rotate([lambda, phi]);
        redraw(landGeo);
      });
    };
    const stopSpin = () => {
      if (spinning) spinning.stop();
      spinning = null;
    };

    // Drag to rotate
    let last = null;
    const sensitivity = 0.25; // deg per px
    svg.call(
      d3
        .drag()
        .on("start", (event) => {
          stopSpin();
          last = [event.x, event.y];
        })
        .on("drag", (event) => {
          const dx = event.x - last[0];
          const dy = event.y - last[1];
          last = [event.x, event.y];
          lambda += dx * sensitivity;
          phi -= dy * sensitivity;
          phi = Math.max(-89, Math.min(89, phi)); // clamp tilt
          projection.rotate([lambda, phi]);
          redraw(); // incremental redraw
        })
        .on("end", () => {
          // resume gentle spin
          startSpin();
        })
    );

    // Load world + first draw + start spin
    fetch(worldUrl)
      .then((r) => r.json())
      .then((topology) => {
        const land = feature(topology, topology.objects.countries);
        redraw(land);
        startSpin(land);
      })
      .catch(() => {
        // draw without land if fetch fails
        redraw();
        startSpin();
      });

    // Cleanup on unmount
    return () => stopSpin();
  }, [zones, colorByType]);

  return (
    <svg
      ref={ref}
      role="img"
      aria-label="Rotating D3 globe with impact zones"
      style={{ display: "block", maxWidth: "520px", marginInline: "auto" }}
    />
  );
}

// ---------- Your page ----------
export default function Results() {
  // --- USGS-like raw events (exactly as you shared) ---
  const usgsZones = [
    {
      distance_km: 295.71,
      lat: 50.5853,
      lon: 157.8643,
      magnitude: 6.8,
      place: "123 km E of Severo-Kuril’sk, Russia",
      title: "M 6.8 - 123 km E of Severo-Kuril’sk, Russia",
      tsunami: 1,
      url: "https://earthquake.usgs.gov/earthquakes/eventpage/us6000qxt4",
    },
    {
      distance_km: 376.83,
      lat: 53.4952,
      lon: 153.8486,
      magnitude: 4.3,
      place: "286 km NW of Ozernovskiy, Russia",
      title: "M 4.3 - 286 km NW of Ozernovskiy, Russia",
      tsunami: 0,
      url: "https://earthquake.usgs.gov/earthquakes/eventpage/us6000re60",
    },
    {
      distance_km: 224.35,
      lat: 54.6313,
      lon: 161.5996,
      magnitude: 4.2,
      place: "165 km SE of Atlasovo, Russia",
      title: "M 4.2 - 165 km SE of Atlasovo, Russia",
      tsunami: 0,
      url: "https://earthquake.usgs.gov/earthquakes/eventpage/us7000qv87",
    },
  ];

  // Normalize ONLY for the globe (ImpactZoneMap already normalizes internally)
  const globeZones = useMemo(
    () =>
      usgsZones.map((z, i) => {
        const type =
          z.tsunami && Number(z.tsunami) > 0 ? "tsunami" : "earthquake";
        return {
          id: z.id ?? i,
          latitude: z.lat,
          longitude: z.lon,
          scale: z.magnitude ?? null,
          type,
          name: z.title ?? z.place ?? `Impact ${i + 1}`,
          url: z.url,
          distance_km: z.distance_km,
          raw: z,
        };
      }),
    [usgsZones]
  );

  // Centralised colour mapping — SAME colours in both map & globe
  const colorByType = (t = "") => {
    switch (t.toLowerCase()) {
      case "tsunami":
        return "#3182CE"; // blue
      case "earthquake":
        return "#E53E3E"; // red
      case "volcano":
        return "#DD6B20"; // orange
      default:
        return "#805AD5"; // purple fallback
    }
  };

  // HUD flags for the map
  const hasTsunami = useMemo(
    () => usgsZones.some((z) => Number(z.tsunami) > 0),
    [usgsZones]
  );
  const hasEarthquake = useMemo(
    () => usgsZones.some((z) => !z.tsunami || Number(z.tsunami) === 0),
    [usgsZones]
  );

  const populationRef = useRef(null);
  const popSvgRef = useRef(null);

  useEffect(() => {
    const total = 1234567;
    const affected = 278234.55;
    const fatalityText = "60% fatalities";
    const shockText = "Severe structural damage likely";

    const svg = d3.select(popSvgRef.current);
    svg.selectAll("*").remove();

    const width = 420;
    const height = 120;
    const margin = { top: 40, right: 20, bottom: 40, left: 20 };

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const percent = affected / total;
    const barWidth = width - margin.left - margin.right;
    const barHeight = 30;

    // Base bar for total
    g.append("rect")
      .attr("width", barWidth)
      .attr("height", barHeight)
      .attr("fill", "#CBD5E0")
      .attr("rx", 8)
      .attr("ry", 8);

    // Gradient for affected portion
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "barGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#E53E3E");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#DD6B20");

    // Animated affected bar
    const affectedRect = g
      .append("rect")
      .attr("width", 0)
      .attr("height", barHeight)
      .attr("fill", "url(#barGradient)")
      .attr("rx", 8)
      .attr("ry", 8);

    affectedRect
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr("width", barWidth * percent);

    // Glow pulse
    const pulse = g
      .append("rect")
      .attr("width", 0)
      .attr("height", barHeight)
      .attr("fill", "none")
      .attr("stroke", "#E53E3E")
      .attr("stroke-width", 3)
      .attr("opacity", 0.5)
      .attr("rx", 8)
      .attr("ry", 8);

    function repeat() {
      pulse
        .attr("width", barWidth * percent)
        .attr("opacity", 0.5)
        .transition()
        .duration(1500)
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .on("end", repeat);
    }
    repeat();

    // Tooltip
    const tooltip = d3
      .select(populationRef.current)
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "8px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("transition", "opacity 0.3s ease");

    affectedRect
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX - 80 + "px")
          .style("top", event.pageY - 50 + "px")
          .style("opacity", 1)
          .html(
            `<strong>Total Population:</strong> ${Intl.NumberFormat().format(total)}<br/>
             <strong>Affected:</strong> ${Intl.NumberFormat().format(affected)}<br/>
             <strong>Fatalities:</strong> ${fatalityText}<br/>
             <strong>Shock Wave:</strong> ${shockText}`
          );
      })
      .on("mouseleave", () => tooltip.style("opacity", 0));

    // Labels
    g.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .attr("fill", "#2D3748")
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .text("Population Impact Overview");

    g.append("text")
      .attr("x", barWidth * percent + 10)
      .attr("y", barHeight / 2 + 5)
      .attr("fill", "#E53E3E")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text(`${(percent * 100).toFixed(1)}% affected`);

    g.append("text")
      .attr("x", 0)
      .attr("y", barHeight + 25)
      .attr("fill", "#4A5568")
      .attr("font-size", "13px")
      .text(
        `Total: ${Intl.NumberFormat().format(total)} | Affected: ${Intl.NumberFormat().format(affected)}`
      );
  }, []);

  return (
    <Box p={10}>
      <Heading textAlign="center" mb={2}>
        🌎 Impact Zone Visualization
      </Heading>
      <Text textAlign="center" color="gray.600" mb={8}>
        Visualizing recent impact events with dynamic scaling and disaster flags.
      </Text>

      {/* Map (left) + D3 Globe (right) */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="start">
        <Box>
          <ImpactZoneMap
            zones={usgsZones}                // pass raw USGS-style objects
            tsunami={hasTsunami}
            earthquake={hasEarthquake}
            colorByType={colorByType}        // keep palette consistent
          />
        </Box>

        <Box>
          <GlobeD3 zones={globeZones} colorByType={colorByType} />
        </Box>
      </SimpleGrid>

      {/* --- D3 Population Impact Visualization --- */}
      <Box mt={12} ref={populationRef}>
        <Heading size="md" textAlign="center" mb={4}>
          🧍 Interactive Population Impact Visualization
        </Heading>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt={4}
        >
          <svg
            ref={popSvgRef}
            width="380"
            height="380"
            role="img"
            aria-label="Population Impact D3 visualization"
          ></svg>
        </Box>
      </Box>
    </Box>
  );
}
