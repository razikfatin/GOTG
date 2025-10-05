import React, { useState, useEffect, useRef } from "react";
import ApiService from "../components/utils/ApiService";
import { useNavigate } from "react-router-dom";
import AsteroidDropdown from "../components/Dropdown";
import {
    Box,
    VStack,
    Text,
    Flex,
    Card,
    Button,
    Badge,
    Image,
    useDisclosure,
} from "@chakra-ui/react";
import Starfield from "../components/Starfield";
import NebulaOverlay from "../components/NebulaOverlay";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { feature } from "topojson-client";

// 🌍 D3 Rotating Earth Globe Loader
function D3EarthGlobe() {
    const ref = useRef(null);

    useEffect(() => {
        const width = 400;
        const height = 400;

        const svg = d3
            .select(ref.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("width", "100%")
            .style("height", "100%")
            .style("background", "transparent");

        const projection = d3.geoOrthographic()
            .scale(180)
            .translate([width / 2, height / 2])
            .clipAngle(90);

        const path = d3.geoPath(projection);
        const graticule = d3.geoGraticule10();
        const g = svg.append("g");

        g.append("path")
            .datum({ type: "Sphere" })
            .attr("fill", "#0b1a3d")
            .attr("stroke", "#4fd1c5")
            .attr("stroke-width", 0.5)
            .attr("d", path);

        g.append("path")
            .datum(graticule)
            .attr("fill", "none")
            .attr("stroke", "#4fd1c5")
            .attr("stroke-opacity", 0.3)
            .attr("stroke-width", 0.5)
            .attr("d", path);

        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(worldData => {
            const countries = feature(worldData, worldData.objects.countries);
            g.append("path")
                .datum(countries)
                .attr("fill", "#63b3ed")
                .attr("stroke", "#90cdf4")
                .attr("stroke-width", 0.3)
                .attr("d", path);

            d3.timer((elapsed) => {
                projection.rotate([elapsed / 100, -15]);
                g.selectAll("path").attr("d", path);
            });
        });

        return () => svg.selectAll("*").remove();
    }, []);

    return <svg ref={ref}></svg>;
}

// 🌠 Main Screen
function MitigationScreen() {
    const navigate = useNavigate();
    const [asteroidChosen, setAsteroidChosen] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState(null);
    const [asteroidData, setAsteroidData] = useState([]);
    const [selectedAsteroid, setSelectedAsteroid] = useState(null);
    const [energyData, setEnergyData] = useState(null);
    const { isOpen, onToggle } = useDisclosure();

    const imageCandidates = [
        "https://upload.wikimedia.org/wikipedia/commons/e/e1/Near-Earth_asteroid_artwork.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/1/1f/PIA02923_Eros_approaches.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/9/99/Ryugu_in_true_color.jpg",
    ];
    const [imgIdx, setImgIdx] = useState(0);
    const [imgLoaded, setImgLoaded] = useState(false);
    const handleImgError = () => setImgIdx((i) => (i + 1) % imageCandidates.length);
    const handleImgLoad = () => setImgLoaded(true);

    useEffect(() => {
        const fetchAsteroids = async () => {
            try {
                const data = await ApiService.get("neo");
                setAsteroidData(data);
            } catch (error) {
                console.error("Error fetching NEO data:", error);
            }
        };
        fetchAsteroids();
    }, []);

    return (
        <>
            <Starfield density={0.00045} speed={10} enableMotion />
            <NebulaOverlay />

            <Box
                minH="100vh"
                display="flex"
                justifyContent="center"
                alignItems="center"
                bgGradient="linear(to-br, gray.900, black, blue.900)"
                p={8}
            >
                {!asteroidChosen ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Box
                            bg="rgba(255, 255, 255, 0.1)"
                            backdropFilter="blur(10px)"
                            borderRadius="2xl"
                            boxShadow="0 0 50px rgba(0,0,0,0.3)"
                            p={8}
                        >
                            <VStack spacing={8} w="full" maxW="1000px" align="center" mx="auto">
                                <Text
                                    fontSize={{ base: "3xl", md: "5xl" }}
                                    fontWeight="900"
                                    bgGradient="linear(to-r, cyan.300, blue.400, purple.500)"
                                    bgClip="text"
                                    textShadow="0 0 40px rgba(56,189,248,0.5)"
                                >
                                    🌌 NEAR-EARTH OBJECT OBSERVATION CENTER
                                </Text>
                                <Text color="whiteAlpha.700" fontSize={{ base: "md", md: "lg" }}>
                                    Real-time asteroid tracking, analysis, and planetary defense simulation
                                </Text>

                                {/* ---- Visualization ---- */}
                                <Box
                                    position="relative"
                                    w="100%"
                                    h="400px"
                                    borderRadius="3xl"
                                    overflow="hidden"
                                    boxShadow="0 0 60px rgba(0,0,0,0.8), 0 0 80px rgba(0,180,255,0.2)"
                                    bg="linear-gradient(135deg, #0b1220, #1a2235)"
                                >
                                    <Image
                                        src={imageCandidates[imgIdx]}
                                        
                                        objectFit="cover"
                                        w="100%"
                                        h="100%"
                                        opacity="0.92"
                                        onError={handleImgError}
                                        onLoad={handleImgLoad}
                                    />
                                    {!imgLoaded && (
                                        <Box
                                            position="absolute"
                                            inset={0}
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            bg="blackAlpha.700"
                                        >
                                            <Box w="400px" h="400px">
                                                <D3EarthGlobe />
                                            </Box>
                                        </Box>
                                    )}
                                </Box>

                                {/* ---- Asteroid Selection ---- */}
                                <Flex
                                    w="full"
                                    direction={{ base: "column", md: "row" }}
                                    gap={10}
                                    align="stretch"
                                    justify="center"
                                    mt={10}
                                >
                                    <Box
                                        flex="1"
                                        p={6}
                                        borderRadius="2xl"
                                        bg="rgba(255,255,255,0.08)"
                                        backdropFilter="blur(10px)"
                                        boxShadow="0 0 30px rgba(59,130,246,0.3)"
                                    >
                                        <Text color="whiteAlpha.800" fontWeight="bold" mb={3} fontSize="lg">
                                            Select an Asteroid
                                        </Text>
                                        <AsteroidDropdown
                                            asteroids={asteroidData}
                                            onSelectAsteroid={async (asteroid) => {
                                                setSelectedAsteroid(asteroid);
                                                try {
                                                    const data = await ApiService.get(`energy?id=${asteroid.id}`);
                                                    setEnergyData(data);
                                                    localStorage.setItem("energyData", JSON.stringify(data));
                                                } catch (error) {
                                                    console.error("Error fetching energy data:", error);
                                                }
                                            }}
                                        />
                                    </Box>

                                    {selectedAsteroid && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5 }}
                                            style={{ flex: 1 }}
                                        >
                                            <Box
                                                p={6}
                                                borderRadius="2xl"
                                                bg="rgba(255,255,255,0.1)"
                                                backdropFilter="blur(14px)"
                                                boxShadow="0 0 50px rgba(0,255,255,0.3)"
                                                color="white"
                                            >
                                                <Text fontSize="2xl" fontWeight="bold" mb={2} color="cyan.300">
                                                    {selectedAsteroid.name}
                                                </Text>
                                                <Badge
                                                    colorScheme={
                                                        selectedAsteroid.is_potentially_hazardous_asteroid
                                                            ? "red"
                                                            : "green"
                                                    }
                                                    mb={3}
                                                    px={3}
                                                    py={1}
                                                    borderRadius="md"
                                                >
                                                    {selectedAsteroid.is_potentially_hazardous_asteroid
                                                        ? "Potentially Hazardous"
                                                        : "Safe Orbit"}
                                                </Badge>
                                                <VStack align="start" spacing={2} fontSize="sm" color="whiteAlpha.800">
                                                    <Text>
                                                        <b>Diameter:</b>{" "}
                                                        {selectedAsteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(2)} -{" "}
                                                        {selectedAsteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(2)} m
                                                    </Text>
                                                    <Text>
                                                        <b>Velocity:</b>{" "}
                                                        {selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second} km/s
                                                    </Text>
                                                    <Text>
                                                        <b>Distance:</b>{" "}
                                                        {Number(
                                                            selectedAsteroid.close_approach_data[0].miss_distance.kilometers
                                                        ).toLocaleString()} km
                                                    </Text>
                                                </VStack>

                                                <Button
                                                    colorScheme="blue"
                                                    mt={6}
                                                    width="full"
                                                    size="lg"
                                                    fontWeight="bold"
                                                    boxShadow="0 0 25px rgba(66,153,225,0.6)"
                                                    onClick={() => setAsteroidChosen(true)}
                                                >
                                                    Proceed to Mitigation ➜
                                                </Button>

                                                {energyData && (
                                                    <Box
                                                        mt={4}
                                                        p={3}
                                                        borderRadius="xl"
                                                        bg="rgba(255,255,255,0.03)"
                                                        border="1px solid rgba(255,255,255,0.15)"
                                                        boxShadow="0 0 10px rgba(0,255,255,0.08)"
                                                        fontSize="sm"
                                                    >
                                                        <Text fontSize="xl" fontWeight="bold" mb={3} color="cyan.300">
                                                            💥 Impact Energy Analysis
                                                        </Text>
                                                        <Box
                                                            p={3}
                                                            borderRadius="md"
                                                            bg="rgba(0,0,0,0.3)"
                                                            border="1px solid rgba(255,255,255,0.1)"
                                                        >
                                                            <Text fontSize="lg" fontWeight="bold" mb={2}>
                                                                Combined Density Data (Low, Nominal, High)
                                                            </Text>
                                                            <VStack align="start" spacing={1} fontSize="sm">
                                                                <Text>
                                                                    <b>Density:</b> {energyData.low.density.toLocaleString()}, {energyData.nominal.density.toLocaleString()}, {energyData.high.density.toLocaleString()} kg/m³
                                                                </Text>
                                                                <Text>
                                                                    <b>Velocity:</b> {(energyData.low.velocity_m_s / 1000).toFixed(2)}, {(energyData.nominal.velocity_m_s / 1000).toFixed(2)}, {(energyData.high.velocity_m_s / 1000).toFixed(2)} km/s
                                                                </Text>
                                                                <Text>
                                                                    <b>Mass:</b> {energyData.low.mass_kg.toExponential(3)}, {energyData.nominal.mass_kg.toExponential(3)}, {energyData.high.mass_kg.toExponential(3)} kg
                                                                </Text>
                                                                <Text>
                                                                    <b>Kinetic Energy (J):</b> {energyData.low.kinetic_energy_joules.toExponential(3)}, {energyData.nominal.kinetic_energy_joules.toExponential(3)}, {energyData.high.kinetic_energy_joules.toExponential(3)}
                                                                </Text>
                                                                <Text>
                                                                    <b>Kinetic Energy (Mt):</b> {energyData.low.kinetic_energy_megatons.toFixed(2)}, {energyData.nominal.kinetic_energy_megatons.toFixed(2)}, {energyData.high.kinetic_energy_megatons.toFixed(2)} Mt TNT
                                                                </Text>
                                                                <Text>
                                                                    <b>Impact Index:</b> {energyData.low.impact_index}, {energyData.nominal.impact_index}, {energyData.high.impact_index}
                                                                </Text>
                                                            </VStack>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        </motion.div>
                                    )}
                                </Flex>
                            </VStack>
                        </Box>
                    </motion.div>
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

                        <Flex
                            direction="row"
                            justify="center"
                            align="stretch"
                            gap={8}
                            overflowX="auto"
                            py={4}
                            px={2}
                            sx={{
                                "&::-webkit-scrollbar": { height: "6px" },
                                "&::-webkit-scrollbar-thumb": {
                                    background: "rgba(255,255,255,0.2)",
                                    borderRadius: "10px",
                                },
                            }}
                        >
                            {[
                                {
                                    title: "Civil Defense",
                                    desc: "Evacuating the region around a small impact to minimize casualties and damage.",
                                    gradient: "linear(to-br, orange.400, red.500)",
                                    icon: "🧍‍♂️",
                                },
                                {
                                    title: "Gravity Tractor",
                                    desc: "Gradually changes the orbit of a near-Earth object so that it misses Earth.",
                                    gradient: "linear(to-br, teal.400, cyan.500)",
                                    icon: "🛰️",
                                },
                                {
                                    title: "Kinetic Impact",
                                    desc: "Delivers a large amount of momentum instantaneously to shift the trajectory away.",
                                    gradient: "linear(to-br, pink.400, purple.500)",
                                    icon: "🚀",
                                },
                                {
                                    title: "Nuclear Detonation",
                                    desc: "Applies immense energy to alter the orbit of a threatening NEO, preventing collision.",
                                    gradient: "linear(to-br, yellow.400, orange.500)",
                                    icon: "☢️",
                                },
                            ].map(({ title, desc, gradient, icon }) => (
                                <Card.Root
                                    key={title}
                                    onClick={() => setSelectedStrategy(title)}
                                    cursor="pointer"
                                    bgGradient={gradient}
                                    color="white"
                                    borderRadius="2xl"
                                    boxShadow="2xl"
                                    w="280px"
                                    minW="280px"
                                    transition="all 0.4s ease-in-out"
                                    _hover={{
                                        transform: "translateY(-10px) scale(1.05)",
                                        boxShadow: "0px 0px 35px rgba(255,255,255,0.25)",
                                    }}
                                >
                                    <Card.Header
                                        textAlign="center"
                                        fontSize="2xl"
                                        fontWeight="bold"
                                        py={5}
                                    >
                                        {icon} {title}
                                    </Card.Header>
                                    <Card.Body px={6} pb={6}>
                                        <Text fontSize="md" lineHeight="1.6" color="whiteAlpha.900">
                                            {desc}
                                        </Text>
                                    </Card.Body>
                                </Card.Root>
                            ))}
                        </Flex>

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
                                    onClick={() => {
                                        if (selectedAsteroid) {
                                            localStorage.setItem("selectedAsteroid", JSON.stringify(selectedAsteroid));
                                        }
                                        if (selectedStrategy) {
                                            localStorage.setItem("selectedStrategy", JSON.stringify(selectedStrategy));
                                        }
                                        navigate("/results");
                                    }}
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
                            Source:{" "}
                            <em>
                                Defending Planet Earth: Near-Earth-Object Surveys and Hazard Mitigation Strategies
                            </em>
                            , The National Academies Press, 2010.{" "}
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
        </>
    );
}

export default MitigationScreen;