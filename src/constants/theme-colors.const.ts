// Tailwind CSS-inspired palette (sky + slate)

export const DARK = {
  BACKGROUND_CONTAINER: '#1e293b', // slate-800
  BACKGROUND_ELEVATED: '#334155', // slate-700
  BORDER: '#334155', // slate-700
  ICON_SVG: '#f8fafc', // slate-50
  TEXT: '#f8fafc', // slate-50
  TEXT_PLACEHOLDER: 'rgba(148, 163, 184, 0.6)', // slate-400
} as const;

export const DEFAULT = {
  BLACK: '#030612',
  PRIMARY: '#0ea5e9', // sky-500
  WHITE: '#ffffff',
} as const;

export const LIGHT = {
  BACKGROUND_CONTAINER: '#ffffff',
  BACKGROUND_ELEVATED: '#ffffff',
  BORDER: '#e2e8f0', // slate-200
  ICON_SVG: '#030612',
  TEXT: '#030612',
  TEXT_PLACEHOLDER: 'rgba(100, 116, 139, 0.5)', // slate-500
} as const;
