import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };

export default function Carousel({
  items = [],
  baseWidth = 300,       // can be number (px) or string ('100%')
  height = 256,          // height of carousel container
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
  gap = 16               // spacing between items
}) {
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Calculate item width based on baseWidth
  const itemWidth = typeof baseWidth === 'number' ? baseWidth : containerRef.current?.offsetWidth || 300;
  const trackItemOffset = itemWidth + gap;

  // Prepare items for looping
  const carouselItems = loop ? [...items, items[0]] : items;

  // Pause autoplay on hover
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

  // Autoplay
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

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      setCurrentIndex(prev => Math.min(prev + 1, carouselItems.length - 1));
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const dragProps = loop
    ? {}
    : { dragConstraints: { left: -trackItemOffset * (carouselItems.length - 1), right: 0 } };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${round ? 'rounded-full border border-white p-4' : ''}`}
      style={{
        width: typeof baseWidth === 'number' ? `${baseWidth}px` : baseWidth,
        height: `${height}px`,
      }}
    >
      <motion.div
        className="flex"
        drag="x"
        {...dragProps}
        style={{
          gap: `${gap}px`,
          x
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
          const outputRange = [90, 0, -90];
          const rotateY = useTransform(x, range, outputRange, { clamp: false });

          return (
            <motion.div
              key={index}
              className={`relative shrink-0 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing ${round ? 'rounded-full' : 'rounded-[12px]'}`}
              style={{
                width: `${itemWidth}px`,
                height: '100%',
                rotateY,
                borderRadius: round ? '50%' : '12px',
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
          );
        })}
      </motion.div>
    </div>
  );
}
