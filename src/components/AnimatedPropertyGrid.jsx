import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import PropertyCard from "./property/PropertyCard";

const AnimatedGridItem = ({ children, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedPropertyGrid = ({ properties, viewMode = "grid" }) => {
  console.log("AnimatedPropertyGrid received properties:", properties);
  return (
    <div
      className={`grid gap-6 ${
        viewMode === "grid"
          ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          : "grid-cols-1"
      }`}
    >
      {properties.map((property, index) => (
        <AnimatedGridItem key={property.id} index={index}>
          <PropertyCard property={property} />
        </AnimatedGridItem>
      ))}
    </div>
  );
};

export default AnimatedPropertyGrid;
