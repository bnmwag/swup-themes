import SwupHeadPlugin from "@swup/head-plugin";
import SwupPreloadPlugin from "@swup/preload-plugin";
import Swup from "swup";
import { ANIMATION_SELECTOR } from "./constants.js";
import { themes } from "./themes/index.js";
import type { SwupTheme, Transitions, TransitionsConfig, Visit } from "./types.js";

function resolveTheme(theme: string | SwupTheme): SwupTheme {
  if (typeof theme !== "string") return theme;
  const found = (themes as Record<string, SwupTheme>)[theme];
  if (!found) {
    throw new Error(`[transitions] Unknown theme "${theme}". Available: ${Object.keys(themes).join(", ")}`);
  }
  return found;
}

/** Copies data-* attributes from the next page's <html>. Set-only, like the original helper. */
function syncHtmlDataAttributes(visit: Visit) {
  if ((visit as { fragmentVisit?: unknown }).fragmentVisit) return;

  let nextHtml = visit.to.document?.documentElement;
  if (!nextHtml && visit.to.html) {
    nextHtml = new DOMParser().parseFromString(visit.to.html, "text/html").documentElement;
  }
  if (!nextHtml) return;

  for (const { name, value } of Array.from(nextHtml.attributes)) {
    if (name.startsWith("data-")) document.documentElement.setAttribute(name, value);
  }
}

/**
 * Drop-in replacement for the hand-written transition service body.
 * Behavior mirrors it: same animation selector, same state classes, same hook order.
 *
 * Note: swup itself already adds `is-animating` when the out animation starts and
 * removes it when the in animation starts, so those two manual toggles are not needed.
 */
export function createTransitions(config: TransitionsConfig): Transitions {
  const theme = resolveTheme(config.theme);
  const root = document.documentElement;
  const transitioning = config.classes?.transitioning ?? "is-transitioning";
  const ready = config.classes?.ready ?? "is-ready";

  const swup = new Swup({
    animateHistoryBrowsing: true,
    animationSelector: ANIMATION_SELECTOR,
    ...theme.options,
    ...config.swup,
    plugins: [
      new SwupHeadPlugin({ persistAssets: true, awaitAssets: true, ...config.head }),
      new SwupPreloadPlugin({ preloadHoveredLinks: true, preloadInitialPage: true, ...config.preload }),
      ...(theme.plugins?.() ?? []),
      ...(config.plugins ?? []),
    ],
  });

  const onError =
    config.onError ?? ((hook, event) => console.error(`[transitions] ${hook}`, event));

  const unregister = [
    swup.hooks.on("visit:start", () => {
      root.classList.add(transitioning);
      root.classList.remove(ready);
    }),
    swup.hooks.before("content:replace", async (visit) => {
      await config.onLeave?.(visit);
    }),
    swup.hooks.on("content:replace", async (visit) => {
      if (config.syncHtmlDataAttributes !== false) syncHtmlDataAttributes(visit);
      await config.onEnter?.(visit);
    }),
    swup.hooks.on("animation:in:end", () => {
      root.classList.remove(transitioning);
      root.classList.add(ready);
    }),
    swup.hooks.on("fetch:error", (event) => onError("fetch:error", event)),
    swup.hooks.on("fetch:timeout", (event) => onError("fetch:timeout", event)),
  ];

  const cleanupSetup = config.setup?.(swup);

  return {
    swup,
    theme,
    destroy() {
      cleanupSetup?.();
      for (const off of unregister) off();
      swup.destroy();
    },
  };
}
