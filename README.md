# swup-themes

Private monorepo: `packages/themes` (TypeScript, swup transition themes + a drop-in
service factory) and `playground` (Astro, mirrors the kit's structure).

```bash
bun install
bun run dev          # builds the package, starts the playground
bun run dev:themes   # 2nd terminal: tsc --watch for the package
bun run test && bun run typecheck
```
Replace `@bnm` with your scope in the three package.json files and the imports.

## Using a theme (3 steps)

**1. The service** (`scripts/services/transition.ts`) replaces your whole file:

```ts
import { createTransitions } from "@bnmwag/swup-themes";
import { defineService, emit } from "@/scripts/core";

defineService({
  name: "transitions",
  scope: "app",
  setup() {
    const transitions = createTransitions({
      theme: "parallel-stack",                         // or "fade", or your own
      preload: { preloadInitialPage: !import.meta.env.DEV },
      onLeave: () => emit("page:leave"),
      onEnter: () => emit("page:enter"),
    });
    return () => transitions.destroy();
  },
});
```

**2. The CSS** (top of your main.css):

```css
@import "@bnmwag/swup-themes/parallel-stack/layout.css";
@import "@bnmwag/swup-themes/parallel-stack/theme.css";
```
`fade` has only `fade/theme.css`.

**3. The markup**: see the table.

| Theme | Markup |
|---|---|
| `fade` | Your current layout, unchanged: `<main id="swup" data-swup-transition>` |
| `parallel-stack` | `<div data-swup-shell>` wrapping `<header data-swup-transition="header">` and `<main id="swup" data-swup-transition>` (footer goes **inside** main, scrolling happens in `#swup`) |

## What createTransitions keeps from your service

Same animation selector (`[data-swup-transition]`), `animateHistoryBrowsing`, head plugin
(`persistAssets` + `awaitAssets`), preload plugin (hover + `preloadInitialPage`),
`is-transitioning` / `is-ready` on `<html>`, awaited `onLeave` (before `content:replace`)
and `onEnter` (after it), the `fetch:error` / `fetch:timeout` logging, and `destroy()`.

Differences, on purpose:
- **No manual `is-animating` toggles.** swup already adds it when the out animation starts
  and removes it as the default handler of `animation:in:start`; the manual hooks were duplicates.
- **`<html>` data-* sync is built in** (`syncHtmlDataAttributes`, default on): set-only like
  your helper, reads `visit.to.document` instead of re-parsing HTML, no `toDash`.
  I did not use head-plugin's `attributes` option because it also *removes* attributes,
  which would strip client-set ones such as `data-theme`.

Everything else is configurable: `head`, `preload`, `swup` (any swup option), `plugins`,
`classes`, `onError`, and `setup(swup)` for extra hooks.

## Your own theme

A theme is options + optional plugins. CSS is yours.

```ts
import { defineTheme, createTransitions } from "@bnmwag/swup-themes";
const curtain = defineTheme({
  name: "curtain",
  options: { containers: ["#swup"] },
  plugins: () => [/* new MySwupPlugin() */],
});
createTransitions({ theme: curtain });
```

To add it to the package: `src/themes/<name>/{index.ts,theme.css}`, register it in
`src/themes/index.ts`, add the css path to `exports` in `packages/themes/package.json`.

## Notes

- The earlier `@swup/astro` wrapper was dropped. It could not express `[data-swup-transition]`,
  `animateHistoryBrowsing`, awaited hooks or `destroy()` without runtime hacks. It is in the
  previous zip if you want it back.
- `playground/src/scripts/core` is a stand-in for your real core (`defineService`, `emit`, `boot`).
- Never combine this with Astro's `<ClientRouter />`.

## Publish (GitHub Packages, private)

```bash
git tag v0.3.0 && git push --tags     # workflow publishes
```
Consumer `.npmrc`:
```
@bnm:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```
