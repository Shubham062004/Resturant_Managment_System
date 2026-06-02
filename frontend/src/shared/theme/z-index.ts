export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  drawer: 1050,
  popover: 1070,
  tooltip: 1080,
} as const;

export type ThemeZIndex = typeof zIndex;
