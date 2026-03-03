import React from "react";
import Lottie from "lottie-react";
import bagLoader from "../assets/animations/bagLoader.json";

export default function PageTransitionLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[9999]">
      <Lottie animationData={bagLoader} loop style={{ width: 200, height: 200 }} />
      <p className="absolute bottom-16 text-gray-700 font-semibold animate-pulse">
        Please wait...
      </p>
    </div>
  );
}
