export const breakpoints = {
  mobile: '320px', // Mini screens
  tablet: '768px', // MD (iPad and similar tablets)
  laptop: '1024px', // LG (standard laptops)
  desktop: '1280px', // XL (desktops)
  wide: '1536px', // 2XL (ultra-wide monitors)
} as const;

export type ThemeBreakpoints = typeof breakpoints;
