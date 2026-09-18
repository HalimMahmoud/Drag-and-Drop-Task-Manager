'use client';

import { useTheme } from './useTheme';
import { COLOR_PALETTE, getColorByName, getColorVariant, type ColorVariant, type ColorPaletteName } from '../utils/colorPalette';
import { useMemo } from 'react';

export function useColorPalette() {
  const { theme } = useTheme();

  const getVariant = useMemo(() => {
    return (name: ColorPaletteName): { bg: string; border: string; dim: string; text: string } => {
      const color = getColorByName(name);
      if (!color) return getColorVariant(COLOR_PALETTE[0], theme);
      return getColorVariant(color, theme);
    };
  }, [theme]);

  const getColor = useMemo(() => {
    return (name: ColorPaletteName): ColorVariant | undefined => {
      return getColorByName(name);
    };
  }, []);

  const getAllColors = useMemo(() => {
    return COLOR_PALETTE.map((c: typeof COLOR_PALETTE[0]) => getColorVariant(c, theme));
  }, [theme]);

  return { theme, getVariant, getColor, getAllColors };
}

export function resolveColor(name: ColorPaletteName | undefined, theme: 'light' | 'dark', fallback?: ColorVariant) {
  if (!name) return fallback ? getColorVariant(fallback, theme) : getColorVariant(COLOR_PALETTE[0], theme);
  const color = getColorByName(name);
  if (!color) return fallback ? getColorVariant(fallback, theme) : getColorVariant(COLOR_PALETTE[0], theme);
  return getColorVariant(color, theme);
}