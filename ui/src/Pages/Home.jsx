import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Impactor2025 from "../components/Impactor2025";
import AsteroidList from "../components/AsteroidList";
import FooterCTA from "../components/FooterCTA";

export default function Home() {
  return (
    <div className="bg-black min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <Impactor2025 />
      <AsteroidList />
      <FooterCTA />
    </div>
  );
}