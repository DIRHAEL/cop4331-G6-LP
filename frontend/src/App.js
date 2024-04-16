import React from "react";
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import TestPage from "./pages/TestPage";
import Stepper from "./pages/StepperPage";
import Practice from "./components/practiceImage";
import Gallery from "./pages/GallaryPage";

import GalleryComponet from "./components/Gallery/GalleryGrid";

import ResetPage from "./pages/ResetPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" index element={<LoginPage />} />
        <Route path="forgot" index element={<ResetPage />} />
        <Route path="/" index element={<LoginPage />} />
        <Route path="home" index element={<HomePage />} />
        {/* <Route path="/cards" index element={<CardPage />} /> */}
        <Route path="map" index element={<MapPage />} />
        <Route path="test" index element={<TestPage />} />
        <Route path="stepper" index element={<Stepper />} />
        <Route path="image" index element={<Practice />} />
        <Route path="gallery" index element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
