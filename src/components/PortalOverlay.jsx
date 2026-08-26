import { motion } from "framer-motion";

export default function PortalOverlay({ className, clipPath, opacity, children }) {
  return (
    <motion.div className={`portal-overlay-container ${className}`} style={{ clipPath, opacity }}>
      {children}
    </motion.div>
  );
}
