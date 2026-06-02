import { Variants } from 'framer-motion';

export const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

export const hoverScalePreset = {
  whileHover: { scale: 1.02, y: -2 },
  whileTap: { scale: 0.98 },
  transition: springTransition,
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: 16, transition: { duration: 0.15 } },
};

export const fadeDown: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, y: -16, transition: { duration: 0.15 } },
};

export const slideLeft: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: springTransition },
  exit: { opacity: 0, x: 24, transition: { duration: 0.15 } },
};

export const slideRight: Variants = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0, transition: springTransition },
  exit: { opacity: 0, x: -24, transition: { duration: 0.15 } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15 } },
};

export const drawerVariants = {
  left: {
    initial: { x: '-100%' },
    animate: { x: 0, transition: springTransition },
    exit: { x: '-100%', transition: { duration: 0.2 } },
  },
  right: {
    initial: { x: '100%' },
    animate: { x: 0, transition: springTransition },
    exit: { x: '100%', transition: { duration: 0.2 } },
  },
  bottom: {
    initial: { y: '100%' },
    animate: { y: 0, transition: springTransition },
    exit: { y: '100%', transition: { duration: 0.2 } },
  },
};
