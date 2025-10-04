import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center mt-10 text-white px-4">
      <motion.h2 
        initial={{ opacity: 0, y: -30 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl font-extrabold mb-4"
      >
        "Defend Earth!"
      </motion.h2>
      <p className="max-w-xl text-gray-300 mb-6">
        Watch asteroids, run simulations, and save our planet from potential impact zones.
      </p>
      <div className="flex gap-6">
        <button className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-lg text-lg font-bold shadow-lg hover:shadow-blue-400/50 transition-all">
          Simulate
        </button>
        <button className="border border-blue-400 hover:bg-blue-500 hover:text-black px-8 py-3 rounded-lg text-lg font-bold transition-all">
          Demo
        </button>
      </div>
    </section>
  );
}