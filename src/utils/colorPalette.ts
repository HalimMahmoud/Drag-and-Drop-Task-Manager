import type { ColorPaletteName } from '../types';

export type { ColorPaletteName } from '../types';

export interface ColorVariant {
  name: ColorPaletteName;
  light: {
    bg: string;
    border: string;
    dim: string;
    text: string;
  };
  dark: {
    bg: string;
    border: string;
    dim: string;
    text: string;
  };
}

const PALETTE: ColorVariant[] = [
  {
    name: 'red',
    light: { bg: '#fef2f2', border: '#dc2626', dim: '#fecaca', text: '#991b1b' },
    dark: { bg: '#450a0a', border: '#f87171', dim: '#7f1d1d', text: '#fecaca' },
  },
  {
    name: 'rose',
    light: { bg: '#fff1f2', border: '#e11d48', dim: '#fda4af', text: '#9f1239' },
    dark: { bg: '#4c0519', border: '#fb7185', dim: '#881337', text: '#fda4af' },
  },
  {
    name: 'orange',
    light: { bg: '#fff7ed', border: '#ea580c', dim: '#fed7aa', text: '#9a3412' },
    dark: { bg: '#431407', border: '#fb923c', dim: '#7c2d12', text: '#fed7aa' },
  },
  {
    name: 'amber',
    light: { bg: '#fffbeb', border: '#d97706', dim: '#fde68a', text: '#92400e' },
    dark: { bg: '#451a03', border: '#fbbf24', dim: '#854d0e', text: '#fde68a' },
  },
  {
    name: 'yellow',
    light: { bg: '#fefce8', border: '#ca8a04', dim: '#fef08a', text: '#854d0e' },
    dark: { bg: '#422006', border: '#facc15', dim: '#713f12', text: '#fef08a' },
  },
  {
    name: 'lime',
    light: { bg: '#f7fee7', border: '#84cc16', dim: '#d9f99d', text: '#54780e' },
    dark: { bg: '#2c3d0a', border: '#a3e635', dim: '#4d7c0f', text: '#d9f99d' },
  },
  {
    name: 'green',
    light: { bg: '#f0fdf4', border: '#16a34a', dim: '#bbf7d0', text: '#14532d' },
    dark: { bg: '#052e16', border: '#4ade80', dim: '#064e3b', text: '#bbf7d0' },
  },
  {
    name: 'emerald',
    light: { bg: '#ecfdf5', border: '#059669', dim: '#a7f3d0', text: '#064e3b' },
    dark: { bg: '#022c22', border: '#34d399', dim: '#065f46', text: '#a7f3d0' },
  },
  {
    name: 'teal',
    light: { bg: '#f0fdfa', border: '#0d9488', dim: '#99f6e4', text: '#134e4a' },
    dark: { bg: '#042f2e', border: '#2dd4bf', dim: '#0f766e', text: '#99f6e4' },
  },
  {
    name: 'cyan',
    light: { bg: '#ecfeff', border: '#0891b2', dim: '#a5f3fc', text: '#164e63' },
    dark: { bg: '#083344', border: '#22d3ee', dim: '#155e75', text: '#a5f3fc' },
  },
  {
    name: 'sky',
    light: { bg: '#f0f9ff', border: '#0284c7', dim: '#bae6fd', text: '#075985' },
    dark: { bg: '#082f49', border: '#38bdf8', dim: '#1e3a5f', text: '#bae6fd' },
  },
  {
    name: 'blue',
    light: { bg: '#eff6ff', border: '#2563eb', dim: '#bfdbfe', text: '#1e3a5f' },
    dark: { bg: '#1e3a5f', border: '#60a5fa', dim: '#1e40af', text: '#bfdbfe' },
  },
  {
    name: 'indigo',
    light: { bg: '#eef2ff', border: '#4f46e5', dim: '#c7d2fe', text: '#312e81' },
    dark: { bg: '#1e1b4b', border: '#818cf8', dim: '#3730a3', text: '#c7d2fe' },
  },
  {
    name: 'violet',
    light: { bg: '#f5f3ff', border: '#7c3aed', dim: '#ddd6fe', text: '#4c1d95' },
    dark: { bg: '#2e1065', border: '#a78bfa', dim: '#5b21b6', text: '#ddd6fe' },
  },
  {
    name: 'purple',
    light: { bg: '#faf5ff', border: '#a855f7', dim: '#e9d5ff', text: '#581c87' },
    dark: { bg: '#3b0764', border: '#c084fc', dim: '#6b21a8', text: '#e9d5ff' },
  },
  {
    name: 'fuchsia',
    light: { bg: '#fdf4ff', border: '#d946ef', dim: '#f5d0fe', text: '#701a75' },
    dark: { bg: '#4a044e', border: '#f0abfc', dim: '#86198f', text: '#f5d0fe' },
  },
  {
    name: 'pink',
    light: { bg: '#fdf2f8', border: '#db2777', dim: '#fbcfe8', text: '#9d174d' },
    dark: { bg: '#500724', border: '#f472b6', dim: '#9d174d', text: '#fbcfe8' },
  },
  {
    name: 'slate',
    light: { bg: '#f8fafc', border: '#475569', dim: '#cbd5e1', text: '#1e293b' },
    dark: { bg: '#1e293b', border: '#94a3b8', dim: '#334155', text: '#e2e8f0' },
  },
  {
    name: 'gray',
    light: { bg: '#fafafa', border: '#525252', dim: '#d4d4d4', text: '#18181b' },
    dark: { bg: '#18181b', border: '#a3a3a3', dim: '#404040', text: '#fafafa' },
  },
  {
    name: 'zinc',
    light: { bg: '#fafafa', border: '#525252', dim: '#d4d4d4', text: '#18181b' },
    dark: { bg: '#18181b', border: '#a3a3a3', dim: '#3f3f46', text: '#fafafa' },
  },
  {
    name: 'stone',
    light: { bg: '#fafaf9', border: '#57534e', dim: '#d6d3d1', text: '#1c1917' },
    dark: { bg: '#1c1917', border: '#a8a29e', dim: '#44403c', text: '#fafaf9' },
  },
  {
    name: 'coral',
    light: { bg: '#fff1ef', border: '#f97316', dim: '#ffdab9', text: '#9a3412' },
    dark: { bg: '#431407', border: '#fb923c', dim: '#7c2d12', text: '#ffdab9' },
  },
  {
    name: 'mint',
    light: { bg: '#f0fdf4', border: '#10b981', dim: '#a7f3d0', text: '#065f46' },
    dark: { bg: '#022c22', border: '#34d399', dim: '#065f46', text: '#a7f3d0' },
  },
  {
    name: 'lavender',
    light: { bg: '#f5f3ff', border: '#8b5cf6', dim: '#ddd6fe', text: '#4c1d95' },
    dark: { bg: '#2e1065', border: '#a78bfa', dim: '#5b21b6', text: '#ddd6fe' },
  },
  {
    name: 'gold',
    light: { bg: '#fffbeb', border: '#f59e0b', dim: '#fde68a', text: '#92400e' },
    dark: { bg: '#451a03', border: '#fbbf24', dim: '#854d0e', text: '#fde68a' },
  },
];

export const COLOR_PALETTE = PALETTE;

export function getColorByName(name: ColorPaletteName): ColorVariant | undefined {
  return PALETTE.find((c) => c.name === name);
}

export function getColorVariant(color: ColorVariant, theme: 'light' | 'dark') {
  return theme === 'dark' ? color.dark : color.light;
}

export function getNextAvailableColor(usedNames: ColorPaletteName[]): ColorVariant {
  const used = new Set(usedNames);
  const free = PALETTE.find((c) => !used.has(c.name));
  if (free) return free;
  return PALETTE[used.size % PALETTE.length];
}

export function getNextAvailableColorName(usedNames: ColorPaletteName[]): ColorPaletteName {
  return getNextAvailableColor(usedNames).name;
}

export function getAllColorNames(): ColorPaletteName[] {
  return PALETTE.map((c) => c.name);
}

export function getRandomColor(): ColorVariant {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}