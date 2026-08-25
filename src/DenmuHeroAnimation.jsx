import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import Hyperspeed from "./Hyperspeed";
import "./DenmuHeroAnimation.css";

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
    shoulderLines: 0xff007f,
    brokenLines: 0xbf00ff,
    leftCars: [0xff007f, 0xff1493, 0xff69b4],
    rightCars: [0xbf00ff, 0x8a2be2, 0xda70d6],
    sticks: 0xff007f,
  },
};

export default function DenmuHeroAnimation() {
  const [isFontLoaded, setIsFontLoaded] = useState(false);
  const [phase, setPhase] = useState("entrance"); // entrance -> grid -> loading -> headerMove -> pageReady
  const [loadProgress, setLoadProgress] = useState(0);
  const [portalCoords, setPortalCoords] = useState({ x: 50, y: 50 });

  const portalOriginRef = useRef(null);
  const lenisRef = useRef(null);

  const introText = "NEXUS";
  const letters = Array.from(introText);

  const directions = [
    { x: 0, y: -120 },
    { x: 0, y: 120 },
    { x: -120, y: 0 },
    { x: 120, y: 0 },
  ];

  // Raw Virtual Scroll MotionValue
  const rawScrollProgress = useMotionValue(0);

  // 1. Primary Portal Spring (First Wave)
  const scrollProgress1 = useSpring(rawScrollProgress, {
    stiffness: 80,
    damping: 18,
    restDelta: 0.0001,
  });

  // 2. Secondary Portal Spring (Second Wave)
  const scrollProgress2 = useSpring(rawScrollProgress, {
    stiffness: 55,
    damping: 20,
    restDelta: 0.0001,
  });

  // 3. Tertiary Portal Spring (Third Wave)
  const scrollProgress3 = useSpring(rawScrollProgress, {
    stiffness: 40,
    damping: 22,
    restDelta: 0.0001,
  });

  // --- PORTAL 1 TRANSFORMS (Light Theme) ---
  const portal1Radius = useTransform(
    scrollProgress1,
    [0, 0.15, 0.5, 0.85, 1],
    ["0%", "20%", "75%", "130%", "180%"],
  );
  const portal1Opacity = useTransform(
    scrollProgress1,
    [0, 0.02, 0.08, 1],
    [0, 0.6, 1, 1],
  );
  const clipPathStyle1 = useTransform(
    portal1Radius,
    (r) => `circle(${r} at ${portalCoords.x}% ${portalCoords.y}%)`,
  );

  // --- PORTAL 2 TRANSFORMS (Dark Theme) ---
  const portal2Radius = useTransform(
    scrollProgress2,
    [0.15, 0.35, 0.7, 0.95, 1],
    ["0%", "15%", "65%", "130%", "180%"],
  );
  const portal2Opacity = useTransform(
    scrollProgress2,
    [0.15, 0.18, 0.25, 1],
    [0, 0.6, 1, 1],
  );
  const clipPathStyle2 = useTransform(
    portal2Radius,
    (r) => `circle(${r} at ${portalCoords.x}% ${portalCoords.y}%)`,
  );

  // --- PORTAL 3 TRANSFORMS (Reversed Light Theme) ---
  const portal3Radius = useTransform(
    scrollProgress3,
    [0.35, 0.55, 0.8, 0.98, 1],
    ["0%", "15%", "65%", "130%", "180%"],
  );
  const portal3Opacity = useTransform(
    scrollProgress3,
    [0.35, 0.38, 0.45, 1],
    [0, 0.6, 1, 1],
  );
  const clipPathStyle3 = useTransform(
    portal3Radius,
    (r) => `circle(${r} at ${portalCoords.x}% ${portalCoords.y}%)`,
  );

  // Lenis Wheel & Touch Event Capture
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (phase !== "pageReady") return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    let progressVal = 0;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY;
      progressVal += delta / 2600; // Adjusted timeline length for 3 distinct waves
      progressVal = Math.max(0, Math.min(1, progressVal));
      rawScrollProgress.set(progressVal);
    };

    let startY = 0;
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = startY - currentY;
      startY = currentY;

      progressVal += deltaY / 1400;
      progressVal = Math.max(0, Math.min(1, progressVal));
      rawScrollProgress.set(progressVal);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [phase, rawScrollProgress]);

  // Universal Center Measurement
  const updatePortalOrigin = () => {
    if (portalOriginRef.current) {
      const rect = portalOriginRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const universalX = (centerX / window.innerWidth) * 100;
      const universalY = (centerY / window.innerHeight) * 100;

      setPortalCoords({
        x: Number(universalX.toFixed(3)),
        y: Number(universalY.toFixed(3)),
      });
    }
  };

  useEffect(() => {
    if (phase === "pageReady") {
      updatePortalOrigin();
      const timeout = setTimeout(updatePortalOrigin, 100);

      window.addEventListener("resize", updatePortalOrigin);
      window.addEventListener("orientationchange", updatePortalOrigin);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener("resize", updatePortalOrigin);
        window.removeEventListener("orientationchange", updatePortalOrigin);
      };
    }
  }, [phase]);

  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => setIsFontLoaded(true));
    } else {
      setIsFontLoaded(true);
    }
  }, []);

  const textContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const getLetterVariant = (index) => {
    const dir = directions[index % directions.length];
    return {
      hidden: { x: dir.x, y: dir.y, opacity: 0, scale: 0.8 },
      visible: {
        x: 0,
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
      },
    };
  };

  const handleLetterRevealComplete = async () => {
    const textElement = document.getElementById("intro-text-wrapper");
    if (!textElement) return;

    await textElement.animate(
      [
        { opacity: 1, filter: "blur(0px)" },
        { opacity: 0.2, filter: "blur(4px)" },
        { opacity: 1, filter: "blur(0px)" },
        { opacity: 0.1, filter: "blur(6px)" },
        { opacity: 1, filter: "blur(0px)" },
      ],
      { duration: 600, iterations: 1, easing: "ease-in-out" },
    ).finished;

    setPhase("grid");
  };

  useEffect(() => {
    if (phase === "loading") {
      const interval = setInterval(() => {
        setLoadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase("headerMove"), 300);
            return 100;
          }
          return prev + 2;
        });
      }, 16);

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
    <div className="denmu-scroll-wrapper">
      <div className="denmu-hero-container">
        {phase === "pageReady" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="fullscreen-hyperspeed-bg"
          >
            <Hyperspeed effectOptions={hyperspeedOptions} />
          </motion.div>
        )}

        <div className="gridlines-container">
          {[0, 1, 2, 3, 4, 5].map((i) => (
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
                opacity:
                  phase === "headerMove" || phase === "pageReady" ? 0 : 1,
              }}
              transition={{
                duration: 0.75,
                delay: phase === "entrance" || phase === "grid" ? i * 0.08 : 0,
                ease: [0.16, 1, 0.3, 1],
              }}
              onAnimationComplete={() => {
                if (i === 5 && phase === "grid") setPhase("loading");
              }}
              className="gridline"
            />
          ))}
        </div>

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

            {phase === "loading" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
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

        {(phase === "headerMove" || phase === "pageReady") && (
          <div className="hero-content">
            <header className="hero-header-wrapper">
              <div className="title-trail-container">
                {Array.from({ length: 8 }).map((_, index) => {
                  const layerNum = 8 - index;
                  const delay = layerNum * 0.025;
                  const startOpacity = 0.8 - layerNum * 0.08;

                  return (
                    <motion.div
                      key={layerNum}
                      initial={{ y: "45vh", scale: 0.9, opacity: startOpacity }}
                      animate={{ y: 0, scale: 1.25, opacity: 0 }}
                      transition={{
                        duration: 1.05,
                        delay: delay,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`centered-header-title-wrapper afterimage trail-layer-${layerNum}`}
                    >
                      <h1 className="hero-nexus-title">{introText}</h1>
                    </motion.div>
                  );
                })}

                <motion.div
                  initial={{ y: "45vh", scale: 0.9 }}
                  animate={{ y: 0, scale: 1.25 }}
                  transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
                  onAnimationComplete={() => setPhase("pageReady")}
                  className="centered-header-title-wrapper main-title"
                >
                  <h1 className="hero-nexus-title">{introText}</h1>
                </motion.div>
              </div>
            </header>

            {phase === "pageReady" && (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.15 }}
                className="page-center-body"
              >
                <h2 className="main-page-title">
                  WELC
                  <span className="portal-anchor" ref={portalOriginRef}>
                    <span className="portal-letter-o">O</span>
                  </span>
                  ME TO <span className="purple-accent">ARENA</span>
                </h2>
                <span className="scroll-hint">
                  SCROLL TO TRIGGER RIPPLE PORTAL
                </span>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* PORTAL 1: Light Mode */}
      {phase === "pageReady" && (
        <motion.div
          className="portal-overlay-container portal-layer-1"
          style={{
            clipPath: clipPathStyle1,
            opacity: portal1Opacity,
          }}
        >
          <div className="inverted-theme-wrapper mode-light">
            <div className="next-page-layout">
              <section className="next-page-hero">
                <h1 className="next-page-title">NEXT PAGE CONTENT</h1>
                <p className="next-page-description">
                  You scrolled through the portal into the inverted theme
                  section.
                </p>
                <button className="inverted-btn">EXPLORE ARENA</button>
              </section>
            </div>
          </div>
        </motion.div>
      )}

      {/* PORTAL 2: Dark Mode */}
      {phase === "pageReady" && (
        <motion.div
          className="portal-overlay-container portal-layer-2"
          style={{
            clipPath: clipPathStyle2,
            opacity: portal2Opacity,
          }}
        >
          <div className="inverted-theme-wrapper mode-dark">
            <div className="next-page-layout">
              <section className="next-page-hero">
                <h1 className="next-page-title">NEXT PAGE CONTENT</h1>
                <p className="next-page-description">
                  You scrolled through the portal into the inverted theme
                  section.
                </p>
                <button className="inverted-btn">EXPLORE ARENA</button>
              </section>
            </div>
          </div>
        </motion.div>
      )}

      {/* PORTAL 3: Reversed Light Mode (Identical Text, Inverted Colors) */}
      {phase === "pageReady" && (
        <motion.div
          className="portal-overlay-container portal-layer-3"
          style={{
            clipPath: clipPathStyle3,
            opacity: portal3Opacity,
          }}
        >
          <div className="inverted-theme-wrapper mode-light">
            <div className="next-page-layout">
              <section className="next-page-hero">
                <h1 className="next-page-title">NEXT PAGE CONTENT</h1>
                <p className="next-page-description">
                  You scrolled through the portal into the inverted theme
                  section.
                </p>
                <button className="inverted-btn">EXPLORE ARENA</button>
              </section>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
