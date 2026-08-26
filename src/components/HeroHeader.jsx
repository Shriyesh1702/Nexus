import { motion } from "framer-motion";

export default function HeroHeader({ title, onAnimationComplete }) {
  return (
    <header className="hero-header-wrapper">
      <div className="title-trail-container">
        {Array.from({ length: 8 }).map((_, index) => {
          const layer = 8 - index;
          return (
            <motion.div
              key={layer}
              initial={{ y: "45vh", scale: 0.9, opacity: 0.8 - layer * 0.08 }}
              animate={{ y: 0, scale: 1.85, opacity: 0 }}
              transition={{ duration: 1.05, delay: layer * 0.025, ease: [0.16, 1, 0.3, 1] }}
              className={`centered-header-title-wrapper afterimage trail-layer-${layer}`}
            >
              <h1 className="hero-nexus-title">{title}</h1>
            </motion.div>
          );
        })}
        <motion.div
          initial={{ y: "45vh", scale: 0.9 }}
          animate={{ y: 0, scale: 1.25 }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={onAnimationComplete}
          className="centered-header-title-wrapper main-title"
        >
          <h1 className="hero-nexus-title">{title}</h1>
        </motion.div>
      </div>
    </header>
  );
}
