import { PAGE_SELECTOR } from "../../constants.js";
import type { SwupTheme } from "../../types.js";

/**
 * Plain fade. Works with the markup you already have:
 *   <main id="swup" data-swup-transition>
 */
export const fade: SwupTheme = {
  name: "fade",
  options: { containers: [PAGE_SELECTOR] },
};
