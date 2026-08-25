import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Hyperspeed from "./Hyperspeed";
import "./DenmuHeroAnimation.css";

// Customized Hyperspeed settings to match the Purple/Cyan Arena Theme
const hyperspeedOptions = {
  distortion: "turbulentDistortion",
  length: 400,
  roadWidth: 12,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 140,
  speedUp: 3,
  carLightsFade: 0.4,
  totalSideLightSticks: 30,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x05020a,
    islandColor: 0x0a0312,
    background: 0x000000,
    shoulderLines: 0xff007f, // Neon Pink
    brokenLines: 0xbf00ff, // Electric Purple
    leftCars: [0xff007f, 0xff1493, 0xff69b4], // Pink / Hot Pink Spectrum
    rightCars: [0xbf00ff, 0x8a2be2, 0xda70d6], // Purple / Violet Spectrum
    sticks: 0xff007f, // Pink Side Light Sticks
  },
};

export default function DenmuHeroAnimation() {
  const [isFontLoaded, setIsFontLoaded] = useState(false);
  const [phase, setPhase] = useState("entrance"); // entrance -> grid -> loading -> headerMove -> pageReady
  const [loadProgress, setLoadProgress] = useState(0);

  const introText = "NEXUS";
  const letters = Array.from(introText);

  const directions = [
    { x: 0, y: -100 },
    { x: 0, y: 100 },
    { x: -100, y: 0 },
    { x: 100, y: 0 },
  ];

  // Font Readiness Check
  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => setIsFontLoaded(true));
    } else {
      setIsFontLoaded(true);
    }
  }, []);

  const textContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const getLetterVariant = (index) => {
    const dir = directions[index % directions.length];
    return {
      hidden: { x: dir.x, y: dir.y, opacity: 0 },
      visible: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      },
    };
  };

  // Intro text flicker handler
  const handleLetterRevealComplete = async () => {
    const textElement = document.getElementById("intro-text-wrapper");
    if (!textElement) return;

    await textElement.animate(
      [
        { opacity: 1 },
        { opacity: 0 },
        { opacity: 1 },
        { opacity: 0 },
        { opacity: 1 },
      ],
      { duration: 500, iterations: 1, easing: "ease-in-out" },
    ).finished;

    setPhase("grid");
  };

  // Progress loader ticker
  useEffect(() => {
    if (phase === "loading") {
      const interval = setInterval(() => {
        setLoadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase("headerMove"), 300);
            return 100;
          }
          return prev + 4;
        });
      }, 25);

      return () => clearInterval(interval);
    }
  }, [phase]);

  if (!isFontLoaded) {
    return (
      <div className="font-preloader">
        <div className="font-preloader-spinner" />
        <span className="font-preloader-text">LOADING ASSETS...</span>
      </div>
    );
  }

  return (
    <div className="denmu-hero-container">
      {/* FULL-SCREEN HYPERSPEED BACKGROUND */}
      {phase === "pageReady" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="fullscreen-hyperspeed-bg"
        >
          <Hyperspeed effectOptions={hyperspeedOptions} />
        </motion.div>
      )}

      {/* 1. VERTICAL WHITE GRID LINES */}
      <div className="gridlines-container">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0, opacity: 1 }}
            animate={{
              scaleY:
                phase === "entrance"
                  ? 0
                  : phase === "grid" || phase === "loading"
                    ? 1
                    : 0,
              opacity: phase === "headerMove" || phase === "pageReady" ? 0 : 1,
            }}
            transition={{
              duration: 0.6,
              delay: phase === "entrance" || phase === "grid" ? i * 0.1 : 0,
              ease: [0.16, 1, 0.3, 1],
            }}
            onAnimationComplete={() => {
              if (i === 3 && phase === "grid") setPhase("loading");
            }}
            className="gridline"
          />
        ))}
      </div>

      {/* 2. INITIAL LOADING SCREEN PHASE */}
      {(phase === "entrance" || phase === "grid" || phase === "loading") && (
        <div className="intro-screen">
          <motion.div
            id="intro-text-wrapper"
            variants={textContainerVariants}
            initial="hidden"
            animate="visible"
            onAnimationComplete={handleLetterRevealComplete}
            className="intro-text-wrapper"
          >
            {letters.map((char, index) => (
              <div key={index} className="letter-mask-container">
                <motion.h1
                  variants={getLetterVariant(index)}
                  className="hero-nexus-title"
                >
                  {char}
                </motion.h1>
              </div>
            ))}
          </motion.div>

          {/* Bottom Progress Loader */}
          {phase === "loading" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bottom-loader-container"
            >
              <div className="bottom-loader-info">
                <span>INITIALIZING GAMING ARENA</span>
                <span>{loadProgress}%</span>
              </div>
              <div className="bottom-loader-track">
                <motion.div
                  className="bottom-loader-fill"
                  style={{ scaleX: loadProgress / 100 }}
                />
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* 3. MAIN PAGE LAYOUT PHASE */}
      {(phase === "headerMove" || phase === "pageReady") && (
        <div className="hero-content">
          {/* Header Block with Motion Trails */}
          <header className="hero-header-wrapper">
            <div className="title-trail-container">
              {Array.from({ length: 5 }).map((_, index) => {
                const layerNum = 5 - index;
                const delay = layerNum * 0.035;
                const startOpacity = 0.7 - layerNum * 0.1;

                return (
                  <motion.div
                    key={layerNum}
                    initial={{ y: "40vh", scale: 1, opacity: startOpacity }}
                    animate={{ y: 0, scale: 1.25, opacity: 0 }}
                    transition={{
                      duration: 0.9,
                      delay: delay,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`centered-header-title-wrapper afterimage trail-layer-${layerNum}`}
                  >
                    <h1 className="hero-nexus-title">{introText}</h1>
                  </motion.div>
                );
              })}

              {/* Main Title Layer */}
              <motion.div
                initial={{ y: "40vh", scale: 1 }}
                animate={{ y: 0, scale: 1.25 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                onAnimationComplete={() => setPhase("pageReady")}
                className="centered-header-title-wrapper main-title"
              >
                <h1 className="hero-nexus-title">{introText}</h1>
              </motion.div>
            </div>
          </header>

          {/* Center Content Section */}
          {phase === "pageReady" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="page-center-body"
            >
              <h2 className="main-page-title">
                WELCOME TO <span className="purple-accent">ARENA</span>
              </h2>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
