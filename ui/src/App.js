import React from "react";
import ImpactZoneD3 from "./components/ImpactZoneMap";
import Globe from "./components/Earth";

export default function App() {
  return (
    <div>
      <ImpactZoneD3 />
      <Globe />
    </div>
  );
}