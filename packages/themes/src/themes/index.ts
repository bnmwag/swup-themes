import type { SwupTheme } from "../types.js";
import { fade } from "./fade/index.js";
import { parallelStack } from "./parallel-stack/index.js";
import { scalePortal } from "./scale-portal/index.js";

export const themes = {
  "parallel-stack": parallelStack,
  "scale-portal": scalePortal,
  fade,
} as const satisfies Record<string, SwupTheme>;

export type ThemeName = keyof typeof themes;

/** Identity helper for project-local themes: gives you types and nothing else. */
export function defineTheme(theme: SwupTheme): SwupTheme {
  return theme;
}
