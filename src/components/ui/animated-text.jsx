'use client'
import {motion} from "framer-motion";

const AnimatedText = ({
  children,
  className = "",
  delay = 0,
  variant = "fadeUp"
}) => {
  const fadeUpAnimation = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay }
  };

  const revealAnimation = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.7, delay, type: "spring" }
  };

  const animation = variant === "reveal" ? revealAnimation : fadeUpAnimation;

  return (
    <motion.div
      className={className}
      initial={animation.initial}
      whileInView={animation.animate}
      transition={animation.transition}
      viewport={{ once: true, margin: "-100px" }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedText;
