import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function ImpactZoneMap({
  zones = [],
  tsunami = false,
  earthquake = false,
  colorByType, // optional: pass from parent to keep globe/map palette consistent
}) {
  const svgRef = useRef();

  useEffect(() => {
    const svgEl = svgRef.current;
    const container = svgEl.parentNode;

    // --- 1) NORMALIZE INPUT ---------------------------------------
    // Accepts:
    // - Your original shape: { latitude, longitude, scale, type, name, ... }
    // - USGS-like shape: { lat, lon, magnitude, place/title, tsunami(0/1), url, distance_km }
    const normalizedZones = zones.map((z, i) => {
      const latitude = z.latitude ?? z.lat;
      const longitude = z.longitude ?? z.lon;
      const scale = z.scale ?? z.magnitude ?? null;
      const name = z.name ?? z.title ?? z.place ?? `Impact ${i + 1}`;
      const type =
        (z.type ??
          (z.tsunami && Number(z.tsunami) > 0 ? "tsunami" : "earthquake"))?.toLowerCase() || "other";
      return {
        id: z.id ?? i,
        latitude,
        longitude,
        scale,
        type,
        name,
        url: z.url,
        distance_km: z.distance_km,
        raw: z,
      };
    });

    // --- 2) SIZING -------------------------------------------------
    const width = Math.max(600, container.clientWidth || 800);
    const height = Math.round(width * 0.62);

    const svg = d3.select(svgEl).attr("viewBox", `0 0 ${width} ${height}`).style("width", "100%");
    svg.selectAll("*").remove();

    // --- 3) TOOLTIP (HTML overlay) --------------------------------
    const tooltip = d3
      .select(container)
      .style("position", "relative")
      .append("div")
      .attr("class", "impact-tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("padding", "8px 10px")
      .style("background", "rgba(16,24,40,0.9)")
      .style("color", "#fff")
      .style("borderRadius", "8px")
      .style("font", "12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif")
      .style("boxShadow", "0 6px 18px rgba(0,0,0,0.25)")
      .style("opacity", 0);

    // --- 4) DEFS (filters + gradients) -----------------------------
    const defs = svg.append("defs");

    // Soft glow
    const filter = defs
      .append("filter")
      .attr("id", "softGlow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", 3).attr("result", "blur");
    filter.append("feMerge").selectAll("feMergeNode").data(["blur", "SourceGraphic"]).join("feMergeNode").attr("in", (d) => d);

    // Palette
    const palette = (t) => {
      if (colorByType) return colorByType(t);
      switch ((t || "").toLowerCase()) {
        case "tsunami":
          return "#3182CE";
        case "earthquake":
          return "#E53E3E";
        case "volcano":
          return "#DD6B20";
        default:
          return "#805AD5";
      }
    };

    const types = Array.from(new Set(normalizedZones.map((z) => z.type)));
    const ensureTypes = types.length ? types : ["earthquake"];
    ensureTypes.forEach((t) => {
      const id = `radial-${t}`;
      const g = defs.append("radialGradient").attr("id", id);
      g.append("stop").attr("offset", "0%").attr("stop-color", palette(t)).attr("stop-opacity", 0.6);
      g.append("stop").attr("offset", "70%").attr("stop-color", palette(t)).attr("stop-opacity", 0.18);
      g.append("stop").attr("offset", "100%").attr("stop-color", palette(t)).attr("stop-opacity", 0);
    });

    // --- 5) LAYERS -------------------------------------------------
    const gRoot = svg.append("g");
    const gZoom = gRoot.append("g"); // zoomable container
    const gMap = gZoom.append("g");
    const gGraticule = gZoom.append("g");
    const gZones = gZoom.append("g");
    const gPoints = gZoom.append("g").attr("filter", "url(#softGlow)");
    const gLegend = svg.append("g");
    const gHUD = svg.append("g");

    // --- 6) PROJECTION / PATH / ZOOM -------------------------------
    const projection = d3
      .geoMercator()
      .center([0, 20])
      .scale((width / (2 * Math.PI)) * 1.15)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath(projection);
    const graticule = d3.geoGraticule10();

    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => gZoom.attr("transform", event.transform));
    svg.call(zoom);

    // helpers
    const toKmRadius = (scaleVal) => Math.max(30, (scaleVal || 0) * 50); // km
    const circleGeom = (lat, lon, radiusKm) => d3.geoCircle().center([lon, lat]).radius(radiusKm / 111)(); // 111km ≈ 1°
    const fmt1 = d3.format(".1f");
    const fmt0 = d3.format(".0f");

    const visibilityByType = new Map(ensureTypes.map((t) => [t, true]));

    // --- 7) DRAW WORLD --------------------------------------------
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then((world) => {
      // continent color scale (light pastel, neutral background)
      const continentColors = {
        Africa: "#FFF4B3",        // light yellow
        Asia: "#FFD6A5",          // soft peach
        Europe: "#A0E7E5",        // pastel aqua
        North_America: "#B5E48C", // light green
        South_America: "#FFAFCC", // pastel pink
        Oceania: "#BDE0FE",       // sky blue
        Antarctica: "#E2E2E2",    // soft gray
      };

      // land
      gMap
        .selectAll("path.land")
        .data(world.features)
        .join("path")
        .attr("class", "land")
        .attr("d", path)
        .attr("fill", (d) => continentColors[d.properties.continent] || "#CBD5E1")
        .attr("stroke", "#1E293B")
        .attr("stroke-width", 0.6)
        .attr("opacity", 0.95);

      // graticule
      gGraticule
        .append("path")
        .datum(graticule)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#CBD5E1")
        .attr("stroke-opacity", 0.7)
        .attr("stroke-width", 0.6)
        .attr("stroke-dasharray", "2 3");

      // zones (filled radial gradients)
      const zonesGeo = normalizedZones.map((z) => ({
        ...z,
        _geom: circleGeom(z.latitude, z.longitude, toKmRadius(z.scale || 0)),
      }));

      gZones
        .selectAll("path.zone")
        .data(zonesGeo, (d) => d.id)
        .join("path")
        .attr("class", "zone")
        .attr("d", (d) => path(d._geom))
        .attr("fill", (d) => `url(#radial-${d.type})`)
        .attr("opacity", 0.55)
        .attr("stroke", (d) => palette(d.type))
        .attr("stroke-width", 0.8)
        .attr("pointer-events", "none");

      // points (dot + pulsing ring)
      const pointG = gPoints
        .selectAll("g.point")
        .data(zonesGeo, (d) => d.id)
        .join((enter) => {
          const g = enter.append("g").attr("class", "point");
          g.append("circle").attr("class", "dot").attr("r", 4);
          g.append("circle").attr("class", "pulse").attr("r", 4);
          return g;
        });

      const position = (sel) =>
        sel.attr("transform", (d) => {
          const [x, y] = projection([d.longitude, d.latitude]);
          return `translate(${x},${y})`;
        });

      position(pointG);

      pointG
        .select("circle.dot")
        .attr("fill", (d) => palette(d.type))
        .attr("stroke", "white")
        .attr("stroke-width", 1.2);

      // pulsing animation based on magnitude
      const pulseOnce = (sel, maxR) =>
        sel
          .attr("fill", "none")
          .attr("stroke", (d) => palette(d.type))
          .attr("stroke-width", 2)
          .attr("opacity", 0.6)
          .transition()
          .duration(2000)
          .ease(d3.easeCubicOut)
          .attr("r", maxR)
          .attr("opacity", 0)
          .on("end", function () {
            d3.select(this).attr("r", 4).call(pulseOnce, maxR);
          });

      pointG.each(function (d) {
        const maxR = 18 + Math.max(0, (d.scale || 0) - 4) * 3; // bigger pulse for higher mag
        d3.select(this).select("circle.pulse").interrupt().attr("r", 4).call(pulseOnce, maxR);
      });

      // interactions: hover
      pointG
        .on("mouseenter", function (event, d) {
          d3.select(this).raise();
          d3.select(this).select("circle.dot").transition().duration(150).attr("r", 7);
          const [x, y] = d3.pointer(event, container);
          const icon = d.type === "tsunami" ? "🌊" : d.type === "earthquake" ? "🌋" : "🛰️";
          const link = d.url
            ? `<div style="margin-top:6px"><a href="${d.url}" target="_blank" rel="noopener" style="color:#93c5fd;text-decoration:underline;">Open USGS page</a></div>`
            : "";
          const distance = d.distance_km != null ? ` · ${fmt0(d.distance_km)} km away` : "";
          tooltip
            .style("left", `${x + 12}px`)
            .style("top", `${y + 12}px`)
            .style("opacity", 1)
            .html(
              `<div style="font-weight:600;margin-bottom:4px;">${icon} ${d.name}</div>
               <div style="opacity:.9">${d.type.toUpperCase()} · M${d.scale ? fmt1(d.scale) : "–"}${distance}</div>
               <div style="opacity:.8">Lat/Lon: ${fmt1(d.latitude)}, ${fmt1(d.longitude)}</div>
               ${link}`
            );
        })
        .on("mousemove", function (event) {
          const [x, y] = d3.pointer(event, container);
          tooltip.style("left", `${x + 12}px`).style("top", `${y + 12}px`);
        })
        .on("mouseleave", function () {
          d3.select(this).select("circle.dot").transition().duration(150).attr("r", 4);
          tooltip.transition().duration(150).style("opacity", 0);
        })
        // click to fly-to (zoom & center)
        .on("click", function (event, d) {
          const [x, y] = projection([d.longitude, d.latitude]);
          const scale = 3;
          const t = d3.zoomIdentity.translate(width / 2 - x * scale, height / 2 - y * scale).scale(scale);
          svg.transition().duration(1200).ease(d3.easeCubicOut).call(zoom.transform, t);
        });

      // --- legend (toggle types) ---
      const legendPad = 10;
      const itemH = 20;
      const legend = gLegend
        .attr("transform", `translate(${width - 180}, ${12})`)
        .selectAll("g.leg")
        .data(ensureTypes)
        .join("g")
        .attr("class", "leg")
        .attr("transform", (_, i) => `translate(0, ${i * (itemH + 8)})`)
        .style("cursor", "pointer")
        .on("click", function (_event, t) {
          const now = !visibilityByType.get(t);
          visibilityByType.set(t, now);

          d3.select(this).select("rect.swatch").attr("opacity", now ? 1 : 0.25);
          d3.select(this).select("text").attr("opacity", now ? 1 : 0.35);

          gPoints.selectAll("g.point").attr("display", (d) => (visibilityByType.get(d.type) ? null : "none"));
          gZones.selectAll("path.zone").attr("display", (d) => (visibilityByType.get(d.type) ? null : "none"));
        });

      legend
        .append("rect")
        .attr("class", "swatch")
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 4)
        .attr("width", itemH)
        .attr("height", itemH)
        .attr("fill", (t) => palette(t));

      legend
        .append("text")
        .attr("x", itemH + 8)
        .attr("y", itemH - 5)
        .attr("font-size", 12)
        .attr("font-weight", 600)
        .attr("fill", "#0f172a")
        .text((t) => t.charAt(0).toUpperCase() + t.slice(1));

      // legend backdrop
      const box = gLegend.node().getBBox();
      gLegend
        .insert("rect", ":first-child")
        .attr("x", box.x - legendPad)
        .attr("y", box.y - legendPad)
        .attr("width", box.width + legendPad * 2)
        .attr("height", box.height + legendPad * 2)
        .attr("rx", 10)
        .attr("fill", "rgba(255,255,255,0.8)")
        .attr("stroke", "#cbd5e1");

      // --- HUD: reset + flags ---
      const btn = gHUD
        .append("g")
        .attr("transform", `translate(${12}, ${12})`)
        .style("cursor", "pointer")
        .on("click", () => svg.transition().duration(900).ease(d3.easeCubicOut).call(zoom.transform, d3.zoomIdentity));

      btn
        .append("rect")
        .attr("width", 90)
        .attr("height", 30)
        .attr("rx", 8)
        .attr("fill", "rgba(255,255,255,0.9)")
        .attr("stroke", "#cbd5e1");

      btn
        .append("text")
        .attr("x", 45)
        .attr("y", 20)
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
        .attr("fill", "#0f172a")
        .text("Reset view");

      const flags = [
        tsunami ? { label: "Tsunami present", color: palette("tsunami") } : null,
        earthquake ? { label: "Earthquake present", color: palette("earthquake") } : null,
      ].filter(Boolean);

      if (flags.length) {
        const fg = gHUD.append("g").attr("transform", `translate(${12}, ${52})`);
        flags.forEach((f, i) => {
          const y = i * 26;
          fg.append("rect").attr("x", 0).attr("y", y).attr("width", 160).attr("height", 22).attr("rx", 6).attr("fill", f.color).attr("opacity", 0.12);
          fg
            .append("circle")
            .attr("cx", 12)
            .attr("cy", y + 11)
            .attr("r", 5)
            .attr("fill", f.color)
            .attr("stroke", "white")
            .attr("stroke-width", 1);
          fg.append("text").attr("x", 24).attr("y", y + 15).attr("font-size", 12).attr("fill", "#0f172a").text(f.label);
        });
      }
    });

    return () => {
      tooltip.remove();
    };
  }, [zones, tsunami, earthquake, colorByType]);

  return <svg ref={svgRef} role="img" aria-label="Interactive impact zone world map" />;
}