import React, { useState } from 'react';
import AsteroidDropdown from '../components/Dropdown';
import { Flex, Input, Button, Box, VStack, Text, SimpleGrid } from '@chakra-ui/react';
import { AsteroidDeflectionSim } from '../components/AsteroidEarthSimulation';
import { GiNuclearBomb, GiLaserBlast, GiMissilePod } from 'react-icons/gi';

function MitigationScreen() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [step, setStep] = useState(1);

  return (
    <Box p={8}>
      {step === 1 && (
        <Box>
          <Flex gap="4" justify="space-around">
            <Box w="66.66%">
              <AsteroidDropdown />
              <AsteroidDeflectionSim asteroid={{ distance: 4, angle: -30, size: 10 }} deflectionAngle={45} />
            </Box>
            <Box w="33.33%">
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text mb={2}>Velocity</Text>
                  <Input placeholder="Enter velocity" />
                </Box>
                <Box>
                  <Text mb={2}>Impact Angle</Text>
                  <Input placeholder="Enter impact angle" />
                </Box>
              <Button colorScheme="blue" onClick={() => setStep(2)}>Submit</Button>
              </VStack>
            </Box>
          </Flex>
        </Box>
      )}
      {step === 2 && (
        <Box>
          <SimpleGrid columns={3} spacing={12} gap={12} mt={10}>
            <Box
              border="1px solid"
              borderColor="gray.200"
              p={6}
              textAlign="center"
              borderRadius="md"
              onClick={() => {
                setSelectedMethod("Nuclear");
                setStep(3);
              }}
              cursor="pointer"
            >
              <Box
                w="80px"
                h="80px"
                mx="auto"
                borderRadius="full"
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
              >
                <GiNuclearBomb size="40px" color="gray" />
              </Box>
              <Text fontWeight="semibold">Nuclear</Text>
            </Box>
            <Box
              border="1px solid"
              borderColor="gray.200"
              p={6}
              textAlign="center"
              borderRadius="md"
              onClick={() => {
                setSelectedMethod("Laser");
                setStep(3);
              }}
              cursor="pointer"
            >
              <Box
                w="80px"
                h="80px"
                mx="auto"
                borderRadius="full"
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
              >
                <GiLaserBlast size="40px" color="gray" />
              </Box>
              <Text fontWeight="semibold">Laser</Text>
            </Box>
            <Box
              border="1px solid"
              borderColor="gray.200"
              p={6}
              textAlign="center"
              borderRadius="md"
              onClick={() => {
                setSelectedMethod("Kinetic Impactor");
                setStep(3);
              }}
              cursor="pointer"
            >
              <Box
                w="80px"
                h="80px"
                mx="auto"
                borderRadius="full"
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
              >
                <GiMissilePod size="40px" color="gray" />
              </Box>
              <Text fontWeight="semibold">Kinetic Impactor</Text>
            </Box>
          </SimpleGrid>
        </Box>
      )}
      {step === 3 && selectedMethod && (
        <Box mt={8} p={6} border="1px solid" borderColor="gray.200" borderRadius="md" maxW="400px" mx="auto">
          <Text fontSize="xl" fontWeight="bold" mb={4}>{selectedMethod} Method</Text>
          <VStack spacing={4} align="stretch">
            <Input placeholder="Parameter 1" />
            <Input placeholder="Parameter 2" />
            <Input placeholder="Parameter 3" />
            <Button colorScheme="blue">Launch</Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
}

export default MitigationScreen;