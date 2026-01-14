import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-transform transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] shadow-md hover:bg-[hsl(var(--color-primary-hover))]",
        dark: "bg-gray-900 text-white shadow-lg hover:bg-gray-800",
        light: "bg-white text-gray-900 shadow-md hover:bg-gray-100",
        destructive:
          "bg-[hsl(var(--color-destructive))] text-[hsl(var(--color-destructive-foreground))] hover:bg-red-700 shadow-md",
        outline:
          "border border-[hsl(var(--color-border))] bg-transparent text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-muted-bg))]",
        glass:
          "bg-white/30 backdrop-blur-md border border-white/20 text-white shadow-md hover:bg-white/40",
        gradient:
          "bg-gradient-to-r from-[hsl(195,85%,45%)] to-[hsl(160,60%,50%)] text-white shadow-md",
        neon: "bg-black text-green-400 border border-green-500 shadow-[0_0_10px_#22c55e,0_0_20px_#22c55e]",
        cyberpunk: "bg-pink-600 text-yellow-300 uppercase tracking-widest shadow-lg",
        pill: "rounded-full bg-[hsl(var(--color-primary))] text-white px-6 py-2 shadow-md",
        ghost:
          "bg-transparent border border-brand text-black  hover:bg-primary/10",
        neumorphic:
          "bg-secondary-foreground text-gray-800 rounded-xl shadow-[6px_6px_12px_#c5c5c5,-6px_-6px_12px_#ffffff]",
        brand_gradient:
          "bg-[linear-gradient(90deg,#5b2eae,#2764f2,#2cc48b,#f5d820,#f76e11)] text-white shadow-[0_0_10px_#22c55e,0_0_20px_#22c55e]",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-9 px-3",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const variantAnimations = {
  default: { whileHover: { scale: 1.1 }, whileTap: { scale: 0.95 } },
  dark: { whileHover: { scale: 1.12 }, whileTap: { scale: 0.95 } },
  light: { whileHover: { scale: 1.08, y: -2 }, whileTap: { scale: 0.96, y: 1 } },
  destructive: { whileHover: { scale: 1.15, rotate: -2 }, whileTap: { scale: 0.9, rotate: 1 } },
  outline: { whileHover: { scale: 1.08 }, whileTap: { scale: 0.96 } },
  glass: { whileHover: { scale: 1.15 }, whileTap: { scale: 0.94 } },
  gradient: { whileHover: { scale: 1.18 }, whileTap: { scale: 0.95 } },
  neon: { whileHover: { scale: 1.15 }, whileTap: { scale: 0.95 } },
  cyberpunk: { whileHover: { scale: 1.1 }, whileTap: { scale: 0.95 } },
  pill: { whileHover: { scale: 1.1 }, whileTap: { scale: 0.95 } },
  ghost: { whileHover: { scale: 1.08 }, whileTap: { scale: 0.95 } },
  neumorphic: { whileHover: { scale: 1.18 }, whileTap: { scale: 0.95 } },
};

const Button = React.forwardRef(
  ({ className, variant = "default", size, asChild = false, icon, children, ...props }, ref) => {
    const motionProps = variantAnimations[variant] || variantAnimations.default;

    // If it's a motion element
    if (!asChild) {
      return (
        <motion.button
          {...motionProps}
          transition={{ type: "spring", stiffness: 300 }}
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          <span className="flex items-center justify-center gap-2">
            {children}
            {icon && <span>{icon}</span>}
          </span>
        </motion.button>
      );
    }

    // If it’s a regular DOM via Slot (no motion props)
    return (
      <Slot
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          {children}
          {icon && <span>{icon}</span>}
        </span>
      </Slot>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
