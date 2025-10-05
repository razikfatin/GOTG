// src/components/HeroSection.jsx
import { Container, Stack, Heading, Text, Button, HStack, Box, Link } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionStack = motion(Stack);
const MotionHeading = motion(Heading);
const MotionButton = motion(Button);
const MotionBox = motion(Box);

export default function HeroSection() {
  return (
    <Box as="section" bg="transparent" color="white">
      <Container maxW="7xl" px={6}>
        <MotionStack
          minH="calc(100vh - 96px)"
          align="center"
          justify="center"
          textAlign="center"
          spacing={7}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Headline */}
          <MotionHeading
            as="h1"
            size="2xl"
            fontWeight="extrabold"
            lineHeight="1.2"
            letterSpacing="tight"
            bgGradient="linear(to-r, cyan.300, blue.200)"
            bgClip="text"
            color="white"
            textShadow="0 0 15px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 150, 255, 0.4)"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            Defend Earth, One Simulation at a Time
          </MotionHeading>

          {/* Accent underline */}
          <MotionBox
            h="2px"
            w={{ base: "140px", md: "200px" }}
            bg="cyan.400"
            rounded="full"
            opacity={0.9}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transformOrigin="center"
            transition={{ duration: 0.6, delay: 0.2 }}
          />

          {/* Subhead */}
          <Text
            maxW="2xl"
            color="whiteAlpha.900"
            fontSize={{ base: "md", md: "lg" }}
            fontWeight="medium"
          >
            Track near-Earth objects, test defense strategies, and visualize impact zones — all
            inside an immersive sandbox built for explorers and problem-solvers.
          </Text>

          {/* CTAs */}
          <HStack spacing={6} pt={3}>
            <MotionButton
              as={Link}
              href="/mitigation"
              size="lg"
              px={8}
              py={6}
              fontWeight="bold"
              rounded="xl"
              color="black"
              bgGradient="linear(to-r, cyan.300, teal.300)"
              shadow="xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              _hover={{
                shadow: "2xl",
                filter: "brightness(1.1)",
              }}
            >
              Simulate
            </MotionButton>

            <MotionButton
              as={Link}
              href="/demo"
              size="lg"
              px={8}
              py={6}
              fontWeight="semibold"
              rounded="xl"
              variant="outline"
              borderWidth="2px"
              borderColor="cyan.300"
              color="cyan.200"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              _hover={{
                bg: "whiteAlpha.100",
                borderColor: "cyan.200",
                color: "white",
              }}
            >
              Demo
            </MotionButton>
          </HStack>
        </MotionStack>
      </Container>
    </Box>
  );
}
