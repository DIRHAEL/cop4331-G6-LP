import React from "react";
import "./App.css";
import "./Dashboard.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import Dashboard from "./components/Dashboard"; 


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" index element={<LoginPage />} />
        <Route path="/home" index element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* <Route path="/cards" index element={<CardPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
