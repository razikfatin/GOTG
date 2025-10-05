import React from "react";

export default function AsteroidEarthSimulation() {
  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <div style={{ backgroundColor: "black", backgroundImage: "url('/static/space-bg.jpg')", backgroundSize: "cover", borderRadius: "50%", width: "600px", height: "600px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src="earth.png" alt="Earth" style={{ width: "600px" }} />
      </div>
    </div>
  );
}