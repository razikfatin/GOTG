import React, { useEffect, useRef, useMemo, useState } from "react";
import { Box, Heading, Text, SimpleGrid, Spinner } from "@chakra-ui/react";
import ImpactZoneMap from "../components/ImpactZoneMap";
import * as d3 from "d3";
import { feature } from "topojson-client";
import ApiService from "../components/utils/ApiService";

// ---------- D3 Globe Component ----------
function GlobeD3({ zones, colorByType }) {
  const ref = useRef(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const size = 420;
    svg.attr("viewBox", `0 0 ${size} ${size}`).style("width", "100%");

    const gRoot = svg.append("g");
    const gOcean = gRoot.append("g");
    const gLand = gRoot.append("g");
    const gGraticule = gRoot.append("g");
    const gClipped = gRoot.append("g");
    const gPoints = gClipped.append("g");

    const projection = d3
      .geoOrthographic()
      .translate([size / 2, size / 2])
      .scale(size * 0.46)
      .clipAngle(90)
      .rotate([0, -20]);

    const path = d3.geoPath(projection);
    const graticule = d3.geoGraticule10();

    gOcean
      .append("path")
      .datum({ type: "Sphere" })
      .attr("d", path)
      .attr("fill", "#3A86FF");

    const clipId = "globe-clip";
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", clipId)
      .append("path")
      .datum({ type: "Sphere" })
      .attr("d", path);

    gClipped.attr("clip-path", `url(#${clipId})`);

    gGraticule
      .append("path")
      .datum(graticule)
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#A0AEC0")
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", 0.6);

    const worldUrl =
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

    let lambda = 0;
    let phi = -20;
    const spinSpeed = 0.015;
    let spinning;

    const redraw = (landGeo) => {
      svg.select(`#${clipId} path`).attr("d", path);
      gOcean.select("path").attr("d", path);
      gGraticule.select("path").attr("d", path);

      if (landGeo) {
        const landSel = gClipped.selectAll("path.land").data(landGeo.features);
        landSel
          .join("path")
          .attr("class", "land")
          .attr("d", path)
          .attr("fill", "#5DBB63")
          .attr("stroke", "#3A506B")
          .attr("stroke-width", 0.5);
      }

      const pts = gPoints.selectAll("circle.zone").data(zones, (d) => d.id);
      pts
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("class", "zone")
              .attr("r", (d) => 2 + Math.max(0, (d.scale || 0) - 4))
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
      spinning = d3.timer(() => {
        lambda = (lambda + spinSpeed) % 360;
        projection.rotate([lambda, phi]);
        redraw(landGeo);
      });
    };

    const stopSpin = () => {
      if (spinning) spinning.stop();
      spinning = null;
    };

    let last = null;
    const sensitivity = 0.25;
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
          phi = Math.max(-89, Math.min(89, phi));
          projection.rotate([lambda, phi]);
          redraw();
        })
        .on("end", () => startSpin())
    );

    fetch(worldUrl)
      .then((r) => r.json())
      .then((topology) => {
        const land = feature(topology, topology.objects.countries);
        redraw(land);
        startSpin(land);
      })
      .catch(() => {
        redraw();
        startSpin();
      });

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

// ---------- MAIN PAGE ----------
export default function Results() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [impactLoading, setImpactLoading] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [impactData, setImpactData] = useState(null);

  // Fetch nearby earthquake/tsunami data
  useEffect(() => {
    const fetchNearbyEarthquakes = async () => {
      try {
        const storedAsteroid = JSON.parse(localStorage.getItem("selectedAsteroid"));
        if (!storedAsteroid || !storedAsteroid.latlong) return;

        const [latString, longString] = storedAsteroid.latlong;
        const lat = parseFloat(latString);
        const lon = parseFloat(longString);

        const response = await ApiService.get(`earthquakes/nearby?lat=${lat}&lon=${lon}`);
        setZones(response);
        setApiResponse(response);
        console.log("Nearby earthquake data:", response);
      } catch (error) {
        console.error("Error fetching nearby earthquakes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyEarthquakes();
  }, []);

  useEffect(() => {
    const fetchPopulationImpact = async () => {
      if (!zones || zones.length === 0) return;
      setImpactLoading(true);
      try {
        const payload = {
          locations: zones.map((z) => ({
            lat: z.lat,
            lon: z.lon,
          })),
        };
        const response = await ApiService.post("get_population_and_impact_multiple", payload);
        console.log("Population & impact data:", response);
        setImpactData(response);
      } catch (error) {
        console.error("Error fetching population and impact data:", error);
      } finally {
        setImpactLoading(false);
      }
    };
    fetchPopulationImpact();
  }, [zones]);

  // Normalize for globe
  const globeZones = useMemo(
    () =>
      zones.map((z, i) => ({
        id: z.id ?? i,
        latitude: z.lat,
        longitude: z.lon,
        scale: z.magnitude,
        type: z.tsunami ? "tsunami" : "earthquake",
        name: z.title,
      })),
    [zones]
  );

  const colorByType = (t = "") =>
    t.toLowerCase() === "tsunami"
      ? "#3182CE"
      : t.toLowerCase() === "earthquake"
      ? "#E53E3E"
      : "#805AD5";

  return (
    <Box p={10}>
      <Heading textAlign="center" mb={2}>
        🌎 Nearby Impact Zone Visualization
      </Heading>
      <Text textAlign="center" color="gray.600" mb={8}>
        Live visualization of nearby earthquakes and tsunami zones detected around your selected asteroid’s impact location.
      </Text>

      {(loading || impactLoading) ? (
        <Box textAlign="center" my={10}>
          <Spinner size="xl" color="blue.400" thickness="4px" speed="0.7s" />
          <Text mt={3} color="gray.400" fontSize="lg">
            Analyzing asteroid impact patterns...
          </Text>
        </Box>
      ) : zones.length === 0 ? (
        <Text textAlign="center" color="gray.500" my={6}>
          No nearby earthquake or tsunami data found.
        </Text>
      ) : (
        <>
          {/* Map + Globe */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="start">
            <Box>
              <ImpactZoneMap zones={zones} colorByType={colorByType} />
            </Box>

            <Box>
              <GlobeD3 zones={globeZones} colorByType={colorByType} />
            </Box>
          </SimpleGrid>

          {impactData && (
            <Box
              mt={12}
              bg="rgba(17, 24, 39, 0.8)"
              p={8}
              borderRadius="2xl"
              boxShadow="0 0 30px rgba(255,255,255,0.05)"
              color="whiteAlpha.900"
              backdropFilter="blur(12px)"
            >
              <Heading size="md" mb={4} color="whiteAlpha.900" textAlign="center" letterSpacing="wide">
                🌍 Population Impact Overview
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Box
                  textAlign="center"
                  bg="rgba(31, 41, 55, 0.9)"
                  borderRadius="xl"
                  p={6}
                  border="1px solid rgba(255,255,255,0.1)"
                  boxShadow="0 0 25px rgba(0,0,0,0.4)"
                  transition="transform 0.3s ease"
                  _hover={{ transform: "translateY(-6px)", boxShadow: "0 0 35px rgba(99,102,241,0.3)" }}
                >
                  <Text fontSize="lg" fontWeight="semibold" color="green.300">
                    Estimated Population Saved
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" mt={2} color="white">
                    {Math.round(
                      impactData.total_population - impactData.impact_effects.estimated_population_effect
                    ).toLocaleString()}
                  </Text>
                </Box>

                <Box
                  textAlign="center"
                  bg="rgba(31, 41, 55, 0.9)"
                  borderRadius="xl"
                  p={6}
                  border="1px solid rgba(255,255,255,0.1)"
                  boxShadow="0 0 25px rgba(0,0,0,0.4)"
                  transition="transform 0.3s ease"
                  _hover={{ transform: "translateY(-6px)", boxShadow: "0 0 35px rgba(99,102,241,0.3)" }}
                >
                  <Text fontSize="lg" fontWeight="semibold" color="red.300">
                    Fatalities
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" mt={2} color="white">
                    {impactData.impact_effects.fatalities}
                  </Text>
                </Box>

                <Box
                  textAlign="center"
                  bg="rgba(31, 41, 55, 0.9)"
                  borderRadius="xl"
                  p={6}
                  border="1px solid rgba(255,255,255,0.1)"
                  boxShadow="0 0 25px rgba(0,0,0,0.4)"
                  transition="transform 0.3s ease"
                  _hover={{ transform: "translateY(-6px)", boxShadow: "0 0 35px rgba(99,102,241,0.3)" }}
                >
                  <Text fontSize="lg" fontWeight="semibold" color="orange.300">
                    Shock Wave Impact
                  </Text>
                  <Text fontSize="md" fontWeight="medium" mt={2} color="white">
                    {impactData.impact_effects.shock_wave}
                  </Text>
                </Box>
              </SimpleGrid>

              <Box mt={10}>
                <Heading size="sm" mb={3} color="whiteAlpha.900" letterSpacing="wide">
                  📊 Total Population vs Impacted Population
                </Heading>
                <Box height="220px" position="relative">
                  <svg width="100%" height="220">
                    <defs>
                      <linearGradient id="gradImpact" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                    <rect
                      x="50"
                      y="60"
                      width="400"
                      height="40"
                      fill="rgba(255,255,255,0.1)"
                      rx="10"
                    />
                    <rect
                      x="50"
                      y="60"
                      width={
                        (impactData.impact_effects.estimated_population_effect /
                          impactData.total_population) *
                        400
                      }
                      height="40"
                      fill="url(#gradImpact)"
                      rx="10"
                    />
                    <text
                      x="50"
                      y="120"
                      fill="#CBD5E0"
                      fontSize="14"
                      fontWeight="600"
                    >
                      Total Population: {Math.round(impactData.total_population).toLocaleString()}
                    </text>
                    <text
                      x="50"
                      y="140"
                      fill="#90CDF4"
                      fontSize="14"
                      fontWeight="600"
                    >
                      Saved: {Math.round(
                        impactData.total_population - impactData.impact_effects.estimated_population_effect
                      ).toLocaleString()} ({(
                        ((impactData.total_population - impactData.impact_effects.estimated_population_effect) /
                          impactData.total_population) *
                        100
                      ).toFixed(2)}%)
                    </text>
                  </svg>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}