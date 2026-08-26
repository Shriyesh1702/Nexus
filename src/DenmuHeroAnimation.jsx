import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import Hyperspeed from "./Hyperspeed";
import Gridlines from "./components/Gridlines";
import IntroSequence from "./components/IntroSequence";
import HeroHeader from "./components/HeroHeader";
import FinalNavbar from "./components/FinalNavbar";
import PortalOverlay from "./components/PortalOverlay";
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

  // Raw Virtual Scroll MotionValue
  const rawScrollProgress = useMotionValue(0);

  // Springs for smooth transitions
  const scrollProgress1 = useSpring(rawScrollProgress, {
    stiffness: 80,
    damping: 18,
    restDelta: 0.0001,
  });
  const scrollProgress2 = useSpring(rawScrollProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.0001,
  });
  const scrollProgress3 = useSpring(rawScrollProgress, {
    stiffness: 70,
    damping: 19,
    restDelta: 0.0001,
  });

  // PORTAL TRANSFORMS
  const portal1Radius = useTransform(
    scrollProgress1,
    [0, 0.32, 0.42],
    ["0%", "120%", "200%"],
  );
  const portal1Opacity = useTransform(scrollProgress1, [0, 0.03], [0, 1]);
  const clipPathStyle1 = useTransform(
    portal1Radius,
    (r) => `circle(${r} at ${portalCoords.x}% ${portalCoords.y}%)`,
  );

  const portal2Radius = useTransform(
    scrollProgress2,
    [0.16, 0.52, 0.62],
    ["0%", "120%", "200%"],
  );
  const portal2Opacity = useTransform(scrollProgress2, [0.16, 0.22], [0, 1]);
  const clipPathStyle2 = useTransform(
    portal2Radius,
    (r) => `circle(${r} at ${portalCoords.x}% ${portalCoords.y}%)`,
  );

  // HEADER COLLAPSE & DISCLOSURE TRANSFORMS (Scroll: 0.70 -> 1.0)
  const headerCompact = useTransform(scrollProgress3, [0.7, 0.92], [0, 1]);
  const navReveal = useTransform(scrollProgress3, [0.82, 1], [0, 1]);

  const headerPaddingTop = useTransform(
    headerCompact,
    [0, 1],
    ["9rem", "0.35rem"],
  );
  const headerMarginTop = useTransform(
    headerCompact,
    [0, 1],
    ["3.5rem", "0rem"],
  );
  // Keep every portal title at the same base size before the final navbar compacts.
  const nexusScale = useTransform(headerCompact, [0, 1], [1, 1]);
  const nexusFontSize = useTransform(headerCompact, (t) => {
    const rem =
      typeof window === "undefined"
        ? 16
        : parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const start = Math.min(
      12 * rem,
      Math.max(4.5 * rem, 0.16 * window.innerWidth),
    );
    const end = 3 * rem;
    return `${start + (end - start) * t}px`;
  });

  // --- NEW "EMERGE FROM HEADER" ANIMATION VARS ---
  // Slidout displacement: start tucked into the center logo, move out to 0px
  const navLeftX = useTransform(navReveal, [0, 1], ["60%", "0%"]);
  const navRightX = useTransform(navReveal, [0, 1], ["-60%", "0%"]);

  // Mask clipPaths: Expand out from center title edges
  const navLeftClip = useTransform(
    navReveal,
    (v) => `inset(0% 0% 0% ${100 - v * 100}%)`,
  );
  const navRightClip = useTransform(
    navReveal,
    (v) => `inset(0% ${100 - v * 100}% 0% 0%)`,
  );

  const navPointer = useTransform(navReveal, (v) =>
    v > 0.55 ? "auto" : "none",
  );

  // Lenis & Event Handlers setup
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
      progressVal += e.deltaY / 900;
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
      const touchSensitivity = window.innerWidth <= 768 ? 220 : 600;
      progressVal += deltaY / touchSensitivity;
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

  const updatePortalOrigin = () => {
    if (portalOriginRef.current) {
      const rect = portalOriginRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      setPortalCoords({
        x: Number(((centerX / window.innerWidth) * 100).toFixed(3)),
        y: Number(((centerY / window.innerHeight) * 100).toFixed(3)),
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

        <Gridlines phase={phase} onGridComplete={() => setPhase("loading")} />
        <IntroSequence phase={phase} loadProgress={loadProgress} onRevealComplete={handleLetterRevealComplete} />

        {(phase === "headerMove" || phase === "pageReady") && (
          <div className="hero-content">
            <HeroHeader title={introText} onAnimationComplete={() => setPhase("pageReady")} />

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

      {phase === "pageReady" && (
        <PortalOverlay className="portal-layer-1" clipPath={clipPathStyle1} opacity={portal1Opacity}>
          <div className="inverted-theme-wrapper mode-light">
            <div className="next-page-layout">
              <header className="hero-header-wrapper">
                <div className="title-trail-container">
                  <div className="centered-header-title-wrapper main-title portal-nexus-locked">
                    <h1 className="hero-nexus-title">{introText}</h1>
                  </div>
                </div>
              </header>
            </div>
          </div>
        </PortalOverlay>
      )}

      {phase === "pageReady" && (
        <PortalOverlay className="portal-layer-2" clipPath={clipPathStyle2} opacity={portal2Opacity}>
          <div className="inverted-theme-wrapper mode-dark">
            <div className="next-page-layout">
              <FinalNavbar
                title={introText}
                motionValues={{ headerPaddingTop, headerMarginTop, navLeftX, navRightX, navLeftClip, navRightClip, navReveal, navPointer, nexusScale, nexusFontSize }}
              />
            </div>
          </div>
        </PortalOverlay>
      )}
    </div>
  );
}
