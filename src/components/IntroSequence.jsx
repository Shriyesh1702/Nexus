import { motion } from "framer-motion";

const directions = [
  { x: 0, y: -120 },
  { x: 0, y: 120 },
  { x: -120, y: 0 },
  { x: 120, y: 0 },
];

const textContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function getLetterVariant(index) {
  const direction = directions[index % directions.length];
  return {
    hidden: { x: direction.x, y: direction.y, opacity: 0, scale: 0.8 },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
    },
  };
}

export default function IntroSequence({ phase, loadProgress, onRevealComplete }) {
  if (!["entrance", "grid", "loading"].includes(phase)) return null;

  return (
    <div className="intro-screen">
      <motion.div
        id="intro-text-wrapper"
        variants={textContainerVariants}
        initial="hidden"
        animate="visible"
        onAnimationComplete={onRevealComplete}
        className="intro-text-wrapper"
      >
        {Array.from("NEXUS").map((letter, index) => (
          <div key={`${letter}-${index}`} className="letter-mask-container">
            <motion.h1 variants={getLetterVariant(index)} className="hero-nexus-title">
              {letter}
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
            <motion.div className="bottom-loader-fill" style={{ scaleX: loadProgress / 100 }} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
