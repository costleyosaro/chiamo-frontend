// ✅ src/components/LoadingScreen.jsx
import React from "react";
import Lottie from "lottie-react";
import defaultLoader from "../assets/animations/CAR-LOADER.json"; // fallback animation

const LoadingScreen = ({
  animation = defaultLoader,
  message = "Loading...",
  size = 220,
  loop = true,
}) => {
  return (
    <div
      className="
        fixed inset-0 w-full h-full 
        flex flex-col items-center justify-center
        transition-colors duration-500 
        z-[99999]
      "
      style={{
        backgroundColor: "var(--loading-bg)",
        color: "var(--text-color)",
        minHeight: "100vh",
        minWidth: "100vw",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {/* ✅ Centered animation */}
      <Lottie
        animationData={animation}
        loop={loop}
        autoplay
        style={{
          width: size,
          height: size,
          display: "block",
          margin: "0 auto",
        }}
      />

      {/* ✅ Centered text message */}
      {message && (
        <p
          className="mt-6 text-lg font-semibold animate-pulse text-center"
          style={{
            color: "var(--text-color)",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingScreen;
