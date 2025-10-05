// src/components/Impactor2025.jsx
import {
  Box,
  Container,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Separator,
  // Tooltip (v3 slot API)
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipPositioner,
} from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const MBox = motion(Box);

/* ---------- DisruptionGauge (visible scale + arrow needle) ---------- */
/* ---------- DisruptionGauge (top semicircle + arrow needle, correct orientation) ---------- */
function DisruptionGauge({
  value = 7.2,
  label = "Disruption Scale (0–10)",
  width = 500,
  height = 300,
}) {
  const cx = width / 2;
  const cy = height - 16;                  // baseline near bottom
  const r = Math.min(width * 0.42, height * 0.9);

  // Angles: 0..π from left to right (top semicircle)
  const start = Math.PI;                   // 180° (left)
  const end = 0;                           //   0° (right)
  const v = Math.max(0, Math.min(10, value));
  const t = v / 10;
  const ang = start + (end - start) * t;

  // IMPORTANT: SVG Y increases downward.
  // Use cy - r*sin(a) so positive sine moves UP (not down).
  const arc = (a0, a1, rr = r) => {
    const x0 = cx + rr * Math.cos(a0), y0 = cy - rr * Math.sin(a0);
    const x1 = cx + rr * Math.cos(a1), y1 = cy - rr * Math.sin(a1);
    const largeArc = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
    return `M ${x0} ${y0} A ${rr} ${rr} 0 ${largeArc} 1 ${x1} ${y1}`;
    // note the sweep-flag "1" so the arc follows the top path
  };

  const markAngle = (mark) => start + (end - start) * (mark / 10);
  const labelPos = (mark) => {
    const a = markAngle(mark);
    const rr = r + 22;                     // just outside the arc
    return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)];
  };

  return (
    <Box position="relative">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label}: ${v}/10`}>
        <defs>
          <linearGradient id="gauge-progress" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <marker id="arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
          </marker>
        </defs>

        {/* Segmented back scale */}
        <path d={arc(start, markAngle(3.33))} stroke="rgba(34,197,94,0.5)" strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d={arc(markAngle(3.33), markAngle(6.66))} stroke="rgba(250,204,21,0.5)" strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d={arc(markAngle(6.66), end)} stroke="rgba(239,68,68,0.5)" strokeWidth="18" fill="none" strokeLinecap="round" />

        {/* Ticks 0..10 */}
        {Array.from({ length: 11 }).map((_, i) => {
          const a = markAngle(i);
          const inner = r - (i % 5 === 0 ? 28 : 22);
          const outer = r + (i % 5 === 0 ? 6 : 0);
          const x0 = cx + inner * Math.cos(a), y0 = cy - inner * Math.sin(a);
          const x1 = cx + (r + outer) * Math.cos(a), y1 = cy - (r + outer) * Math.sin(a);
          return (
            <line key={i} x1={x0} y1={y0} x2={x1} y2={y1}
              stroke="rgba(255,255,255,0.7)" strokeWidth={i % 5 === 0 ? 3 : 2} />
          );
        })}

        {/* Numeric markers */}
        {[0, 5, 10].map((m) => {
          const [tx, ty] = labelPos(m);
          return (
            <text key={m} x={tx} y={ty} fill="rgba(255,255,255,0.85)" fontSize="14" textAnchor="middle" dominantBaseline="middle">
              {m}
            </text>
          );
        })}

        {/* Progress overlay */}
        <motion.path
          d={arc(start, ang)}
          stroke="url(#gauge-progress)"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 12px rgba(56,189,248,0.55))" }}
        />

        {/* Needle + arrowhead (points up toward arc) */}
        <line
          x1={cx} y1={cy}
          x2={cx + (r - 44) * Math.cos(ang)}
          y2={cy - (r - 44) * Math.sin(ang)}
          stroke="#ffffff" strokeWidth="4" markerEnd="url(#arrow-head)"
        />
        <circle cx={cx} cy={cy} r="8" fill="#ffffff" />

        {/* Value + label */}
        <text x={cx} y={height - 70} fill="#fff" textAnchor="middle" fontSize="42" fontWeight="700">
          {v.toFixed(1)}
        </text>
        <text x={cx} y={height - 32} fill="rgba(255,255,255,0.75)" textAnchor="middle" fontSize="14" style={{ letterSpacing: 1 }}>
          {label}
        </text>
      </svg>
    </Box>
  );
}


/* ---------- Param row helper (Tooltip v3) ---------- */
function ParamRow({ label, value, help }) {
  return (
    <HStack justify="space-between" align="start">
      <VStack align="start" spacing={0}>
        <HStack spacing={2}>
          <Text fontSize="sm" color="whiteAlpha.700">{label}</Text>

          {help ? (
            <TooltipRoot>
              <TooltipTrigger>
                <Box as="span" aria-label="info" cursor="help" color="whiteAlpha.600" _hover={{ color: "whiteAlpha.800" }} userSelect="none">
                  ℹ︎
                </Box>
              </TooltipTrigger>
              <TooltipPositioner>
                <TooltipContent bg="blackAlpha.800" color="white" rounded="md" px={3} py={2} fontSize="sm">
                  {help}
                </TooltipContent>
              </TooltipPositioner>
            </TooltipRoot>
          ) : null}
        </HStack>

        <Text fontSize="xl" fontWeight="semibold">{value}</Text>
      </VStack>
    </HStack>
  );
}

/* ---------- Main section ---------- */
export default function Impactor2025({
  disruption = 7.2,
  riskLevel = "High",
  timeOfImpact = "2025-10-14 16:32 UTC",
  speed = "21.4 km/s",
  diameter = "310 m",
  velocity = "77,000 km/h",
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" });
  const riskColor = riskLevel === "High" ? "red" : riskLevel === "Medium" ? "orange" : "green";

  return (
    <Box as="section" color="white" py={{ base: 8, md: 10 }}>
      <Container maxW="7xl" px={6}>
        <MBox
          ref={ref}
          py={{ base: 12, md: 20 }}   // instead of full screen, just give padding
          display="grid"
          gridTemplateColumns={{ base: "1fr", md: "1.1fr 0.9fr" }}
          gap={{ base: 8, md: 14 }}
          alignItems="center"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >

          {/* LEFT: Title + Gauge */}
          <GridItem>
            <VStack align="stretch" spacing={5}>
              <HStack spacing={3}>
                <Heading as="h2" size="lg" letterSpacing="wider">Impactor-2025</Heading>
                <Badge colorScheme={riskColor} variant="solid" px={2} py={0.5} rounded="md">{riskLevel}</Badge>
              </HStack>

              <Box
                rounded="2xl"
                p={{ base: 5, md: 7 }}
                border="1px solid"
                borderColor="whiteAlpha.200"
                bg="blackAlpha.500"
                backdropFilter="saturate(140%) blur(8px)"
                boxShadow="0 10px 40px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.06)"
              >
                <DisruptionGauge value={disruption} />
                <Text mt={3} color="whiteAlpha.700" fontSize="sm">
                  Estimated planetary disruption index from current best-fit parameters.
                </Text>
              </Box>
            </VStack>
          </GridItem>

          {/* RIGHT: Stats */}
          <GridItem>
            <VStack align="stretch" spacing={5}>
              <Heading as="h3" size="md" letterSpacing="wider">Current Parameters</Heading>

              <Box
                rounded="2xl"
                p={{ base: 5, md: 6 }}
                border="1px solid"
                borderColor="whiteAlpha.200"
                bg="blackAlpha.500"
                backdropFilter="saturate(140%) blur(8px)"
                boxShadow="0 10px 40px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.06)"
              >
                <VStack align="stretch" spacing={4}>
                  <ParamRow
                    label="Time of Impact"
                    value={timeOfImpact}
                    help="Latest best-estimate window based on trajectory fit."
                  />
                  <Separator borderColor="whiteAlpha.200" />

                  <ParamRow
                    label="Speed at Entry"
                    value={speed}
                    help="Relative speed as it hits the atmosphere."
                  />
                  <Separator borderColor="whiteAlpha.200" />

                  <ParamRow
                    label="Estimated Diameter"
                    value={diameter}
                    help="Spheroidal equivalent from brightness & albedo."
                  />
                  <Separator borderColor="whiteAlpha.200" />

                  <ParamRow
                    label="Velocity (Ground)"
                    value={velocity}
                    help="Estimated ground-relative velocity after atmospheric losses."
                  />
                </VStack>
              </Box>

              <Text fontSize="xs" color="whiteAlpha.600">
                *Demo values. Connect to NASA NEO + USGS pipelines for live data.
              </Text>
            </VStack>
          </GridItem>
        </MBox>
      </Container>
    </Box>
  );
}
