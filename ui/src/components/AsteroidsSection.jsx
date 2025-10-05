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
import { useState, useEffect } from "react";
import ApiService from "../components/utils/ApiService";

const MotionBox = motion(Box);

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
  const [asteroids, setAsteroids] = useState([]);

  useEffect(() => {
    const fetchAsteroids = async () => {
      try {
        const data = await ApiService.get("neo");
        setAsteroids(data);
      } catch (error) {
        console.error("Error fetching asteroid data:", error);
      }
    };
    fetchAsteroids();
  }, []);

  const riskColor = (hazardous) => (hazardous ? "red" : "green");

  const asteroidImages = [
    "https://cdn.mos.cms.futurecdn.net/DAuVDvrELCJP3swkSgvgkS-1200-80.jpg.webp",
    "https://i.abcnewsfe.com/a/cec1b398-cf2d-4d66-955a-f6d9d190c51c/asteroid-gty-jt-250722_1753214976039_hpMain_4x3.jpg?w=1500",
  ];

  return (
    <Box as="section" color="white" py={{ base: 12, md: 18 }}>
      <Container maxW="7xl" px={6}>
        <Heading as="h2" size="lg" textAlign="center" mb={{ base: 10, md: 14 }}>
          Near-Earth Objects Approaching!
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 10, md: 14 }}>
          {asteroids.map((a) => {
            const approach = a.close_approach_data[0];
            return (
              <MotionBox
                key={a.id}
                role="group"
                rounded="2xl"
                bg="blackAlpha.500"
                border="1px solid"
                borderColor="whiteAlpha.200"
                p={{ base: 5, md: 6 }}
                minH={{ base: "440px", md: "480px" }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.25 }}
              >
                <HStack justify="space-between" align="center" mb={4}>
                  <HStack spacing={4} align="center">
                    <Box
                      boxSize="80px"
                      rounded="full"
                      overflow="hidden"
                      border="2px solid"
                      borderColor="whiteAlpha.300"
                    >
                      <Image
                        src={asteroidImages[Math.floor(Math.random() * asteroidImages.length)]}
                        alt={a.name}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                        objectPosition="center"
                      />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="semibold" fontSize="xl">
                        {a.name}
                      </Text>
                      <Text fontSize="xs" color="whiteAlpha.700">
                        H-mag {a.absolute_magnitude_h}
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge colorScheme={riskColor(a.is_potentially_hazardous_asteroid)} px={2}>
                    {a.is_potentially_hazardous_asteroid ? "Hazardous" : "Safe"}
                  </Badge>
                </HStack>

                <VStack align="stretch" spacing={3}>
                  <Fact label="ETA" value={approach?.close_approach_date_full} />
                  <Fact
                    label="Estimated Diameter (m)"
                    value={`${a.estimated_diameter.meters.estimated_diameter_min.toFixed(2)} - ${a.estimated_diameter.meters.estimated_diameter_max.toFixed(2)}`}
                  />
                  <Fact
                    label="Velocity (km/s)"
                    value={approach?.relative_velocity.kilometers_per_second}
                  />
                  <Fact
                    label="Miss Distance (km)"
                    value={Number(approach?.miss_distance.kilometers).toLocaleString()}
                  />
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
                    Orbiting Body: {approach?.orbiting_body}
                  </Text>
                </Box>
              </MotionBox>
            );
          })}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
