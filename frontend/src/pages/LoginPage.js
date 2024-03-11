import React from "react";
import Login from "../components/Login";
import "../index.css";
import Page from "../components/GlobeInteractive";

const LoginPage = () => {
  document.body.style.backgroundColor = "black";

  return (
    <div className="min-h-screen flex items-center overflow-hidden">
      <div className="flex-1 flex justify-center">
        <Login />
      </div>
      <Page />
    </div>
  );
};

export default LoginPage;
