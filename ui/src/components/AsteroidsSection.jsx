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
        setAsteroids(data);
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
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 8, md: 10 }}>
            {asteroids.map((a, index) => {
              const approach = a.close_approach_data?.[0];
              const risk =
                a.is_potentially_hazardous_asteroid ? "High" : "Low";
              const diameter = a.estimated_diameter?.meters;
              const randomImage = [
                "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Ceres_and_Vesta%2C_Moon_size_comparison.jpg/1920px-Ceres_and_Vesta%2C_Moon_size_comparison.jpg",
                "https://as1.ftcdn.net/v2/jpg/03/92/71/06/1000_F_392710604_qYrnLYVWIfqSQwU4CylhjXoRE7FpPUf5.jpg",
              ][index % 2];

              return (
                <MotionBox
                  key={a.id || index}
                  rounded="2xl"
                  p="1px"
                  bg="linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.04))"
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                    boxShadow: "0 25px 80px rgba(0,0,0,0.55)",
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <Box
                    rounded="2xl"
                    bg="rgba(17, 24, 39, 0.65)"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    backdropFilter="saturate(150%) blur(10px)"
                    p={{ base: 5, md: 6 }}
                    minH={{ base: "420px", md: "460px" }}
                    color="white"
                  >
                    <VStack spacing={4} align="start">
                      <Box
                        w="100%"
                        h="180px"
                        overflow="hidden"
                        rounded="lg"
                        position="relative"
                      >
                        <Image
                          src={randomImage}
                          alt={a.name}
                          objectFit="cover"
                          w="100%"
                          h="100%"
                          transition="transform 0.5s ease"
                          _groupHover={{ transform: "scale(1.05)" }}
                        />
                        <Badge
                          position="absolute"
                          top={3}
                          right={3}
                          colorScheme={risk === "High" ? "red" : "green"}
                          px={3}
                          py={1}
                          rounded="md"
                          fontWeight="bold"
                        >
                          {risk}
                        </Badge>
                      </Box>

                      <VStack align="start" spacing={1}>
                        <Text fontSize="xl" fontWeight="bold">
                          {a.name}
                        </Text>
                        <Text fontSize="sm" color="whiteAlpha.700">
                          {approach?.close_approach_date_full || "Unknown Date"}
                        </Text>
                      </VStack>

                      <Box h="1px" bg="whiteAlpha.200" my={2} />

                      <VStack align="stretch" spacing={2} fontSize="sm">
                        <Fact
                          label="Velocity (km/s)"
                          value={approach?.relative_velocity?.kilometers_per_second}
                        />
                        <Fact
                          label="Miss Distance (km)"
                          value={Number(
                            approach?.miss_distance?.kilometers
                          ).toLocaleString()}
                        />
                        <Fact
                          label="Diameter (m)"
                          value={
                            diameter
                              ? `${diameter.estimated_diameter_min.toFixed(1)} - ${diameter.estimated_diameter_max.toFixed(1)}`
                              : "N/A"
                          }
                        />
                      </VStack>

                      <Box
                        mt={4}
                        p={3}
                        bg="whiteAlpha.100"
                        rounded="lg"
                        border="1px dashed"
                        borderColor="whiteAlpha.300"
                      >
                        <Text fontSize="sm" color="whiteAlpha.900">
                          Orbiting Body: {approach?.orbiting_body || "Earth"}
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </MotionBox>
              );
            })}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}
