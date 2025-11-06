import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center"
      style={{
        background:
          "radial-gradient(circle at center, #111 0%, #000 100%)",
      }}
    >
      <h1 className="text-7xl font-bold text-orange-500 mb-4">404</h1>
      <p className="text-xl mb-6 text-gray-400">Page Not Found</p>
      <button
        onClick={() => navigate("/")}
        className="bg-orange-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-orange-400 transition-all duration-300"
      >
        Go Home
      </button>
    </div>
  );
}
