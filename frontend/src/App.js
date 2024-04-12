import React from "react";
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import TestPage from "./pages/TestPage";
import Stepper from "./pages/StepperPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" index element={<LoginPage />} />

        <Route path="/" index element={<MapPage />} />
        <Route path="/home" index element={<HomePage />} />
        {/* <Route path="/cards" index element={<CardPage />} /> */}
        <Route path="map" index element={<MapPage />} />
        <Route path="test" index element={<TestPage />} />
        <Route path="stepper" index element={<Stepper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
