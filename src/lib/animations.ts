// Configurações de animação para o sistema
export const animations = {
  // Transições suaves
  smooth: {
    duration: 0.2,
  },

  // Animações mais rápidas
  quick: {
    duration: 0.15,
  },

  // Animações mais lentas para elementos importantes
  slow: {
    duration: 0.3,
  },

  // Spring para elementos interativos
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },

  // Bounce sutil para feedback
  bounce: {
    type: "spring" as const,
    stiffness: 400,
    damping: 10,
  },

  // Hover otimizado
  hover: {
    duration: 0.15,
  },
};

// Variantes de animação para componentes
export const variants = {
  // Fade in/out
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Slide in from bottom
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  // Slide in from right
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },

  // Scale in/out
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  // Stagger para listas
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  // Hover effects
  hover: {
    scale: 1.02,
    transition: animations.spring,
  },

  // Tap effects
  tap: {
    scale: 0.98,
  },
};
