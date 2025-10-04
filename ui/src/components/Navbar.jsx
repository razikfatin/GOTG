import { Flex, Text, HStack, Link } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionFlex = motion(Flex);

export default function Navbar() {
  return (
    <MotionFlex
      as="nav"
      justify="space-between"
      align="center"
      px={10}
      py={6}
      bg="transparent"
      color="white"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Text fontSize="2xl" fontWeight="bold" letterSpacing="widest">
        🌍 DEFEND EARTH
      </Text>

      <HStack spacing={6}>
        <Link _hover={{ color: "cyan.400" }}>Home</Link>
        <Link _hover={{ color: "cyan.400" }}>Team</Link>
      </HStack>
    </MotionFlex>
  );
}
