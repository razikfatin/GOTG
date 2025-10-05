

import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import ImpactZoneMap from "../components/ImpactZoneMap";

export default function Results() {
  // Example data — replace with real API or state data
  const impactZones = [
    { id: 1, name: "Zone A", latitude: 37.7749, longitude: -122.4194, scale: 6.5, type: "earthquake" },
    { id: 2, name: "Zone B", latitude: 35.6895, longitude: 139.6917, scale: 8.0, type: "tsunami" },
    { id: 3, name: "Zone C", latitude: -33.8688, longitude: 151.2093, scale: 5.8, type: "earthquake" },
  ];

  return (
    <Box p={10}>
      <Heading textAlign="center" mb={6}>
        🌎 Impact Zone Visualization
      </Heading>
      <Text textAlign="center" color="gray.600" mb={8}>
        Visualizing recent impact events with dynamic scaling and disaster flags.
      </Text>

      <ImpactZoneMap
        zones={impactZones}
        tsunami={impactZones.some(zone => zone.type === "tsunami")}
        earthquake={impactZones.some(zone => zone.type === "earthquake")}
      />
    </Box>
  );
}