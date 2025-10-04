import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Impactor2025 from "../components/Impactor2025";
import Starfield from "../components/Starfield";
import NebulaOverlay from "../components/NebulaOverlay";
import AsteroidsSection from "../components/AsteroidsSection";
import FinalCTA from "../components/FinalCTA";

export default function Home() {
  return (
    <div className="bg-black min-h-screen overflow-x-hidden">
      // in Home page
      <Starfield density={0.00045} speed={10} enableMotion />
      <NebulaOverlay />
      <Navbar />
      <HeroSection />
      <Impactor2025 />
      <AsteroidsSection />
      <FinalCTA />
    </div>
  );
}