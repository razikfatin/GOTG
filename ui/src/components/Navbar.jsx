import { Flex, Text, HStack, Link, Image, Container } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionFlex = motion(Flex);

export default function Navbar() {
  return (
    <Container maxW="7xl" px={6}>
      <MotionFlex
        as="nav"
        justify="space-between"
        align="center"
        py={6}
        bg="transparent"
        color="white"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo + Name */}
        <Flex align="center" gap={3}>
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg"
            alt="AstroShield Logo"
            boxSize="32px"
            borderRadius="full"
          />
          <Text fontSize="lg" fontWeight="semibold" letterSpacing="wider">
            AstroShield
          </Text>
        </Flex>

        {/* Navigation */}
        <HStack spacing={16}> {/* more spacing between Home and Team */}
          <Link href="/" fontSize="lg" fontWeight="semibold" _hover={{ color: "cyan.400" }}>
            Home
          </Link>
          <Link href="/team" fontSize="lg" fontWeight="semibold" _hover={{ color: "cyan.400" }}>
            Team
          </Link>
        </HStack>
      </MotionFlex>
    </Container>
  );
}
