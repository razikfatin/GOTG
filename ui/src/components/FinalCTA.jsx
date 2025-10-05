// src/components/FinalCTA.jsx
import { Box, Container, Heading, VStack, Button, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MotionBox = motion(Box);

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <Box
      as="section"
      color="white"
      py={{ base: 16, md: 24 }}
      textAlign="center"
    >
      <Container maxW="3xl" px={6}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Heading
            as="h2"
            size="2xl"
            mb={6}
            letterSpacing="wider"
            fontWeight="extrabold"
          >
            LET’S STOP THIS!
          </Heading>

          <Text mb={8} color="whiteAlpha.800" fontSize="lg">
            The asteroids are closing in — take action now and protect Earth.
          </Text>

          <Button
            size="lg"
            px={10}
            py={6}
            fontSize="xl"
            fontWeight="bold"
            colorScheme="blue"
            rounded="lg"
            boxShadow="0 8px 30px rgba(59,130,246,0.5)"
            _hover={{
              transform: "scale(1.05)",
              boxShadow: "0 12px 40px rgba(59,130,246,0.65)",
            }}
            transition="all 0.3s ease"
            onClick={() => navigate("/mitigation")}
          >
            Simulate
          </Button>
        </MotionBox>
      </Container>
    </Box>
  );
}
