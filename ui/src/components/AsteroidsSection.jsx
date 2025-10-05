// src/components/AsteroidsSection.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  HStack,
  VStack,
  Text,
  Badge,
  Image,
  Skeleton,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import ApiService from "../components/utils/ApiService";

const MotionBox = motion(Box);

// ---------- helpers ----------
const riskScheme = (risk) =>
  risk === "High" ? "red" : risk === "Medium" ? "orange" : "green";

const riskGlow = (risk) =>
  risk === "High" ? "#ef4444" : risk === "Medium" ? "#f59e0b" : "#22c55e";

const FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#d1d5db"/>
          <stop offset="100%" stop-color="#6b7280"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="60" fill="url(#g)" />
      <circle cx="46" cy="50" r="10" fill="#fff" opacity="0.7"/>
      <ellipse cx="64" cy="82" rx="34" ry="12" fill="#111827" opacity="0.5"/>
    </svg>`
  );

function ImageWithFallback({ src, alt, size = 84 }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <Box position="relative" boxSize={`${size}px`}>
      <Skeleton
        isLoaded={loaded || failed}
        startColor="whiteAlpha.200"
        endColor="whiteAlpha.300"
        boxSize={`${size}px`}
        rounded="full"
      >
        <Image
          src={failed || !src ? FALLBACK_SVG : src}
          alt={alt}
          loading="lazy"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          w={`${size}px`}
          h={`${size}px`}
          rounded="full"
          objectFit="cover"
          objectPosition="center"
        />
      </Skeleton>
    </Box>
  );
}

function Fact({ label, value }) {
  return (
    <HStack justify="space-between" align="baseline">
      <Text fontSize="sm" color="whiteAlpha.700">
        {label}
      </Text>
      <Text fontWeight="semibold" color="whiteAlpha.900">
        {value ?? "—"}
      </Text>
    </HStack>
  );
}

function AsteroidCard({ a }) {
  const ring = riskGlow(a.risk);

  return (
    <MotionBox
      role="group"
      rounded="2xl"
      p="1px"
      bg="linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.04))"
      position="relative"
      whileHover={{
        y: -6,
        rotateX: 1.25,
        rotateY: -1.25,
        boxShadow: "0 25px 80px rgba(0,0,0,0.55)",
      }}
      transition={{ duration: 0.25 }}
      cursor="default"
      m={{ base: 2, md: 3 }}
    >
      <Box
        rounded="2xl"
        bg="rgba(17, 24, 39, 0.55)"
        border="1px solid"
        borderColor="whiteAlpha.150"
        backdropFilter="saturate(140%) blur(10px)"
        boxShadow="0 10px 35px rgba(0,0,0,0.55)"
        p={{ base: 5, md: 6 }}
        minH={{ base: "460px", md: "500px" }}
      >
        <HStack justify="space-between" align="center" mb={4}>
          <HStack spacing={4} align="center">
            <Box
              position="relative"
              boxSize="84px"
              rounded="full"
              overflow="hidden"
              _before={{
                content: '""',
                position: "absolute",
                inset: 0,
                rounded: "full",
                boxShadow: `0 0 0 2px ${ring}, 0 0 24px ${ring}55`,
                pointerEvents: "none",
              }}
            >
              <ImageWithFallback src={a.img} alt={a.name} />
            </Box>

            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="xl" color="whiteAlpha.900">
                {a.name}
              </Text>
              {a.mag != null && (
                <Text fontSize="xs" color="whiteAlpha.700">
                  H-mag {a.mag}
                </Text>
              )}
            </VStack>
          </HStack>

          <Badge
            colorScheme={riskScheme(a.risk)}
            px={2.5}
            py={1}
            rounded="full"
            fontWeight="semibold"
            bg={`${riskScheme(a.risk)}.400`}
            color="black"
            boxShadow="0 6px 16px rgba(0,0,0,0.35)"
            _groupHover={{ transform: "translateY(-2px)" }}
            transition="transform 0.2s ease"
          >
            {a.risk}
          </Badge>
        </HStack>

        {a.description && (
          <Text fontSize="sm" color="whiteAlpha.800" mb={4} noOfLines={4}>
            {a.description}
          </Text>
        )}

        <Box h="1px" bg="whiteAlpha.200" my={3} />

        <VStack align="stretch" spacing={3}>
          <Fact label="ETA" value={a.eta} />
          <Fact label="Estimated Diameter" value={a.diameter} />
          <Fact label="Velocity" value={a.velocity} />
          <Fact label="Approach Distance" value={a.approachDistance} />
          <Fact label="Potential Energy" value={a.energy} />
        </VStack>

        {a.consequence && (
          <Box
            mt={4}
            p={3}
            rounded="lg"
            bg="whiteAlpha.100"
            border="1px dashed"
            borderColor="whiteAlpha.300"
            _groupHover={{ borderColor: "whiteAlpha.500" }}
            transition="border-color 0.2s ease"
          >
            <Text fontSize="sm" color="whiteAlpha.900">
              {a.consequence}
            </Text>
          </Box>
        )}
      </Box>
    </MotionBox>
  );
}

// Map various API shapes to the card shape we render
function mapApiToCards(data) {
  // NASA NEO feed often returns { near_earth_objects: { 'YYYY-MM-DD': [ ... ] } }
  let list = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (Array.isArray(data?.near_earth_objects)) {
    list = data.near_earth_objects;
  } else if (data?.near_earth_objects && typeof data.near_earth_objects === "object") {
    list = Object.values(data.near_earth_objects).flat();
  }

  return list.slice(0, 9).map((o, idx) => {
    const ca = o?.close_approach_data?.[0] || {};
    const vel = ca?.relative_velocity?.kilometers_per_second;
    const missAU = ca?.miss_distance?.astronomical;
    const diaMax =
      o?.estimated_diameter?.meters?.estimated_diameter_max ??
      o?.estimated_diameter?.meters?.max ??
      null;

    // Risk heuristic
    let risk = "Low";
    if (o?.is_potentially_hazardous_asteroid) risk = "High";
    else if (diaMax != null && diaMax >= 150) risk = "Medium";

    return {
      id: o?.id || o?.neo_reference_id || `neo-${idx}`,
      name: o?.name || `NEO-${(o?.id || idx).toString().slice(-4)}`,
      description:
        o?.orbital_data?.orbit_class?.orbit_class_description || "",
      eta:
        ca?.close_approach_date_full ||
        ca?.close_approach_date ||
        "—",
      mag: o?.absolute_magnitude_h,
      diameter: diaMax != null ? `${Math.round(diaMax)} m` : "—",
      velocity: vel != null ? `${Number(vel).toFixed(1)} km/s` : "—",
      approachDistance: missAU != null ? `${Number(missAU).toFixed(3)} AU` : "—",
      energy: "—",
      consequence: "",
      risk,
      img: o?.image_url || "", // if your API provides one; else fallback SVG is used
    };
  });
}

function CardSkeleton() {
  return (
    <Box
      rounded="2xl"
      p="1px"
      bg="linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.04))"
    >
      <Box
        rounded="2xl"
        bg="rgba(17, 24, 39, 0.55)"
        border="1px solid"
        borderColor="whiteAlpha.150"
        backdropFilter="saturate(140%) blur(10px)"
        p={{ base: 5, md: 6 }}
        minH={{ base: "460px", md: "500px" }}
      >
        <HStack justify="space-between" mb={4}>
          <Skeleton rounded="full" boxSize="84px" />
          <Skeleton height="22px" width="72px" rounded="full" />
        </HStack>
        <Skeleton height="14px" mb={2} />
        <Skeleton height="14px" mb={2} />
        <Skeleton height="14px" mb={4} />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height="18px" my={2} />
        ))}
        <Skeleton height="48px" mt={5} rounded="lg" />
      </Box>
    </Box>
  );
}

export default function AsteroidsSection() {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await ApiService.get("neo");
        if (!alive) return;
        const cards = mapApiToCards(data);
        setAsteroids(cards);
      } catch (err) {
        console.error("Error fetching asteroid data:", err);
        if (alive) setAsteroids([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Box as="section" color="white" py={{ base: 12, md: 18 }}>
      <Container maxW="7xl" px={6}>
        <Heading
          as="h2"
          size="2xl"
          textAlign="center"
          letterSpacing="wider"
          mb={{ base: 10, md: 14 }}
        >
          Asteroids are approaching!
        </Heading>

        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 8, md: 10 }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </SimpleGrid>
        ) : asteroids.length === 0 ? (
          <Box
            rounded="2xl"
            border="1px dashed"
            borderColor="whiteAlpha.300"
            p={8}
            textAlign="center"
            color="whiteAlpha.800"
          >
            No asteroids found.
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 8, md: 10 }}>
            {asteroids.map((a) => (
              <AsteroidCard key={a.id || a.name} a={a} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}
