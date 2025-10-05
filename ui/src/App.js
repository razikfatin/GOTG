import { Provider } from "./components/ui/provider";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Box, HStack, Button } from "@chakra-ui/react";
import Home from "./pages/Home";
import MitigationScreen from "./pages/MitigationScreen";
import Team from "./pages/Team";
import Results from "./pages/Results";

export default function App() {
  return (
    <Provider>
      <Router>
        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mitigation" element={<MitigationScreen />} />
          <Route path="/team" element={<Team />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </Router>
    </Provider>
  );
}
