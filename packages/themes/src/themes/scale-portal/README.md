@import "@bnmwag/swup-themes/scale-portal/layout.css";
@import "@bnmwag/swup-themes/scale-portal/theme.css";

<div data-swup-shell>
    <Navigation />
    <main id='swup' data-swup-transition>
        <slot />
        <Footer />
    </main>
</div>