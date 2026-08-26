import { motion } from "framer-motion";

export default function Gridlines({ phase, onGridComplete }) {
  return (
    <div className="gridlines-container">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <motion.div
          key={index}
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
            duration: 0.75,
            delay: phase === "entrance" || phase === "grid" ? index * 0.08 : 0,
            ease: [0.16, 1, 0.3, 1],
          }}
          onAnimationComplete={() => {
            if (index === 5 && phase === "grid") onGridComplete();
          }}
          className="gridline"
        />
      ))}
    </div>
  );
}
