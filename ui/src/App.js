import { Provider } from "./components/ui/provider";
import React from "react";
import ImpactZoneD3 from "./components/ImpactZoneMap";
import AsteroidEarthSimulation from "./components/AsteroidEarthSimulation";
import MitigationScreen from "./pages/MitigationScreen";
import Home from "./pages/Home";
import Team from "./pages/Team";

export default function App() {
  return (
    <Provider>
      {/* <div>
        <ImpactZoneD3 />
        <AsteroidEarthSimulation />
      </div> */}
      <Home />
      {/* <Team /> */}
    </Provider>
  );
}