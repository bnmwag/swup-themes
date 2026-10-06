import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, beforeAll, expect, test } from "bun:test";

beforeAll(() => {
  GlobalRegistrator.register({ url: "http://localhost/" });
  document.documentElement.setAttribute("data-theme", "dark"); // client-set, must survive
  document.body.innerHTML = `<div data-swup-shell><header data-swup-transition="header"></header><main id="swup" data-swup-transition></main></div>`;
});
afterAll(() => GlobalRegistrator.unregister());

const nextDoc = () =>
  new DOMParser().parseFromString(
    `<html lang="en" data-scroll-orientation-settings="horizontal"><head><title>x</title></head><body><header data-swup-transition="header"></header><main id="swup" data-swup-transition></main></body></html>`,
    "text/html",
  );

test("mirrors the original service: classes, hook order, html data attrs, destroy", async () => {
  const { createTransitions } = await import("../src/index.ts");
  const log: string[] = [];

  const t = createTransitions({
    theme: "parallel-stack",
    preload: { preloadInitialPage: false },
    onLeave: async () => {
      await new Promise((r) => setTimeout(r, 10));
      log.push("leave");
    },
    onEnter: async () => void log.push("enter"),
  });
  const { swup } = t;

  // theme options landed
  expect(swup.options.animationSelector).toBe("[data-swup-transition]");
  expect(swup.options.containers).toEqual(["#swup", '[data-swup-transition="header"]']);
  expect(swup.options.animateHistoryBrowsing).toBe(true);
  expect(swup.plugins.map((p) => p.name)).toEqual(["SwupHeadPlugin", "SwupPreloadPlugin", "SwupParallelPlugin"]);

  const visit = swup.createVisit({ to: "/about" });
  const root = document.documentElement;

  await swup.hooks.call("visit:start", visit, undefined);
  expect(root.classList.contains("is-transitioning")).toBe(true);
  expect(root.classList.contains("is-ready")).toBe(false);

  visit.to.document = nextDoc();
  await swup.hooks.call("content:replace", visit, { page: { url: "/about", html: "" } });
  expect(log).toEqual(["leave", "enter"]); // async onLeave awaited first
  expect(root.getAttribute("data-scroll-orientation-settings")).toBe("horizontal");
  expect(root.getAttribute("data-theme")).toBe("dark"); // set-only: not removed

  await swup.hooks.call("animation:in:end", visit, undefined);
  expect(root.classList.contains("is-transitioning")).toBe(false);
  expect(root.classList.contains("is-ready")).toBe(true);

  t.destroy();
  log.length = 0;
  await swup.hooks.call("content:replace", visit, { page: { url: "/x", html: "" } });
  expect(log).toEqual([]); // hooks unregistered
});

test("fade theme + custom theme + unknown theme", async () => {
  const { createTransitions, defineTheme } = await import("../src/index.ts");

  const fade = createTransitions({ theme: "fade", preload: { preloadInitialPage: false } });
  expect(fade.swup.options.containers).toEqual(["#swup"]);
  expect(fade.swup.plugins.length).toBe(2);
  fade.destroy();

  const mine = defineTheme({ name: "mine", options: { containers: ["#swup"], animationSelector: "[data-x]" } });
  const t = createTransitions({ theme: mine, preload: { preloadInitialPage: false } });
  expect(t.swup.options.animationSelector).toBe("[data-x]");
  t.destroy();

  expect(() => createTransitions({ theme: "nope" })).toThrow(/Unknown theme/);
});
