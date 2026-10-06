import { createTransitions } from "@bnmwag/swup-themes";

import { defineService, emit } from "@/scripts/core";

defineService({

    name: "transitions",
    scope: "app",
    setup() {
        const transitions = createTransitions({
            theme: "scale-portal",
            preload: { preloadInitialPage: !import.meta.env.DEV },
            onLeave: () => emit("page:leave"),
            onEnter: () => emit("page:enter"),
        });

        return () => transitions.destroy();
    },
});
