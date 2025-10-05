// src/pages/Team.jsx
import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    HStack,
    VStack,
    Image,
    Link,
    Button,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

// Replace with your real team data/photos
const TEAM = [
    {
        name: "Tushar Toteja",
        role: "UI/UX Designer & Developer",
        bio:
            "Leads UX & frontend—turns space telemetry into clear, fast, accessible interfaces. Design systems, data-viz, and motion-rich interactions.",
        email: "tushartoteja@gmail.com",
        linkedin: "https://www.linkedin.com/in/tushar-toteja",
        img: "/tushar.jpg",
    },
    {
        name: "Varun Dutia",
        role: "Frontend Developer",
        bio:
            "Frontend engineer focused on performance and clarity—builds interactive visuals and real-time mission dashboards.",
        email: "varundutia.hameer@gmail.com",
        linkedin: "https://www.linkedin.com/in/varun-dutia/",
        img: "/Varun.jpg",
    },
    {
        name: "V. Pavan Kalyan Reddy",
        role: "Frontend Developer",
        bio:
            "Turns orbital and trajectory data into intuitive React/TypeScript UIs—accessibility-first with smooth micro-interactions.",
        email: "pavankalyanreddy1305@gmail.com",
        linkedin: "https://www.linkedin.com/in/v-pavan-kalyan-reddy/",
        img: "/Pavan.jpeg",
    },
    {
        name: "Akshaya More",
        role: "Backend Developer",
        bio:
            "Designs reliable APIs and data pipelines for NEO feeds—Node/Python, caching, and auth to keep live space data flowing.",
        email: "akshayamore37@gmail.com",
        linkedin: "https://www.linkedin.com/in/akshaya-more-060a50197/",
        img: "/Akshaya.jpg",
    },
    {
        name: "Razik Fatin",
        role: "Backend Developer",
        bio:
            "Builds scalable services for geospatial and alerting workloads—stream ingestion, microservices, and fault-tolerant queues.",
        email: "razikfatin@gmail.com",
        linkedin: "https://www.linkedin.com/in/razikfatin",
        img: "/Razik.jpeg",
    },
    {
        name: "Amrita Surendran",
        role: "UI/UX Designer",
        bio:
            "Shapes flows and design systems for Nudge Lab : user research, rapid prototyping, and accessible space-data experiences.",
        email: "amritasurendran27@gmail.com",
        linkedin: "https://www.linkedin.com/in/amritasurendran/",
        img: "/Amrita.jpeg",
    },
];


// Inline icons
const MailIcon = (props) => (
    <Box as="svg" viewBox="0 0 24 24" w="1.2em" h="1.2em" {...props}>
        <path
            fill="currentColor"
            d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"
        />
    </Box>
);

const LinkedInIcon = (props) => (
    <Box as="svg" viewBox="0 0 24 24" w="1.2em" h="1.2em" {...props}>
        <path
            fill="currentColor"
            d="M6.94 8.5H3.75V20h3.19V8.5ZM5.34 7.1a1.85 1.85 0 1 0 0-3.7 1.85 1.85 0 0 0 0 3.7ZM20.25 20v-6.4c0-3.42-1.83-5.02-4.28-5.02-1.97 0-2.85 1.09-3.34 1.86v-1.6H9.47V20h3.16v-6.17c0-1.63.31-3.21 2.33-3.21 1.99 0 2.02 1.86 2.02 3.31V20h3.27Z"
        />
    </Box>
);

export default function Team() {
    // Fixed dark theme tokens (v3-safe)
    const cardBg = "blackAlpha.500";
    const border = "whiteAlpha.200";

    return (
        <Box as="main" bg="black" color="white">
            {/* Group photo banner */}
            <Box position="relative" h={{ base: "260px", md: "360px" }} overflow="hidden">
                <Image
                    src="/group.jpg"
                    alt="AstroShield team"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    objectPosition="center"
                    fallbackSrc="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                    filter="brightness(0.55)"
                />

                {/* Top-aligned overlay so heading isn't hidden */}
                <Box position="absolute" inset={0} zIndex={1} display="flex" alignItems="flex-start">
                    <Container maxW="7xl" px={6} w="100%">
                        <Heading
                            as="h1"
                            size="2xl"
                            letterSpacing="wider"
                            textShadow="0 6px 30px rgba(0,0,0,0.6)"
                            mt={{ base: 6, md: 10 }}   // move down a bit from top edge
                        >
                            GuardiansOfTheGalaxy
                        </Heading>
                    </Container>
                </Box>
            </Box>

            {/* Members grid */}
            <Box py={{ base: 10, md: 16 }}>
                <Container maxW="7xl" px={6}>
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={{ base: 6, md: 8 }}>
                        {TEAM.map((m, idx) => (
                            <MotionBox
                                key={idx}
                                rounded="2xl"
                                bg={cardBg}
                                border="1px solid"
                                borderColor={border}
                                p={{ base: 5, md: 6 }}
                                backdropFilter="saturate(140%) blur(8px)"
                                boxShadow="0 10px 40px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.06)"
                                whileHover={{ y: -4, boxShadow: "0 18px 60px rgba(0,0,0,0.6)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <HStack spacing={4} align="center" mb={4}>
                                    <Box
                                        boxSize="76px"
                                        rounded="full"
                                        overflow="hidden"
                                        border="2px solid"
                                        borderColor="whiteAlpha.300"
                                        flexShrink={0}
                                    >
                                        <Image
                                            src={m.img}
                                            alt={m.name}
                                            w="100%"
                                            h="100%"
                                            objectFit="cover"
                                            objectPosition="center"
                                            fallbackSrc="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                                        />
                                    </Box>
                                    <VStack align="start" spacing={0}>
                                        <Heading as="h3" size="md" lineHeight="1.2">
                                            {m.name}
                                        </Heading>
                                        <Text fontSize="sm" color="whiteAlpha.700">
                                            {m.role}
                                        </Text>
                                    </VStack>
                                </HStack>

                                <Text fontSize="sm" color="whiteAlpha.900" mb={4}>
                                    {m.bio}
                                </Text>

                                <HStack spacing={3}>
                                    <Button
                                        as={Link}
                                        href={`mailto:${m.email}`}
                                        leftIcon={<MailIcon />}
                                        size="sm"
                                        variant="outline"
                                        colorScheme="whiteAlpha"
                                        _hover={{ bg: "whiteAlpha.200" }}
                                    >
                                        Email
                                    </Button>
                                    <Button
                                        as={Link}
                                        href={m.linkedin}
                                        isExternal
                                        leftIcon={<LinkedInIcon />}
                                        size="sm"
                                        colorScheme="blue"
                                        variant="solid"
                                    >
                                        LinkedIn
                                    </Button>
                                </HStack>
                            </MotionBox>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>
        </Box>
    );
}
