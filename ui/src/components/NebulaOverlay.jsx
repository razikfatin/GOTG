import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MBox = motion(Box);

export default function NebulaOverlay() {
  return (
    <MBox
      position="fixed"
      inset={0}
      zIndex={-1}
      pointerEvents="none"
      initial={{ scale: 1, rotate: 0, opacity: 0.35 }}
      animate={{ scale: 1.1, rotate: 360, opacity: 0.35 }}
      transition={{ duration: 240, ease: "linear", repeat: Infinity }}
      // soft galaxy/nebula gradient blotches
      bgGradient="
        radial-gradient(700px 400px at 20% 30%, rgba(59,130,246,0.12), transparent 60%),
        radial-gradient(600px 500px at 80% 70%, rgba(168,85,247,0.10), transparent 60%),
        radial-gradient(500px 350px at 60% 20%, rgba(34,211,238,0.10), transparent 60%)
      "
    />
  );
}
