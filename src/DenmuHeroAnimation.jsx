import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./DenmuHeroAnimation.css";

export default function DenmuHeroAnimation() {
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

  const textContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const getLetterVariant = (index) => {
    const dir = directions[index % directions.length];
    return {
      hidden: { x: dir.x, y: dir.y, opacity: 0 },
      visible: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.7,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    };
  };

  // 1. Blink effect complete -> trigger vertical lines reveal
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
      {
        duration: 500,
        iterations: 1,
        easing: "ease-in-out",
      },
    ).finished;

    setPhase("grid");
  };

  // 2. Control Loading Bar
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

  return (
    <div className="denmu-hero-container">
      {/* 1. VERTICAL WHITE GRID LINES (Sweeps in after NEXUS appears) */}
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

          {/* Loading Bar at Bottom */}
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

      {/* 3. HEADER SHIFT & SECOND PAGE PHASE */}
      {(phase === "headerMove" || phase === "pageReady") && (
        <div className="hero-content">
          {/* Header Container */}
          <header className="hero-header-wrapper">
            <motion.div
              initial={{ y: "40vh" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              onAnimationComplete={() => setPhase("pageReady")}
              className="centered-header-title-wrapper"
            >
              <h1 className="hero-nexus-title">{introText}</h1>
            </motion.div>

            {/* Subnavbar */}
            <AnimatePresence>
              {phase === "pageReady" && (
                <motion.nav
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="subnavbar-container"
                ></motion.nav>
              )}
            </AnimatePresence>
          </header>

          {/* Page Body */}
          {phase === "pageReady" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="page-center-body"
            >
              <h2 className="main-page-title">
                WELCOME TO THE <span className="purple-accent">ARENA</span>
              </h2>
              <p className="main-page-sub">
                Compete in high-stakes tournaments, climb rankings, and connect
                with elite gamers.
              </p>
            </motion.div>
          )}

          {/* Footer CTA */}
          {phase === "pageReady" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hero-footer"
            >
              <button className="hero-button">Enter Tournament ↓</button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
