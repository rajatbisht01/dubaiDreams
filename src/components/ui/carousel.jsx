import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };

export default function Carousel({
  items = [],
  baseWidth = 300,
  height = 260,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
  gap = 16
}) {
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const itemWidth = typeof baseWidth === 'number' ? baseWidth : containerRef.current?.offsetWidth || 300;
  const trackItemOffset = itemWidth + gap;

  // Prepare items with unique keys for looping
  const carouselItems = loop 
    ? [...items.map((item, idx) => ({ ...item, _key: `item-${idx}` })), { ...items[0], _key: 'item-loop-0' }]
    : items.map((item, idx) => ({ ...item, _key: `item-${idx}` }));

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);

      const container = containerRef.current;
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev === items.length - 1 && loop) return prev + 1;
          if (prev === carouselItems.length - 1) return loop ? 0 : prev;
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [autoplay, autoplayDelay, isHovered, loop, items.length, carouselItems.length, pauseOnHover]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const getRotateY = (index) => {
    const currentX = -(currentIndex * trackItemOffset);
    const itemPosition = -(index * trackItemOffset);
    const distance = currentX - itemPosition;
    
    const maxRotation = 90;
    const rotationRange = trackItemOffset;
    
    if (distance > rotationRange) return maxRotation;
    if (distance < -rotationRange) return -maxRotation;
    
    return (distance / rotationRange) * maxRotation;
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${round ? ' border border-white p-4s' : ''}`}
      style={{
        width: typeof baseWidth === 'number' ? `${baseWidth}px` : baseWidth,
        height: `${height}px`,
      }}
    >
      <motion.div
        className="flex"
        style={{
          gap: `${gap}px`,
          x
        }}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => (
          <motion.div
            key={item._key}
            className={`relative shrink-0 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing ${round ? 'rounded-none' : 'rounded-none'}`}
            style={{
              width: `100%`,
              height: '100%',
              rotateY: getRotateY(index),
              borderRadius: round ? '50%' : '0px',
            }}
            transition={effectiveTransition}
          >
            {item.url ? (
              <img
                src={item.url}
                alt={item.alt || ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-5 text-white">
                <div className="font-bold">{item.title}</div>
                <p>{item.description}</p>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}