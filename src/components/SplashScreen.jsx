// src/pages/SplashScreen.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./SplashScreen.css";

// ============ CONFIGURATION ============
const CONFIG = {
  title: "ChiamoOrder",
  tagline: "Shop smarter, Order faster.",
  splashDuration: 5000,
  letterDelay: 0.06,
};

// ============ IMAGE URLS ============
const IMAGES = {
  mainLogo: "https://ik.imagekit.io/ljwnlcbqyu/CHIAMO-ORDER-LOGO2.png",
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
        className={`title-letter ${className}`}
        variants={{
          hidden: { opacity: 0, y: 30, scale: 0.85, rotateX: -40 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 20,
            },
          },
        }}
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ));

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
      {renderLetters(part1, "title-primary")}
      {renderLetters(part2, "title-accent")}
    </motion.div>
  );
};

// ============ ✅ BOUNCING DOTS LOADER ============
const LoadingDots = () => (
  <div className="loading-dots">
    {[0, 1, 2, 3].map((i) => (
      <motion.span
        key={i}
        className={`dot dot-${i}`}
        animate={{
          y: [0, -14, 0],
          scale: [1, 1.25, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 0.7,
          repeat: Infinity,
          delay: i * 0.12,
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
          className="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onClick={handleSkip}
        >
          {/* Background decoration */}
          <div className="splash-bg-accent splash-bg-accent-1" />
          <div className="splash-bg-accent splash-bg-accent-2" />
          <div className="splash-bg-ring splash-bg-ring-1" />
          <div className="splash-bg-ring splash-bg-ring-2" />

          {/* Main Content */}
          <div className="splash-main">
            {/* Logo with animated ring */}
            <motion.div
              className="logo-wrapper"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={
                showContent
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0.5, opacity: 0 }
              }
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="logo-glow" />
              {/* Spinning ring around logo */}
              <motion.div
                className="logo-ring"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <img
                src={IMAGES.mainLogo}
                alt="Chiamo Order"
                className="splash-logo"
              />
            </motion.div>

            {/* Title */}
            {showContent && <AnimatedTitle text={CONFIG.title} />}

            {/* Divider */}
            <motion.div
              className="splash-divider"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={
                showTagline
                  ? { scaleX: 1, opacity: 1 }
                  : { scaleX: 0, opacity: 0 }
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
            />

            {/* Tagline */}
            <motion.p
              className="splash-tagline"
              initial={{ opacity: 0, y: 12 }}
              animate={
                showTagline
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 12 }
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {CONFIG.tagline}
            </motion.p>

            {/* ✅ Bouncing Dots Loader */}
            <motion.div
              className="loading-wrapper"
              initial={{ opacity: 0 }}
              animate={showTagline ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <LoadingDots />
            </motion.div>
          </div>

          {/* Footer */}
          <motion.footer
            className="splash-footer"
            initial={{ opacity: 0, y: 20 }}
            animate={
              showFooter
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* ✅ Deep blue "Powered by" text */}
            <p className="powered-by">Powered by</p>

            {/* ✅ Full color partner logos */}
            <div className="partner-logos">
              {partnerLogos.map((logo, index) => (
                <motion.img
                  key={index}
                  src={logo.src}
                  alt={logo.alt}
                  className="partner-logo"
                  initial={{ opacity: 0, y: 10 }}
                  animate={
                    showFooter
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 10 }
                  }
                  transition={{
                    duration: 0.4,
                    delay: index * 0.12,
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
            Tap anywhere to continue
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;