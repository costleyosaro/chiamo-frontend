// src/pages/SplashScreen.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./SplashScreen.css";

import logo from "../assets/CHIAMO-ORDER-LOGO2.png";
import chiamoLogo from "../assets/CHIAMO_MULTITRADE_LOGO.png";
import ghadcoLogo from "../assets/GHADCO_LOGO.png";
import mamudaLogo from "../assets/mamuda-logo.png";

// ============ CONFIGURATION ============
const CONFIG = {
  title: "Chiamo Order",
  tagline: "Shop smarter, Order faster.",
  splashDuration: 5000, // 5 seconds
  letterDelay: 0.08,
};

// ============ ANIMATED TITLE ============
const AnimatedTitle = ({ text }) => {
  const letters = text.split("");

  return (
    <motion.div
      className="title-container"
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
      {letters.map((char, i) => (
        <motion.span
          key={i}
          className="title-letter"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 20,
              },
            },
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

// ============ LOADING DOTS ============
const LoadingDots = () => (
  <div className="loading-dots">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="dot"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// ============ MAIN SPLASH SCREEN ============
const SplashScreen = ({ onFinish }) => {
  const [show, setShow] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  const partnerLogos = useMemo(
    () => [
      { src: chiamoLogo, alt: "Chiamo Multitrade" },
      { src: ghadcoLogo, alt: "Ghadco Nigeria" },
      { src: mamudaLogo, alt: "Mamuda Group" },
    ],
    []
  );

  useEffect(() => {
    const timers = [];

    // Show main content
    timers.push(setTimeout(() => setShowContent(true), 200));

    // Show tagline
    timers.push(setTimeout(() => setShowTagline(true), 1200));

    // Show footer
    timers.push(setTimeout(() => setShowFooter(true), 1800));

    // Finish splash
    timers.push(
      setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          if (typeof onFinish === "function") onFinish();
        }, 400);
      }, CONFIG.splashDuration)
    );

    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  // Skip on tap (after content is visible)
  const handleSkip = useCallback(() => {
    if (showTagline) {
      setShow(false);
      setTimeout(() => {
        if (typeof onFinish === "function") onFinish();
      }, 400);
    }
  }, [onFinish, showTagline]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={handleSkip}
        >
          {/* Main Content */}
          <div className="splash-main">
            {/* Logo */}
            <motion.div
              className="logo-wrapper"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={
                showContent
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0.8, opacity: 0 }
              }
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <img src={logo} alt="Chiamo Order" className="splash-logo" />
            </motion.div>

            {/* Title */}
            {showContent && <AnimatedTitle text={CONFIG.title} />}

            {/* Tagline */}
            <motion.p
              className="splash-tagline"
              initial={{ opacity: 0, y: 10 }}
              animate={
                showTagline ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {CONFIG.tagline}
            </motion.p>

            {/* Loading Indicator */}
            <motion.div
              className="loading-wrapper"
              initial={{ opacity: 0 }}
              animate={showTagline ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <LoadingDots />
            </motion.div>
          </div>

          {/* Footer */}
          <motion.footer
            className="splash-footer"
            initial={{ opacity: 0, y: 20 }}
            animate={
              showFooter ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="powered-by">Powered by</p>
            <div className="partner-logos">
              {partnerLogos.map((logo, index) => (
                <motion.img
                  key={index}
                  src={logo.src}
                  alt={logo.alt}
                  className="partner-logo"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={
                    showFooter
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.8 }
                  }
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          </motion.footer>

          {/* Skip Hint */}
          <motion.span
            className="skip-hint"
            initial={{ opacity: 0 }}
            animate={showFooter ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            Tap to continue
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;