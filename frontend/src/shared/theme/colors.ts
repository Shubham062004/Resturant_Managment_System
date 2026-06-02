export const colors = {
  primary: {
    DEFAULT: '#B22222', // Firebrick Red
    hover: '#8B1A1A',
  },
  accent: {
    DEFAULT: '#FF8C42', // Warm Orange
    hover: '#E07A34',
  },
  success: {
    DEFAULT: '#22C55E',
    hover: '#16A34A',
  },
  warning: {
    DEFAULT: '#F59E0B',
    hover: '#D97706',
  },
  danger: {
    DEFAULT: '#EF4444',
    hover: '#DC2626',
  },
  info: {
    DEFAULT: '#3B82F6',
    hover: '#2563EB',
  },
  light: {
    background: '#FFF8F0', // Soft warm cream
    surface: '#FFFFFF',
    border: '#E5E7EB',
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      muted: '#9CA3AF',
    },
  },
  dark: {
    background: '#121212', // Premium dark
    surface: '#1E1E1E',
    border: '#2D2D2D',
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      muted: '#9CA3AF',
    },
  },
} as const;

export type ThemeColors = typeof colors;
