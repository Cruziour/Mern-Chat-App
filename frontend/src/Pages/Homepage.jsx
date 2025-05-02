import React, { useState } from "react";
import Signup from "../components/Authentication/Signup";
import Login from "../components/Authentication/Login";

const Homepage = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-[100vh] min-w-[100vw] flex justify-center items-center container">
      <div className="min-w-[90vw] min-h-[70vh] md:min-w-[80vw] lg:min-w-[30vw] flex flex-col gap-y-4">
        <div className="min-h-[10vh] border rounded-2xl flex justify-center items-center bg-indigo-950">
          <h1 className="text-2xl md:text-3xl lg:text-2xl font-light">
            Online Chating App
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border rounded-2xl overflow-hidden">
          <button
            onClick={() => setActiveTab("signup")}
            className={`w-1/2 py-2 text-center transition-all duration-300 ${
              activeTab === "signup"
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Signup
          </button>
          <button
            onClick={() => setActiveTab("login")}
            className={`w-1/2 py-2 text-center transition-all duration-300 ${
              activeTab === "login"
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Login
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[50vh] bg-gray-800 border rounded-2xl px-4 py-0">
          {activeTab === "signup" ? (
            <div className="mt-2">
              <Signup />
            </div>
          ) : (
            <div className="mt-2">
              <Login />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
