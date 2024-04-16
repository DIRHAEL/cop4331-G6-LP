import React from "react";

import LeftSide from "../components/LeftSide";

import Page from "../components/GlobeInteractive";

const HomePage = () => {
  document.body.style.backgroundColor = "black";

  function switchToLogin() {
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen flex items-center overflow-hidden">
      <div className="flex-1 flex flex-col items-center">
        <h1 className="text-white text-5xl">Welcome to Memory Map</h1>
        <button
          onClick={switchToLogin}
          className="bg-purple-500 hover:bg-purple-700 text-black py-2 px-4 rounded text-xl w-1/2 mt-10"
        >
          Get Started
        </button>
      </div>
      <Page />
    </div>
  );
};

export default HomePage;
