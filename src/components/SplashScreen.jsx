// src/components/SplashScreen.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import cartAnimation from "../assets/animations/Cartitem.json";
import "./SplashScreen.css";

// ============ CONFIGURATION ============
const CONFIG = {
  title: "ChiamoOrder",
  tagline: { part1: "Shop smarter, ", part2: "Order faster." },
  splashDuration: 5000,
  letterDelay: 0.05,
};

// ============ IMAGE URLS ============
const IMAGES = {
  chiamoLogo: "https://ik.imagekit.io/ljwnlcbqyu/CHIAMO_MULTITRADE_LOGO.png",
  ghadcoLogo: "https://ik.imagekit.io/ljwnlcbqyu/GHADCO_LOGO.png",
  mamudaLogo: "https://ik.imagekit.io/ljwnlcbqyu/mamuda-logo.png",
};

// ============ ANIMATED TITLE ============
const AnimatedTitle = ({ text }) => {
  const chiamoEnd = text.indexOf("Order");
  const part1 = text.slice(0, chiamoEnd);
  const part2 = text.slice(chiamoEnd);

  const renderLetters = (str, className) =>
    str.split("").map((char, i) => (
      <motion.span
        key={`${className}-${i}`}
        className={`sp-letter ${className}`}
        variants={{
          hidden: { opacity: 0, y: 25, rotateZ: -8, scale: 0.8 },
          visible: {
            opacity: 1,
            y: 0,
            rotateZ: 0,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 280,
              damping: 18,
            },
          },
        }}
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ));

  return (
    <motion.div
      className="sp-title-wrap"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: CONFIG.letterDelay,
            delayChildren: 0.3,
          },
        },
      }}
    >
      {renderLetters(part1, "sp-letter--primary")}
      {renderLetters(part2, "sp-letter--accent")}
    </motion.div>
  );
};



// ============ MAIN SPLASH SCREEN ============
const SplashScreen = ({ onFinish }) => {
  const [show, setShow] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  const partnerLogos = useMemo(
    () => [
      { src: IMAGES.chiamoLogo, alt: "Chiamo Multitrade" },
      { src: IMAGES.ghadcoLogo, alt: "Ghadco Nigeria" },
      { src: IMAGES.mamudaLogo, alt: "Mamuda Group" },
    ],
    []
  );

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setShowContent(true), 200));
    timers.push(setTimeout(() => setShowTagline(true), 1200));
    timers.push(setTimeout(() => setShowFooter(true), 1800));
    timers.push(
      setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          if (typeof onFinish === "function") onFinish();
        }, 500);
      }, CONFIG.splashDuration)
    );
    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  const handleSkip = useCallback(() => {
    if (showTagline) {
      setShow(false);
      setTimeout(() => {
        if (typeof onFinish === "function") onFinish();
      }, 500);
    }
  }, [onFinish, showTagline]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="sp-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onClick={handleSkip}
        >
          {/* ===== WHITE SECTION (Top) ===== */}
          <div className="sp-top">
            {/* Background decorations */}
            <div className="sp-bg-glow sp-bg-glow--1" />
            <div className="sp-bg-glow sp-bg-glow--2" />

            {/* Title */}
            <motion.div
              className="sp-title-area"
              initial={{ opacity: 0, y: -20 }}
              animate={
                showContent
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: -20 }
              }
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <AnimatedTitle text={CONFIG.title} />
            </motion.div>

            {/* Cart Animation */}
            <motion.div
              className="sp-animation-wrap"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={
                showContent
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.7 }
              }
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Lottie
                animationData={cartAnimation}
                loop
                autoplay
                className="sp-cart-lottie"
              />
            </motion.div>

            {/* Tagline - Two colors */}
            <motion.p
              className="sp-tagline"
              initial={{ opacity: 0, y: 12 }}
              animate={
                showTagline
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 12 }
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className="sp-tagline--yellow">{CONFIG.tagline.part1}</span>
              <span className="sp-tagline--blue">{CONFIG.tagline.part2}</span>
            </motion.p>
          </div>

                    {/* ===== HILL/SLOPE DIVIDER ===== */}
          <div className="sp-hill-wrap">
            <svg
              className="sp-hill-svg"
              viewBox="0 0 1440 160"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,160 L0,100 Q360,0 720,80 Q1080,160 1440,60 L1440,160 Z"
                fill="#0a1f3f"
              />
            </svg>
          </div>

          {/* ===== DARK BLUE SECTION (Bottom) ===== */}
          <motion.div
            className="sp-bottom"
            initial={{ opacity: 0 }}
            animate={
              showFooter ? { opacity: 1 } : { opacity: 0 }
            }
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Powered By */}
            <p className="sp-powered">POWERED BY</p>

            {/* Partner Logos */}
            <div className="sp-partners">
              {partnerLogos.map((logo, index) => (
                <motion.div
                  key={index}
                  className="sp-partner-card"
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={
                    showFooter
                      ? { opacity: 1, y: 0, scale: 1 }
                      : { opacity: 0, y: 15, scale: 0.9 }
                  }
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + index * 0.15,
                    ease: "easeOut",
                  }}
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="sp-partner-img"
                  />
                </motion.div>
              ))}
            </div>

            {/* Skip Hint */}
            <motion.span
              className="sp-skip"
              initial={{ opacity: 0 }}
              animate={
                showFooter ? { opacity: 1 } : { opacity: 0 }
              }
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              Tap anywhere to continue
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;