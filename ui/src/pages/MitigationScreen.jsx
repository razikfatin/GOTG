import React, { useState } from 'react';
import AsteroidDropdown from '../components/Dropdown';
import { Box, VStack, Text, SimpleGrid, Card, Button } from '@chakra-ui/react';
import AsteroidEarthSimulation from '../components/AsteroidEarthSimulation';

function MitigationScreen() {
  const [asteroidChosen, setAsteroidChosen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  return (
    <Box minH="100vh" display="flex" justifyContent="center" alignItems="center" p={8}>
      {!asteroidChosen ? (
        <VStack spacing={8} w="full" maxW="400px">
          <Text fontSize="xl" fontWeight="semibold" color="gray.700" textAlign="center" mb={2}>
            Choose Near Earth Object
          </Text>
          <AsteroidDropdown onSelectAsteroid={() => setAsteroidChosen(true)} />
          <Box
            w="100%"
            h="300px"
            bg="gray.100"
            borderRadius="xl"
            boxShadow="lg"
            display="flex"
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
          >
            <AsteroidEarthSimulation roundedEarth />
          </Box>
        </VStack>
      ) : (
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
      )}
    </Box>
  );
}

export default MitigationScreen;