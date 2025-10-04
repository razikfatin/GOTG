import React from 'react';
import AsteroidDropdown from '../components/Dropdown';
import { Flex, Input, Button, Box, VStack, Text } from '@chakra-ui/react';
import { AsteroidDeflectionSim } from '../components/AsteroidEarthSimulation';

function MitigationScreen() {
  return (
    <Box p={8}>
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
            <Button colorScheme="blue">Submit</Button>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}

export default MitigationScreen;