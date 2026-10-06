import { on } from "@/scripts/core";
import { Scroll } from "@/scripts/services/scroll";

// Proves the awaited page:leave / page:enter events fire in order
on("page:leave", async () => {
  console.log("[behavior] page:leave");
});
on("page:enter", async () => {
  console.log("[behavior] page:enter", location.pathname);
});
