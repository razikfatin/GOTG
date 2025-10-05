import React, { useState } from 'react';
import ApiService from '../components/utils/ApiService';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AsteroidDropdown from '../components/Dropdown';
import { Box, VStack, Text, SimpleGrid, Card, Button, Badge, Flex, Image, Spinner } from '@chakra-ui/react';
import AsteroidEarthSimulation from '../components/AsteroidEarthSimulation';
import Starfield from '../components/Starfield';
import NebulaOverlay from '../components/NebulaOverlay';
import { motion } from "framer-motion";

function MitigationScreen() {
    const navigate = useNavigate();
    const [asteroidChosen, setAsteroidChosen] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState(null);

    const [asteroidData, setAsteroidData] = useState([]);
    const [selectedAsteroid, setSelectedAsteroid] = useState(null);

  // Cinematic image fallbacks
  const imageCandidates = [
    'https://stock.adobe.com/ie/images/colorful-asteroid-exploration-outer-space-3d-render-cosmic-environment-close-up-view-astronomy/1412275837',
    'https://upload.wikimedia.org/wikipedia/commons/e/e1/Near-Earth_asteroid_artwork.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/1/1f/PIA02923_Eros_approaches.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/9/99/Ryugu_in_true_color.jpg',
  ];
  const [imgIdx, setImgIdx] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const handleImgError = () => setImgIdx((i) => (i + 1) % imageCandidates.length);
  const handleImgLoad = () => setImgLoaded(true);

    useEffect(() => {
      const fetchAsteroids = async () => {
        try {
          const data = await ApiService.get("neo");
          console.log("Fetched asteroid data:", data);
          setAsteroidData(data);
        } catch (error) {
          console.error("Error fetching NEO data:", error);
        }
      };
      fetchAsteroids();
    }, []);

    return (
        <>
            <style>{`
  @keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.05); } }
  @keyframes pulseGlow {
    0%, 100% { text-shadow: 0 0 15px rgba(0,255,255,0.4), 0 0 30px rgba(0,255,255,0.2); }
    50% { text-shadow: 0 0 30px rgba(0,255,255,0.8), 0 0 50px rgba(0,255,255,0.5); }
  }
`}</style>
            <Starfield density={0.00045} speed={10} enableMotion />
            <NebulaOverlay />
            <Box
              minH="100vh"
              display="flex"
              justifyContent="center"
              alignItems="center"
              bgGradient="linear(to-br, gray.900, black, blue.900)"
              p={8}
            >
                {!asteroidChosen ? (
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
  <Box
    bg="rgba(255, 255, 255, 0.1)"
    backdropFilter="blur(10px)"
    borderRadius="2xl"
    boxShadow="0 0 50px rgba(0,0,0,0.3)"
    p={8}
    transition="all 0.4s ease"
    _hover={{ boxShadow: "0 0 70px rgba(66,153,225,0.6)" }}
  >
    <VStack spacing={8} w="full" maxW="1000px" align="center" mx="auto">
      {/* Heading */}
      <VStack spacing={2} textAlign="center" w="full">
        <Text
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight="900"
          letterSpacing="wide"
          lineHeight="shorter"
          bgGradient="linear(to-r, cyan.300, blue.400, purple.500)"
          bgClip="text"
          textShadow="0 0 40px rgba(56,189,248,0.5)"
        >
          🌌 NEAR-EARTH OBJECT OBSERVATION CENTER
        </Text>
        <Text color="whiteAlpha.700" fontSize={{ base: "md", md: "lg" }}>
          Real-time asteroid tracking, analysis, and planetary defense simulation
        </Text>
        <Box w="80px" h="2px" bgGradient="linear(to-r, cyan.400, purple.400)" borderRadius="full" mt={2} />
      </VStack>

      {/* Cinematic visualization */}
      <Box
        position="relative"
        w="100%"
        h="400px"
        borderRadius="3xl"
        overflow="hidden"
        boxShadow="0 0 60px rgba(0,0,0,0.8), 0 0 80px rgba(0,180,255,0.2)"
        bg="linear-gradient(135deg, #0b1220, #1a2235)"
        _hover={{ transform: 'scale(1.01)', transition: '0.6s' }}
      >
        <Image
          src={imageCandidates[imgIdx]}
          alt="Asteroid approaching Earth"
          objectFit="cover"
          w="100%"
          h="100%"
          opacity="0.92"
          onError={handleImgError}
          onLoad={handleImgLoad}
          sx={{
            filter: 'brightness(0.9) contrast(1.1)',
            animation: 'slowZoom 20s ease-in-out infinite alternate',
          }}
        />

        {!imgLoaded && (
          <Flex position="absolute" inset={0} align="center" justify="center" bg="blackAlpha.500">
            <Spinner size="xl" thickness="4px" speed="0.6s" color="blue.300" />
          </Flex>
        )}

        <Box
          position="absolute"
          inset="0"
          bgGradient="linear(to-t, rgba(0,0,0,0.7) 10%, transparent 60%)"
        />

        <Box position="absolute" bottom="6" left="0" right="0" textAlign="center">
          <VStack spacing={1}>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="bold"
              letterSpacing="wide"
              bgGradient="linear(to-r, cyan.300, blue.400, purple.500)"
              bgClip="text"
              textShadow="0 0 25px rgba(0,255,255,0.5)"
              animation="pulseGlow 3s ease-in-out infinite"
            >
              🌠 ASTEROID TRAJECTORY SIMULATION ACTIVE
            </Text>
            <Text
              color="whiteAlpha.700"
              fontSize={{ base: 'xs', md: 'sm' }}
              letterSpacing="wider"
            >
              Monitoring near‑Earth orbital paths in real‑time
            </Text>
          </VStack>
        </Box>
      </Box>

      {/* Selection + info */}
      <Flex
        w="full"
        direction={{ base: "column", md: "row" }}
        gap={10}
        align="stretch"
        justify="center"
        mt={10}
      >
        <Box
          flex="1"
          p={6}
          borderRadius="2xl"
          bg="rgba(255,255,255,0.08)"
          backdropFilter="blur(10px)"
          boxShadow="0 0 30px rgba(59,130,246,0.3)"
          _hover={{ boxShadow: '0 0 50px rgba(59,130,246,0.6)' }}
          transition="0.4s"
        >
          <Text color="whiteAlpha.800" fontWeight="bold" mb={3} fontSize="lg">
            Select an Asteroid
          </Text>
          <AsteroidDropdown
            asteroids={asteroidData}
            onSelectAsteroid={(asteroid) => setSelectedAsteroid(asteroid)}
          />
        </Box>

        {selectedAsteroid && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ flex: 1 }}
          >
            <Box
              p={6}
              borderRadius="2xl"
              bg="rgba(255,255,255,0.1)"
              backdropFilter="blur(14px)"
              boxShadow="0 0 50px rgba(0,255,255,0.3)"
              transition="all 0.4s ease"
              color="white"
            >
              <Text fontSize="2xl" fontWeight="bold" mb={2} color="cyan.300">
                {selectedAsteroid.name}
              </Text>
              <Badge
                colorScheme={selectedAsteroid.is_potentially_hazardous_asteroid ? "red" : "green"}
                mb={3}
                px={3}
                py={1}
                borderRadius="md"
              >
                {selectedAsteroid.is_potentially_hazardous_asteroid ? "Potentially Hazardous" : "Safe Orbit"}
              </Badge>
              <VStack align="start" spacing={2} fontSize="sm" color="whiteAlpha.800">
                <Text><b>Magnitude:</b> {selectedAsteroid.absolute_magnitude_h}</Text>
                <Text><b>Diameter:</b> {selectedAsteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(2)} - {selectedAsteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(2)} m</Text>
                <Text><b>Velocity:</b> {selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second} km/s</Text>
                <Text><b>Distance:</b> {Number(selectedAsteroid.close_approach_data[0].miss_distance.kilometers).toLocaleString()} km</Text>
              </VStack>

              <Button
                colorScheme="blue"
                mt={6}
                width="full"
                size="lg"
                fontWeight="bold"
                boxShadow="0 0 25px rgba(66,153,225,0.6)"
                _hover={{
                  boxShadow: "0 0 40px rgba(66,153,225,0.9)",
                  transform: "scale(1.03)",
                }}
                transition="all 0.3s ease-in-out"
                onClick={() => setAsteroidChosen(true)}
              >
                Proceed to Mitigation ➜
              </Button>
            </Box>
          </motion.div>
        )}
      </Flex>
    </VStack>
  </Box>
</motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                      <Box
                          w="full"
                          maxW="1300px"
                          mx="auto"
                          py={16}
                          px={{ base: 4, md: 8 }}
                          bgGradient="linear(to-br, gray.900, gray.800)"
                          borderRadius="3xl"
                          boxShadow="dark-lg"
                      >
                          <Text
                              fontSize="3xl"
                              fontWeight="bold"
                              color="whiteAlpha.900"
                              textAlign="center"
                              mb={10}
                              letterSpacing="wide"
                          >
                              🌍 Planetary Defense Strategies
                          </Text>

                          <SimpleGrid
                              columns={{ base: 1, md: 2, lg: 4 }}
                              spacing={10}
                              justifyItems="center"
                          >
                              {[
                                  {
                                      title: "Civil Defense",
                                      desc: "Involves evacuating the region around a small impact to minimize casualties and damage.",
                                      gradient: "linear(to-br, orange.400, red.500)",
                                      icon: "🧍‍♂️",
                                      index: 3,
                                  },
                                  {
                                      title: "Slow Push or Pull",
                                      desc: "Gradually changes the orbit of a near-Earth object so that it misses Earth entirely.",
                                      gradient: "linear(to-br, teal.400, cyan.500)",
                                      icon: "🛰️",
                                      index: 5,
                                  },
                                  {
                                      title: "Kinetic Impact",
                                      desc: "Delivers a large amount of momentum instantaneously to shift the object's trajectory away from Earth.",
                                      gradient: "linear(to-br, pink.400, purple.500)",
                                      icon: "🚀",
                                      index: 8,
                                  },
                                  {
                                      title: "Nuclear Detonation",
                                      desc: "Applies immense energy to alter the orbit of a threatening NEO, preventing collision with Earth.",
                                      gradient: "linear(to-br, yellow.400, orange.500)",
                                      icon: "☢️",
                                      index: 7,
                                  },
                              ].map(({ title, desc, gradient, icon, index }, indexMap) => (
                                  <Card.Root
                                      key={title}
                                      onClick={() => setSelectedStrategy(title)}
                                      cursor="pointer"
                                      bgGradient={gradient}
                                      color="white"
                                      borderRadius="2xl"
                                      boxShadow="2xl"
                                      transform={`translateY(${indexMap % 2 === 0 ? '0' : '20px'})`}
                                      transition="all 0.4s ease-in-out"
                                      _hover={{
                                          transform: "translateY(-10px) scale(1.05)",
                                          boxShadow: "0px 0px 35px rgba(255,255,255,0.25)",
                                      }}
                                      _before={{
                                          content: '""',
                                          pos: "absolute",
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          bottom: 0,
                                          bg: "whiteAlpha.200",
                                          backdropFilter: "blur(8px)",
                                          borderRadius: "2xl",
                                      }}
                                  >
                                      <Card.Header
                                          position="relative"
                                          zIndex="1"
                                          textAlign="center"
                                          fontSize="2xl"
                                          fontWeight="bold"
                                          py={5}
                                      >
                                          {icon} {title}
                                      </Card.Header>

                                      <Card.Body position="relative" zIndex="1" px={6} pb={6}>
                                          <Text fontSize="md" lineHeight="1.6" color="whiteAlpha.900">
                                              {desc}
                                          </Text>
                                      </Card.Body>

                                      <Card.Footer
                                          position="relative"
                                          zIndex="1"
                                          fontSize="xs"
                                          textAlign="center"
                                          color="whiteAlpha.700"
                                          py={2}
                                      >
                                          National Academies of Sciences, Engineering, and Medicine (2010)
                                      </Card.Footer>
                                  </Card.Root>
                              ))}
                          </SimpleGrid>

                          {selectedStrategy && (
                              <Box textAlign="center" mt={8}>
                                  <Button
                                    colorScheme="blue"
                                    size="lg"
                                    px={10}
                                    py={6}
                                    fontWeight="bold"
                                    boxShadow="0 0 25px rgba(66,153,225,0.6)"
                                    _hover={{
                                      boxShadow: "0 0 40px rgba(66,153,225,0.9)",
                                      transform: "scale(1.05)",
                                    }}
                                    transition="all 0.3s ease-in-out"
                                    onClick={() => navigate("/results")}
                                  >
                                    🚀 Launch {selectedStrategy} Mission
                                  </Button>
                              </Box>
                          )}

                          <Text
                              fontSize="sm"
                              color="gray.400"
                              mt={10}
                              textAlign="center"
                              maxW="800px"
                              mx="auto"
                          >
                              Source: <em>Defending Planet Earth: Near-Earth-Object Surveys and Hazard Mitigation Strategies</em>,
                              The National Academies Press, 2010.{" "}
                              <a
                                  href="https://doi.org/10.17226/12842"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#63b3ed", textDecoration: "underline" }}
                              >
                                  https://doi.org/10.17226/12842
                              </a>
                          </Text>
                      </Box>
                    </motion.div>
                )}
            </Box>
        </>
    );
}

export default MitigationScreen;