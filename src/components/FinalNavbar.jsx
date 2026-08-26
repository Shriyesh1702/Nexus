import { motion } from "framer-motion";

const leftLinks = ["Events", "Domains", "About Us"];
const rightLinks = ["Hall of Fame", "Esports", "Sponsors"];

function NavigationLinks({ links, side, style }) {
  return (
    <motion.nav className={`topbar-links topbar-links-${side}`} style={style}>
      {links.map((link) => (
        <a key={link} href={`#${link.toLowerCase().replaceAll(" ", "-")}`}>
          {link}
        </a>
      ))}
    </motion.nav>
  );
}

export default function FinalNavbar({ title, motionValues }) {
  const { headerPaddingTop, headerMarginTop, navLeftX, navRightX, navLeftClip, navRightClip, navReveal, navPointer, nexusScale, nexusFontSize } = motionValues;

  const sharedNavStyle = { opacity: navReveal, pointerEvents: navPointer };
  return (
    <motion.header className="hero-header-wrapper final-topbar" style={{ paddingTop: headerPaddingTop, marginTop: headerMarginTop }}>
      <NavigationLinks links={leftLinks} side="left" style={{ ...sharedNavStyle, x: navLeftX, clipPath: navLeftClip }} />
      <motion.div className="centered-header-title-wrapper main-title final-nexus-mark" style={{ scale: nexusScale }}>
        <motion.h1 className="hero-nexus-title" style={{ fontSize: nexusFontSize }}>
          {title}
        </motion.h1>
      </motion.div>
      <NavigationLinks links={rightLinks} side="right" style={{ ...sharedNavStyle, x: navRightX, clipPath: navRightClip }} />
    </motion.header>
  );
}
