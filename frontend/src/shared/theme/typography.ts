export const typography = {
  fontFamily: {
    sans: 'Inter, sans-serif',
    display: 'Outfit, sans-serif',
  },
  fontSize: {
    'display-xl': '3rem', // 48px
    'display-lg': '2.25rem', // 36px
    'display-md': '1.875rem', // 30px
    'heading-xl': '1.5rem', // 24px
    'heading-lg': '1.25rem', // 20px
    'heading-md': '1.125rem', // 18px
    'heading-sm': '1rem', // 16px
    'body-lg': '1.125rem', // 18px
    'body-md': '1rem', // 16px
    'body-sm': '0.875rem', // 14px
    caption: '0.75rem', // 12px
    tiny: '0.625rem', // 10px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const;

export type ThemeTypography = typeof typography;

// Reusable Tailwind font classes to ensure strict token styling
export const typographyClasses = {
  displayXL: 'font-display text-5xl font-extrabold tracking-tight leading-none',
  displayLG:
    'font-display text-4xl font-extrabold tracking-tight leading-tight',
  displayMD: 'font-display text-3xl font-bold tracking-tight leading-snug',
  headingXL: 'font-display text-2xl font-bold leading-snug',
  headingLG: 'font-display text-xl font-bold leading-normal',
  headingMD: 'font-sans text-lg font-semibold leading-normal',
  headingSM: 'font-sans text-base font-semibold leading-normal',
  bodyLG: 'font-sans text-lg font-normal leading-relaxed',
  bodyMD: 'font-sans text-base font-normal leading-relaxed',
  bodySM: 'font-sans text-sm font-normal leading-relaxed',
  caption: 'font-sans text-xs font-normal leading-normal text-muted-foreground',
  tiny: 'font-sans text-[10px] font-medium tracking-wider uppercase leading-none text-muted-foreground',
} as const;
