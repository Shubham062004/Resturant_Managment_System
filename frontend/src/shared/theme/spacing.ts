export const spacing = {
  4: '0.25rem',   // 4px
  8: '0.5rem',    // 8px
  12: '0.75rem',  // 12px
  16: '1rem',     // 16px
  20: '1.25rem',  // 20px
  24: '1.5rem',   // 24px
  32: '2rem',     // 32px
  40: '2.5rem',   // 40px
  48: '3rem',     // 48px
  64: '4rem',     // 64px
  80: '5rem',     // 80px
  96: '6rem',     // 96px
} as const;

export type ThemeSpacing = typeof spacing;
