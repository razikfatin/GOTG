const sampleAsteroids = [
  { id: 1, name: "A-401X", time: "2h 30m", velocity: "24 km/s" },
  { id: 2, name: "TX-998", time: "6h 15m", velocity: "18 km/s" },
  { id: 3, name: "Omega-7", time: "12h 00m", velocity: "31 km/s" }
];

export default function AsteroidList() {
  return (
    <section className="text-white text-center my-10">
      <h3 className="text-3xl font-semibold mb-6">Upcoming Impacts</h3>
      <div className="flex justify-center gap-8">
        {sampleAsteroids.map(a => (
          <div key={a.id} className="bg-gray-900 p-6 rounded-xl shadow-lg w-60 hover:scale-105 transition">
            <h4 className="text-xl font-bold mb-2">{a.name}</h4>
            <p>⏱ {a.time}</p>
            <p>💨 {a.velocity}</p>
          </div>
        ))}
      </div>
    </section>
  );
}