// src/components/AsteroidsSection.jsx
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
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const ASTEROIDS = [
  {
    id: "impactor-2025",
    name: "Impactor-2025",
    description:
      "A newly discovered near-Earth object on a potential close approach. Current best-fit suggests elevated risk pending further observations.",
    eta: "2025-10-14 16:32 UTC",
    mag: 20.1,
    diameter: "310 m",
    velocity: "21.4 km/s",
    approachDistance: "0.016 AU",
    energy: "~80 Mt TNT (est.)",
    consequence: "Regional blast, shockwave, tsunami risk (coastal).",
    risk: "High",
    img: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Asteroid_Bennu_in_space_%28artistic_render%29.png",
  },
  {
    id: "neo-amber",
    name: "NEO-Amber",
    description:
      "Moderate-sized NEO with uncertain albedo; brightness suggests a rubble-pile composition. Further radar constraints pending.",
    eta: "2026-02-03 04:10 UTC",
    mag: 21.7,
    diameter: "120 m",
    velocity: "17.8 km/s",
    approachDistance: "0.042 AU",
    energy: "~8 Mt TNT (est.)",
    consequence: "Urban-scale damage if ground impact.",
    risk: "Medium",
    img: "https://upload.wikimedia.org/wikipedia/commons/1/1f/PIA02923_Eros_approaches.jpg",
  },
  {
    id: "neo-cobalt",
    name: "NEO-Cobalt",
    description:
      "Small fast-mover; preliminary arc indicates safe pass. Monitoring continues to refine trajectory and dispersion.",
    eta: "2026-07-22 19:05 UTC",
    mag: 22.3,
    diameter: "60 m",
    velocity: "15.2 km/s",
    approachDistance: "0.089 AU",
    energy: "~1 Mt TNT (est.)",
    consequence: "Local airburst; glass breakage, minor structural damage.",
    risk: "Low",
    img: "https://upload.wikimedia.org/wikipedia/commons/9/99/Ryugu_in_true_color.jpg",
  },
];

const riskColor = (risk) =>
  risk === "High" ? "red" : risk === "Medium" ? "orange" : "green";

function Fact({ label, value }) {
  return (
    <HStack justify="space-between" align="baseline">
      <Text fontSize="sm" color="whiteAlpha.700">
        {label}
      </Text>
      <Text fontWeight="semibold">{value}</Text>
    </HStack>
  );
}

export default function AsteroidsSection() {
  return (
    <Box as="section" color="white" py={{ base: 12, md: 18 }}>
      <Container maxW="7xl" px={6}>
        <Heading
          as="h2"
          size="lg"
          textAlign="center"
          letterSpacing="wider"
          mb={{ base: 10, md: 14 }}
        >
          Asteroids are approaching!
        </Heading>

        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          spacing={{ base: 10, md: 14 }}
        >
          {ASTEROIDS.map((a) => (
            <MotionBox
              key={a.id}
              role="group"
              rounded="2xl"
              bg="blackAlpha.500"
              border="1px solid"
              borderColor="whiteAlpha.200"
              backdropFilter="saturate(140%) blur(8px)"
              boxShadow="0 10px 35px rgba(0,0,0,0.55)"
              p={{ base: 5, md: 6 }}
              minH={{ base: "440px", md: "480px" }}
              whileHover={{
                y: -6,
                scale: 1.02,
                boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
              }}
              transition={{ duration: 0.25 }}
              cursor="default"
              // give breathing space horizontally and vertically
              m={{ base: 2, md: 3 }}
            >
              {/* Header */}
              <HStack justify="space-between" align="center" mb={4}>
                <HStack spacing={4} align="center">
                  <Box
                    boxSize="80px"
                    rounded="full"
                    overflow="hidden"
                    border="2px solid"
                    borderColor="whiteAlpha.300"
                    shadow="md"
                    flexShrink={0}
                    bg="blackAlpha.300"
                  >
                    <Image
                      src={a.img}
                      alt={a.name}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      objectPosition="center"
                      fallbackSrc="https://upload.wikimedia.org/wikipedia/commons/2/23/Generic_asteroid_icon.png"
                    />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold" fontSize="xl">
                      {a.name}
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.700">
                      H-mag {a.mag}
                    </Text>
                  </VStack>
                </HStack>
                <Badge colorScheme={riskColor(a.risk)} px={2}>
                  {a.risk}
                </Badge>
              </HStack>

              <Text fontSize="sm" color="whiteAlpha.800" mb={4} noOfLines={4}>
                {a.description}
              </Text>

              <VStack align="stretch" spacing={3}>
                <Fact label="ETA" value={a.eta} />
                <Fact label="Estimated Diameter" value={a.diameter} />
                <Fact label="Velocity" value={a.velocity} />
                <Fact label="Approach Distance" value={a.approachDistance} />
                <Fact label="Potential Energy" value={a.energy} />
              </VStack>

              <Box
                mt={4}
                p={3}
                rounded="lg"
                bg="whiteAlpha.100"
                border="1px dashed"
                borderColor="whiteAlpha.200"
              >
                <Text fontSize="sm" color="whiteAlpha.900">
                  {a.consequence}
                </Text>
              </Box>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

