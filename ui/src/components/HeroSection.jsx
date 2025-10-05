// src/components/HeroSection.jsx
import { Container, Stack, Heading, Text, Button, HStack, Box, Link } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionStack = motion(Stack);
const MotionHeading = motion(Heading);

export default function HeroSection() {
  return (
    <Box as="section" bg="transparent" color="white">
      {/* same margins as Navbar */}
      <Container maxW="7xl" px={6}>
        {/* fill page below the navbar */}
        <MotionStack
          minH="calc(100vh - 96px)"   // adjust if your navbar height changes
          align="center"
          justify="center"
          textAlign="center"
          spacing={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          {/* Headline */}
          <MotionHeading
            as="h1"
            size="2xl"
            fontWeight="extrabold"
            letterSpacing="wider"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            “Defend Earth!”
          </MotionHeading>

          {/* Accent underline (per wireframe) */}
          <Box h="2px" w={{ base: "120px", md: "180px" }} bg="cyan.400" opacity={0.7} />

          {/* Subhead */}
          <Text maxW="xl" color="whiteAlpha.800" fontSize={{ base: "md", md: "lg" }}>
            Watch asteroids, run simulations, and save our planet from potential impact zones.
          </Text>

          {/* CTAs */}
          <HStack spacing={6} pt={2}>
            <Button
              as={Link}
              href="/mitigation"
              size="lg"
              px={8}
              py={6}
              fontWeight="bold"
              colorScheme="blue"
              shadow="xl"
            >
              Simulate
            </Button>

            <Button
              as={Link}
              href="/demo"
              size="lg"
              px={8}
              py={6}
              fontWeight="bold"
              variant="outline"
              borderColor="blue.300"
              _hover={{ bg: "blue.500", color: "black" }}
            >
              Demo
            </Button>
          </HStack>
        </MotionStack>
      </Container>
    </Box>
  );
}
