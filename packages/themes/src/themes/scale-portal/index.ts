import SwupParallelPlugin from "@swup/parallel-plugin";
import { HEADER_SELECTOR, PAGE_SELECTOR } from "../../constants.js";
import type { SwupTheme } from "../../types.js";

/**
 * Overlap transition. Header and page are both swapped and animated in
 * parallel, scrolling happens inside #swup.
 *
 *   <div data-swup-shell>
 *     <header data-swup-transition="header">...</header>
 *     <main id="swup" data-swup-transition>...page + footer...</main>
 *   </div>
 */
export const scalePortal: SwupTheme = {
  name: "scale-portal",
  options: { containers: [PAGE_SELECTOR, HEADER_SELECTOR] },
  plugins: () => [new SwupParallelPlugin()],
};
