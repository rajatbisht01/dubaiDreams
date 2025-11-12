'use client';
import { motion } from "framer-motion";
import React from "react";

const ScrollReveal = ({ children, className = "", delay = 0, direction = "up" }) => {
  const getInitialTransform = () => {
    switch (direction) {
      case "up":
        return { y: 40 };
      case "down":
        return { y: -40 };
      case "left":
        return { x: -40 };
      case "right":
        return { x: 40 };
      default:
        return { y: 40 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...getInitialTransform(),
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{
        duration: 0.6,
        delay,
        type: "spring",
        stiffness: 100,
      }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
