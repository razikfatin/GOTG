// src/components/Impactor2025.jsx
import React from "react";
import { Box, Text, Heading } from "@chakra-ui/react";

/** Fresh semicircle gauge (1–10) with a precise needle.
 *  - Full colorful arc (green→yellow→red), like your reference
 *  - Needle points to exact value on a 1..10 scale
 *  - Pure SVG; no external chart libs; Chakra v3–safe
 */
function Gauge({
  value,
  min = 0,          // 0..10 scale
  max = 10,
  thickness = 26,
  width = 360,
  showTicks = false,
}) {
  const W = width;
  const H = Math.round(width * 0.5);
  const cx = W / 2;
  const cy = H - thickness / 2;                 // pivot slightly above bottom
  const r  = Math.min(W / 2 - thickness / 2, H - thickness);

  // clamp and map 0..10 → 180° (left to right)
  const v = Math.max(min, Math.min(max, value));
  const t = (v - min) / (max - min);
  const A_START = Math.PI;                      // 180°
  const A_END   = 0;                            //   0°
  const angle   = A_START + (A_END - A_START) * t;

  // IMPORTANT: flip the Y sign for SVG coordinates
  const toXY = (ang, rr = r) => [cx + rr * Math.cos(ang), cy - rr * Math.sin(ang)];

  const arcPath = (a0, a1) => {
    const [x0, y0] = toXY(a0);
    const [x1, y1] = toXY(a1);
    const largeArc = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}`;
  };

  const fullArc = arcPath(A_START, A_END);

  // Needle geometry (blade + hub)
  const needleLen = r - thickness * 0.35;
  const [tipX, tipY]  = toXY(angle, needleLen);
  const [tailX, tailY] = toXY(angle + Math.PI, 15);
  const hubR = 8;

  // Optional ticks (off by default)
  const ticks = [];
  if (showTicks) {
    for (let i = min; i <= max; i++) {
      const tt = (i - min) / (max - min);
      const a = A_START + (A_END - A_START) * tt;
      const major = i === min || i === (min + max) / 2 || i === max;
      const outer = r + thickness / 2 + 4;
      const inner = outer - (major ? 16 : 10);
      const [ox, oy] = toXY(a, outer);
      const [ix, iy] = toXY(a, inner);
      ticks.push(
        <line
          key={i}
          x1={ix}
          y1={iy}
          x2={ox}
          y2={oy}
          stroke={major ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.40)"}
          strokeWidth={major ? 2 : 1}
          strokeLinecap="round"
        />
      );
    }
  }

  return (
    <Box w="100%" maxW={`${W}px`} userSelect="none">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="Gauge 0–10">
        <defs>
          <linearGradient id="gaugeArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#22c55e" />
            <stop offset="50%"  stopColor="#eab308" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* base + colored arc */}
        <path d={fullArc} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={thickness} strokeLinecap="round" />
        <path d={fullArc} fill="none" stroke="url(#gaugeArc)" strokeWidth={thickness} strokeLinecap="round" filter="url(#arcGlow)" />

        {ticks}

        {/* needle on top */}
        <line x1={tailX} y1={tailY} x2={tipX} y2={tipY} stroke="white" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={hubR} fill="white" />
        <circle cx={cx} cy={cy} r={hubR - 2} fill="black" />
      </svg>
    </Box>
  );
}


export default function Impactor2025() {
  const value = 7.2; // your live value goes here (1..10)

  return (
    <Box color="white" pt={6} pb={12} transform="translateY(-30px)">
      {/* Match Navbar container spacing */}
      <Box maxW="7xl" px={6} mx="auto">
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="center" mb={6} gap="12px">
          <Heading size="2xl" fontWeight="semibold" letterSpacing="wide" textAlign="center">
            Impactor-2025
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
            High
          </Box>
        </Box>

        {/* Two equal cards */}
        <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="28px">
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

            {/* Reading */}
            <Text
              fontSize="5xl"
              fontWeight="extrabold"
              lineHeight="1"
              color="cyan.300"
              mt="6px"
              mb="6px"
              letterSpacing="tight"
            >
              {value.toFixed(1)}
            </Text>

            {/* Title */}
            <Text fontSize="md" fontWeight="medium" color="whiteAlpha.800" textAlign="center">
              Disruption Scale (1–10)
            </Text>
            <Text fontSize="sm" color="whiteAlpha.600" mt={2} textAlign="center">
              Estimated planetary disruption index from current best-fit parameters.
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
            <Heading size="sm" mb={4} color="whiteAlpha.900" fontWeight="semibold" letterSpacing="wide">
              Current Parameters
            </Heading>

            <Box display="grid" rowGap="14px">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text color="whiteAlpha.700">Time of Impact</Text>
                <Text fontWeight="bold" color="whiteAlpha.900">2025-10-14 16:32 UTC</Text>
              </Box>
              <Box h="1px" bg="whiteAlpha.200" />

              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text color="whiteAlpha.700">Speed at Entry</Text>
                <Text fontWeight="bold" color="whiteAlpha.900">21.4 km/s</Text>
              </Box>
              <Box h="1px" bg="whiteAlpha.200" />

              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text color="whiteAlpha.700">Estimated Diameter</Text>
                <Text fontWeight="bold" color="whiteAlpha.900">310 m</Text>
              </Box>
              <Box h="1px" bg="whiteAlpha.200" />

              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text color="whiteAlpha.700">Velocity (Ground)</Text>
                <Text fontWeight="bold" color="whiteAlpha.900">77,000 km/h</Text>
              </Box>
            </Box>

            <Text fontSize="xs" color="whiteAlpha.500" mt={5} textAlign="center">
              *Demo values. Connect to NASA NEO + USGS pipelines for live data.
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
