import type Swup from "swup";
import type { Options, Plugin, Visit } from "swup";
import type SwupHeadPlugin from "@swup/head-plugin";
import type SwupPreloadPlugin from "@swup/preload-plugin";

export type { Visit };

/** What a theme contributes on top of the shared setup (head + preload plugins). */
export interface SwupTheme {
  name: string;
  /** Swup options the theme needs (containers, animationSelector, ...). */
  options?: Partial<Omit<Options, "plugins">>;
  /** Extra plugins, created fresh per instance. */
  plugins?: () => Plugin[];
}

type HeadOptions = NonNullable<ConstructorParameters<typeof SwupHeadPlugin>[0]>;
type PreloadOptions = NonNullable<ConstructorParameters<typeof SwupPreloadPlugin>[0]>;

export interface TransitionsConfig {
  /** Built-in theme name, or your own theme made with defineTheme(). */
  theme: string | SwupTheme;

  /** Awaited before the new content replaces the old one (your `emit("page:leave")`). */
  onLeave?: (visit: Visit) => void | Promise<void>;
  /** Awaited right after content was replaced (your `emit("page:enter")`). */
  onEnter?: (visit: Visit) => void | Promise<void>;
  /** Defaults to console.error("[transitions] <hook>", event). */
  onError?: (hook: "fetch:error" | "fetch:timeout", event: unknown) => void;

  /** Class names toggled on <html>. Defaults: is-transitioning / is-ready. */
  classes?: { transitioning?: string; ready?: string };
  /**
   * Copy data-* attributes of the next page's <html> onto the current one
   * (set-only, never removes: client-set attributes like data-theme survive).
   * Default: true.
   */
  syncHtmlDataAttributes?: boolean;

  /** Defaults: { persistAssets: true, awaitAssets: true } */
  head?: HeadOptions;
  /** Defaults: { preloadHoveredLinks: true, preloadInitialPage: true } */
  preload?: PreloadOptions;
  /** Any other swup option; wins over the theme. */
  swup?: Partial<Omit<Options, "plugins">>;
  /** Extra plugins appended after the theme's. */
  plugins?: Plugin[];
  /** Escape hatch: attach more hooks. Return a cleanup function if needed. */
  setup?: (swup: Swup) => void | (() => void);
}

export interface Transitions {
  swup: Swup;
  theme: SwupTheme;
  destroy: () => void;
}
