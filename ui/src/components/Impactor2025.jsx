import { ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';

const data = [{ name: 'Impact', value: 78, fill: '#00FFFF' }];

export default function Impactor2025() {
  return (
    <section className="text-white text-center my-10">
      <h3 className="text-3xl font-semibold mb-4">Impactor - 2025</h3>
      <div className="w-full flex justify-center">
        <ResponsiveContainer width={200} height={200}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" barSize={10} data={data}>
            <RadialBar minAngle={15} clockWise dataKey="value" />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-gray-400 mt-2">Disruption Scale</p>
      <p className="text-sm mt-1">Impact Time: 13:45 UTC | Speed: 28 km/s</p>
    </section>
  );
}