// src/components/Impactor2025.jsx
import React, { useEffect, useState } from "react";
import { Box, Text, Heading } from "@chakra-ui/react";
import ApiService from "../components/utils/ApiService";

/** Fresh semicircle gauge (1–10) with a precise needle.
 *  - Full colorful arc (green→yellow→red)
 *  - Needle points to exact value on a 1..10 scale
 *  - Pure SVG; Chakra v3–safe
 */
function Gauge({ value, min = 0, max = 10, thickness = 26, width = 360 }) {
  const W = width;
  const H = Math.round(width * 0.5);
  const cx = W / 2;
  const cy = H - thickness / 2;
  const r = Math.min(W / 2 - thickness / 2, H - thickness);

  // clamp and map 0..10 → 180° (left to right)
  const v = Math.max(min, Math.min(max, value));
  const t = (v - min) / (max - min);
  const A_START = Math.PI; // 180°
  const A_END = 0; //   0°
  const angle = A_START + (A_END - A_START) * t;

  // helper for XY
  const toXY = (ang, rr = r) => [cx + rr * Math.cos(ang), cy - rr * Math.sin(ang)];

  const arcPath = (a0, a1) => {
    const [x0, y0] = toXY(a0);
    const [x1, y1] = toXY(a1);
    const largeArc = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}`;
  };

  const fullArc = arcPath(A_START, A_END);

  const needleLen = r - thickness * 0.35;
  const [tipX, tipY] = toXY(angle, needleLen);
  const [tailX, tailY] = toXY(angle + Math.PI, 15);
  const hubR = 8;

  return (
    <Box w="100%" maxW={`${W}px`} userSelect="none">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="Gauge 0–10">
        <defs>
          <linearGradient id="gaugeArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* base + colored arc */}
        <path
          d={fullArc}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        <path
          d={fullArc}
          fill="none"
          stroke="url(#gaugeArc)"
          strokeWidth={thickness}
          strokeLinecap="round"
          filter="url(#arcGlow)"
        />

        {/* needle */}
        <line
          x1={tailX}
          y1={tailY}
          x2={tipX}
          y2={tipY}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={hubR} fill="white" />
        <circle cx={cx} cy={cy} r={hubR - 2} fill="black" />
      </svg>
    </Box>
  );
}

export default function Impactor2025() {
  const [energyData, setEnergyData] = useState(null);

  useEffect(() => {
    const fetchEnergyData = async () => {
      try {
        const data = await ApiService.get("energy?id=54016489");
        setEnergyData(data);
      } catch (error) {
        console.error("Error fetching energy data:", error);
      }
    };
    fetchEnergyData();
  }, []);

  const value = energyData ? energyData.nominal.impact_index : 0;

  return (
    <Box color="white" pt={6} pb={12} transform="translateY(-30px)">
      <Box maxW="7xl" px={6} mx="auto">
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={6}
          gap="12px"
        >
          <Heading
            size="2xl"
            fontWeight="semibold"
            letterSpacing="wide"
            textAlign="center"
          >
            (2021 SZ4)
          </Heading>
          <Box
            as="span"
            px="10px"
            py="2px"
            borderRadius="9999px"
            bg="whiteAlpha.200"
            backdropFilter="blur(4px)"
            fontSize="sm"
            lineHeight="1.4"
          >
            {energyData ? (energyData.input.is_hazardous ? "High" : "Low") : "Loading..."}
          </Box>
        </Box>

        {/* Two cards */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
          gap="28px"
        >
          {/* Gauge card */}
          <Box
            bg="rgba(255,255,255,0.03)"
            border="1px solid rgba(255,255,255,0.08)"
            borderRadius="2xl"
            p={6}
            h="440px"
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="center"
          >
            <Gauge value={value} min={1} max={10} />

            <Text
              fontSize="5xl"
              fontWeight="extrabold"
              lineHeight="1"
              color="cyan.300"
              mt="6px"
              mb="6px"
            >
              {energyData ? energyData.nominal.impact_index.toFixed(1) : "—"}
            </Text>

            <Text fontSize="md" fontWeight="medium" color="whiteAlpha.800" textAlign="center">
              Disruption Scale (1–10)
            </Text>
            <Text fontSize="sm" color="whiteAlpha.600" mt={2} textAlign="center">
              Estimated planetary disruption index from live energy model.
            </Text>
          </Box>

          {/* Parameters card */}
          <Box
            bg="rgba(255,255,255,0.03)"
            border="1px solid rgba(255,255,255,0.08)"
            borderRadius="2xl"
            p={6}
            h="440px"
            display="flex"
            flexDir="column"
            justifyContent="center"
          >
            <Heading
              size="sm"
              mb={4}
              color="whiteAlpha.900"
              fontWeight="semibold"
              letterSpacing="wide"
            >
              Current Parameters
            </Heading>

            <Box display="grid" rowGap="14px">
              {/* Time of Impact */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text color="whiteAlpha.700">Time of Impact</Text>
                <Text fontWeight="bold" color="whiteAlpha.900">
                  2025-10-14 16:32 UTC
                </Text>
              </Box>
              <Box h="1px" bg="whiteAlpha.200" />

              {/* Speed */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text color="whiteAlpha.700">Speed at Entry</Text>
                <Text fontWeight="bold" color="whiteAlpha.900">
                  {energyData
                    ? (energyData.nominal.velocity_m_s / 1000).toFixed(2) + " km/s"
                    : "Loading..."}
                </Text>
              </Box>
              <Box h="1px" bg="whiteAlpha.200" />

              {/* Diameter */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text color="whiteAlpha.700">Estimated Diameter</Text>
                <Text fontWeight="bold" color="whiteAlpha.900">
                  {energyData
                    ? (energyData.input.diameter_km_avg * 1000).toFixed(0) + " m"
                    : "Loading..."}
                </Text>
              </Box>
              <Box h="1px" bg="whiteAlpha.200" />

              {/* Mass */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text color="whiteAlpha.700">Mass</Text>
                <Text fontWeight="bold" color="whiteAlpha.900">
                  {energyData
                    ? energyData.nominal.mass_kg.toExponential(3) + " kg"
                    : "Loading..."}
                </Text>
              </Box>
              <Box h="1px" bg="whiteAlpha.200" />

              {/* Kinetic Energy */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text color="whiteAlpha.700">Kinetic Energy</Text>
                <Text fontWeight="bold" color="whiteAlpha.900">
                  {energyData
                    ? energyData.nominal.kinetic_energy_megatons.toFixed(1) + " Mt TNT"
                    : "Loading..."}
                </Text>
              </Box>
              <Box h="1px" bg="whiteAlpha.200" />

              {/* Impact Index */}
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text color="whiteAlpha.700">Impact Index</Text>
                <Text fontWeight="bold" color="whiteAlpha.900">
                  {energyData
                    ? energyData.nominal.impact_index.toFixed(1)
                    : "Loading..."}
                </Text>
              </Box>
            </Box>

            <Text fontSize="xs" color="whiteAlpha.500" mt={5} textAlign="center">
              *Live data powered by backend energy model.
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}