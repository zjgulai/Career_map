---
name: tailwind-v4-configuration
description: Configure Tailwind CSS v4 with CSS-first approach. Use when installing, migrating from v3, setting up build tools (Vite/PostCSS/CLI), customizing themes with @theme, or configuring plugins.
---

# Tailwind CSS v4 Configuration

A complete guide to configuring Tailwind CSS v4 with its new CSS-first approach, unified toolchain, and modern feature set.

## When to Use This Skill

- **Installing Tailwind v4** for the first time in a new project
- **Migrating from Tailwind v3** to v4 (breaking changes and setup differences)
- **Setting up build tools**: Vite, PostCSS, or standalone CLI
- **Customizing themes** using the `@theme` directive
- **Configuring content paths** and template detection
- **Adding plugins** or creating custom utilities
- **Configuring dark mode**, prefixes, or other global options
- **Troubleshooting** v4 configuration issues

## Key v4 Changes Overview

| Aspect             | v3                                | v4                                              |
| ------------------ | --------------------------------- | ----------------------------------------------- |
| **Configuration**  | `tailwind.config.js` (JavaScript) | `@theme` block in CSS                           |
| **Import**         | Three `@tailwind` directives      | Single `@import "tailwindcss"`                  |
| **Content paths**  | Explicit `content` array          | Automatic detection (respects `.gitignore`)     |
| **Build pipeline** | Requires PostCSS + plugins        | Integrated Lightning CSS (all-in-one)           |
| **Performance**    | Fast                              | 10x faster (Oxide engine)                       |
| **Colors**         | hex, rgb, hsl                     | Native `oklch()` + modern color spaces          |
| **Variants**       | `outline-none` removed outline    | `outline-hidden` + proper `outline-none`        |
| **Shadows**        | `shadow-sm` (smallest)            | `shadow-xs` (smallest), `shadow-md` (default)   |
| **Border radius**  | `rounded-sm` (smallest)           | `rounded-xs` (smallest), `rounded-md` (default) |

## Installation & Setup

### Option 1: Vite (Recommended)

**Install:**

```bash
npm install tailwindcss@latest @tailwindcss/vite@latest
```

**Configure `vite.config.ts`:**

```typescript
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

**Import in CSS:**

```css
@import "tailwindcss";

@theme {
  /* Your theme customization here */
}
```

### Option 2: PostCSS

**Install:**

```bash
npm install tailwindcss@latest @tailwindcss/postcss@latest
```

**Configure `postcss.config.mjs`:**

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**Note:** In v4, PostCSS plugins like `postcss-import` and `autoprefixer` are no longer needed - they're built into the Tailwind toolchain.

### Option 3: Standalone CLI

**Install:**

```bash
npm install @tailwindcss/cli@latest
```

**Run:**

```bash
npx @tailwindcss/cli -i ./src/input.css -o ./dist/output.css
```

## CSS-First Configuration

### Basic Setup

All configuration now lives in your CSS file using the `@theme` directive:

```css
/* app.css */
@import "tailwindcss";

@theme {
  /* Custom colors - creates utilities and CSS variables */
  --color-brand-primary: oklch(0.65 0.24 354.31);
  --color-brand-secondary: oklch(0.72 0.11 178);
  --color-accent: #f59e0b;

  /* Color palettes (generates 50-950 scale) */
  --color-neon-pink: oklch(71.7% 0.25 360);
  --color-neon-lime: oklch(91.5% 0.258 129);
  --color-neon-cyan: oklch(91.3% 0.139 195.8);

  /* Custom fonts */
  --font-display: "Satoshi", "sans-serif";
  --font-body: "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Custom breakpoints */
  --breakpoint-3xl: 1920px;
  --breakpoint-4xl: 2560px;

  /* Custom spacing */
  --spacing-18: 4.5rem;
  --spacing-128: 32rem;

  /* Custom shadows */
  --shadow-soft: 0 2px 15px -3px rgb(0 0 0 / 0.07);
  --shadow-glow: 0 0 20px rgb(59 130 246 / 0.5);

  /* Custom border radius */
  --radius-button: 0.5rem;
  --radius-card: 0.75rem;

  /* Custom animations */
  --animate-fade-in: fade-in 0.5s ease-out;
  --animate-slide-up: slide-up 0.3s ease-out;

  /* Custom easing functions */
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);

  /* Custom transition durations */
  --duration-slow: 500ms;
  --duration-fast: 150ms;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Usage in HTML:**

```html
<div class="bg-brand-primary font-display 3xl:p-8 shadow-soft animate-fade-in">
  Custom themed element
</div>
```

### Theme Naming Convention

Theme variables follow this pattern:

```css
@theme {
  /* Format: --<category>-<name>: <value> */

  /* Colors: --color-<name> */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;

  /* Fonts: --font-<name> */
  --font-sans: "Inter", sans-serif;

  /* Breakpoints: --breakpoint-<name> */
  --breakpoint-xl: 1280px;

  /* Spacing: --spacing-<number> or --spacing-<name> */
  --spacing-72: 18rem;
}
```

## Global Configuration Options

### Prefix Utility Classes

Avoid conflicts with existing CSS classes:

```css
@import "tailwindcss" prefix(tw);

@theme {
  /* Theme variables stay without prefix */
  --color-brand: #3b82f6;
}
```

**Usage:**

```html
<!-- Classes now prefixed with 'tw-' -->
<div class="tw-bg-brand tw-text-center">Prefixed</div>
```

### Important Modifier

Make all utilities `!important` by default:

```css
@import "tailwindcss" important;
```

### Dark Mode Configuration

Tailwind v4 defaults to media query dark mode. For class-based dark mode:

```css
@import "tailwindcss";

/* Define custom dark variant using class selector */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-primary: oklch(0.65 0.24 354.31);
  --color-primary-dark: oklch(0.75 0.2 354.31); /* Alternative approach */
}
```

**Usage in HTML:**

```html
<html class="dark">
  <body class="bg-white dark:bg-gray-900">
    <div class="text-gray-900 dark:text-white">Adapts to dark mode</div>
  </body>
</html>
```

## Content Path Configuration

### Automatic Detection (Default)

In v4, Tailwind automatically discovers templates:

- **Ignores** paths in `.gitignore`
- **Scans** common template files (`.html`, `.jsx`, `.tsx`, `.vue`, `.svelte`, etc.)
- **Uses Vite module graph** when using the Vite plugin
- **Performance-optimized** with heuristics

**No configuration needed for most projects!**

### Explicit Source Registration

Override automatic detection:

```css
@import "tailwindcss" source(none);

/* Register specific paths */
@source "./src/components";
@source "./src/pages";
@source "../shared/ui";

/* Or use relative path from CSS file location */
@source "../admin";
@source "../shared";
```

### Custom Base Path

Set base path for source detection (useful in monorepos):

```css
@import "tailwindcss" source("../src");
```

### Ignore Specific Paths

Exclude directories from scanning:

```css
@source "./src/components";
@source not "./src/legacy";
@source not "./node_modules";
```

### Safelist Utilities

Force generation of specific utilities (for dynamic classes):

```css
@import "tailwindcss";

/* Safelist individual utilities */
@source inline("bg-blue-500");
@source inline("text-center");
@source inline("hover:opacity-100");
```

## Custom Utilities

### Define Custom Utilities

Use `@utility` to create custom utility classes:

```css
@import "tailwindcss";

/* Simple utility */
@utility content-auto {
  content-visibility: auto;
}

/* Utility with variants */
@utility text-balance {
  text-wrap: balance;
}

/* Functional utility pattern */
@utility tab-* {
  tab-size: --value(--tab-size-*);
}

@theme {
  --tab-size-2: 2;
  --tab-size-4: 4;
  --tab-size-8: 8;
}
```

**Usage:**

```html
<div class="content-auto text-balance tab-4">
  Custom utilities working with variants
</div>
<div class="hover:content-auto focus:content-auto">
  Works with all variants!
</div>
```

### Custom Variants

Create your own variants:

```css
@import "tailwindcss";

/* Custom variant for specific theme */
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));

/* Combine multiple selectors */
@custom-variant selected-not-disabled (&[data-selected]:not([data-disabled]));

/* Group variant */
@custom-variant group-hover (&:where(.group:hover *));

/* Mobile-first responsive */
@custom-variant landscape (&@(orientation: landscape));
```

**Usage:**

```html
<div data-theme="midnight">
  <div class="theme-midnight:bg-gray-900">
    Only applies when data-theme="midnight"
  </div>
</div>

<button data-selected="true" class="selected-not-disabled:bg-blue-500">
  Selected and not disabled
</button>
```

### Apply Variants in Custom CSS

Use `@variant` to apply Tailwind variants in custom CSS:

```css
.my-element {
  background: white;

  @variant dark {
    background: black;
  }

  @variant hover {
    background: gray;
  }

  @variant focus {
    outline: 2px solid blue;
  }
}
```

### Component-Like Utilities

Previously `@layer components`, now use `@utility`:

```css
@utility btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

/* Specific button variants using @theme colors */
@utility btn-primary {
  @utility btn-base;
  background-color: var(--color-blue-500);
  color: white;
}

@utility btn-primary:hover {
  background-color: var(--color-blue-600);
}
```

**Note:** Utilities are sorted by property count in v4, allowing easy overrides without configuration.

## Plugin System

### Loading Legacy Plugins

Use `@plugin` to load v3-style JavaScript plugins:

```css
@import "tailwindcss";

/* Load by package name */
@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";
@plugin "@tailwindcss/aspect-ratio";

/* Load from local path */
@plugin "./plugins/my-custom-plugin.js";
```

### Loading Legacy Configuration

Incrementally migrate using `@config`:

```css
@import "tailwindcss";

/* Load existing v3 config */
@config "../../tailwind.config.js";

/* Combine with v4 theme - v4 takes precedence */
@theme {
  --color-brand: oklch(0.65 0.24 354.31);
}
```

**Note:** Core plugins, safelist, and separator options from legacy configs are not supported in v4.

### Creating Custom Plugins (v4 Style)

While v4 encourages CSS-first approach, you can still create plugins for complex functionality:

```javascript
// plugins/my-plugin.js
export default function ({ addUtilities, addComponents, theme }) {
  const newUtilities = {
    ".scrollbar-hide": {
      "-ms-overflow-style": "none",
      "scrollbar-width": "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
  };

  addUtilities(newUtilities);
}
```

Load in CSS:

```css
@plugin "./plugins/my-plugin.js";
```

## Migration from v3 to v4

### Automated Migration

Use the official upgrade tool:

```bash
# Requires Node.js 20 or higher
npx @tailwindcss/upgrade
```

The tool handles:

- Updating dependencies
- Migrating `tailwind.config.js` to CSS `@theme`
- Updating template files for breaking changes
- Modifying PostCSS configuration

### Manual Migration Steps

**1. Update Dependencies:**

```bash
# Remove v3
npm uninstall tailwindcss postcss autoprefixer

# Install v4
npm install tailwindcss @tailwindcss/vite @tailwindcss/postcss
```

**2. Update PostCSS Config:**

```javascript
// v3
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    postcss-import: {},
  },
};

// v4
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**3. Replace CSS Imports:**

```css
/* v3 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 */
@import "tailwindcss";
```

**4. Migrate JavaScript Config to CSS:**

```javascript
// tailwind.config.js (v3)
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: "#3b82f6",
        mint: "#10b981",
      },
      fontFamily: {
        display: ["Satoshi", "sans-serif"],
      },
      screens: {
        "3xl": "1920px",
      },
    },
  },
};
```

```css
/* app.css (v4) */
@import "tailwindcss";

@theme {
  --color-brand: #3b82f6;
  --color-mint: #10b981;
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 1920px;
}
```

**5. Update Breaking Utility Changes:**

```html
<!-- Shadow utilities -->
<input class="shadow-sm" />
<!-- v3 -->
<input class="shadow-xs" />
<!-- v4 -->

<input class="shadow" />
<!-- v3 -->
<input class="shadow-sm" />
<!-- v4 -->

<!-- Border radius utilities -->
<input class="rounded-sm" />
<!-- v3 -->
<input class="rounded-xs" />
<!-- v4 -->

<!-- Blur utilities -->
<div class="blur-sm" />
<!-- v3 -->
<div class="blur-xs" />
<!-- v4 -->

<div class="blur" />
<!-- v3 -->
<div class="blur-sm" />
<!-- v4 -->

<!-- Outline utilities -->
<input class="focus:outline-none" />
<!-- v3 (removed outline) -->
<input class="focus:outline-hidden" />
<!-- v4 (equivalent) -->
<input class="focus:outline-none" />
<!-- v4 (outline-style: none) -->

<!-- Opacity utilities -->
<div class="bg-blue-500 bg-opacity-50" />
<!-- v3 -->
<div class="bg-blue-500/50" />
<!-- v4 -->

<!-- Gradients -->
<div class="bg-gradient-to-r from-blue-500 to-purple-500" />
<!-- v3 -->
<div class="bg-linear-to-r from-blue-500 to-purple-500" />
<!-- v4 -->

<!-- Border color -->
<div class="border border-gray-200" />
<!-- v3 (default gray-200) -->
<div class="border border-current" />
<!-- v4 (default currentColor) -->
<div class="border border-gray-200" />
<!-- v4 (explicitly set) -->

<!-- Ring utilities -->
<div class="ring" />
<!-- v3 (3px blue-500) -->
<div class="ring-3" />
<!-- v4 (3px currentColor) -->
<div class="ring-3 ring-blue-500" />
<!-- v4 (explicit color) -->
```

### Content Configuration Migration

```javascript
// v3 - required
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};
```

```css
/* v4 - automatic! (respects .gitignore) */
@import "tailwindcss";

/* Only configure if you need to override */
@import "tailwindcss" source(none);
@source "./src";
```

### Plugin Migration

```javascript
// v3
module.exports = {
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
```

```css
/* v4 */
@import "tailwindcss";

@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";
```

## Framework-Specific Setup

### Next.js (App Router)

**Install:**

```bash
npm install tailwindcss@latest @tailwindcss/postcss@latest
```

**`postcss.config.mjs`:**

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**`app/globals.css`:**

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-inter), system-ui, sans-serif;
}
```

**`app/layout.tsx`:**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter" });

export const metadata: Metadata = {
  title: "My App",
  description: "Built with Tailwind v4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
```

### Next.js (Pages Router)

**`pages/_app.tsx`:**

```typescript
import '../styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

**`styles/globals.css`:**

```css
@import "tailwindcss";

@theme {
  /* Your theme */
}
```

### React (Create React App)

**Install:**

```bash
npm install tailwindcss@latest @tailwindcss/postcss@latest
```

**`craco.config.js`:**

```javascript
module.exports = {
  style: {
    postcss: {
      plugins: {
        "@tailwindcss/postcss": {},
      },
    },
  },
};
```

**`src/index.css`:**

```css
@import "tailwindcss";

@theme {
  /* Your theme */
}
```

### Vue 3 (Vite)

**Install:**

```bash
npm install tailwindcss@latest @tailwindcss/vite@latest
```

**`vite.config.ts`:**

```typescript
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
});
```

**`src/style.css`:**

```css
@import "tailwindcss";

@theme {
  /* Your theme */
}
```

**`src/main.ts`:**

```typescript
import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

createApp(App).mount("#app");
```

### SvelteKit

**Install:**

```bash
npm install tailwindcss@latest @tailwindcss/vite@latest
```

**`vite.config.ts`:**

```typescript
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
});
```

**`src/app.css`:**

```css
@import "tailwindcss";

@theme {
  /* Your theme */
}
```

**`src/routes/+layout.svelte`:**

```svelte
<script>
  import '../app.css';
</script>

<slot />
```

## Advanced Configuration

### Multiple Tailwind Stylesheets

In v4, you can have multiple Tailwind stylesheets with isolated configurations:

```css
/* admin/styles.css */
@import "tailwindcss" source(none);

@source "../admin";
@source "../shared/admin";

@theme {
  --color-admin-primary: #7c3aed;
}

@utility admin-btn {
  /* Admin-specific button styles */
}
```

```css
/* public/styles.css */
@import "tailwindcss" source(none);

@source "../public";
@source "../shared/public";

@theme {
  --color-public-primary: #3b82f6;
}
```

### Custom Property Scoping

Use CSS custom properties with theme for dynamic theming:

```css
@import "tailwindcss";

@theme {
  /* Create theme variables */
  --color-background: var(--theme-bg, #ffffff);
  --color-foreground: var(--theme-fg, #0f172a);
  --color-primary: var(--theme-primary, #3b82f6);
}

/* Define theme sets */
[data-theme="dark"] {
  --theme-bg: #0f172a;
  --theme-fg: #f1f5f9;
  --theme-primary: #60a5fa;
}

[data-theme="midnight"] {
  --theme-bg: #020617;
  --theme-fg: #e2e8f0;
  --theme-primary: #818cf8;
}
```

**Usage:**

```html
<div class="bg-background text-foreground">
  <button class="bg-primary text-white">Adapts to current theme</button>
</div>
```

### Animation Libraries

Create reusable animation utilities:

```css
@import "tailwindcss";

@theme {
  --animate-spin: spin 1s linear infinite;
  --animate-ping: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  --animate-bounce: bounce 1s infinite;
  --animate-pulse: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes bounce {
  0%,
  100% {
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    transform: translateY(-25%);
  }
  50% {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### Print Styles

Use the `@variant print` directive:

```css
.print-only {
  @variant screen {
    display: none;
  }

  @variant print {
    display: block;
  }
}
```

Or inline:

```css
.my-element {
  @variant print {
    color: black;
    background: white;
  }
}
```

## Performance Optimization

### Disable Unused Features

If you're not using certain colors, breakpoints, or utilities, v4 will automatically not generate them thanks to its content scanning.

### Minify Output

The build tool automatically minifies CSS in production. No separate CSS minifier needed.

### Tree-Shaking

Vite's module graph integration ensures only used classes are generated:

```typescript
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    // Tailwind v4 automatically optimizes
    // No special configuration needed
  },
});
```

## Best Practices

### ✅ DO

- Use `@import "tailwindcss"` with a single import
- Define theme tokens in `@theme` block
- Leverage automatic content detection
- Use CSS variables with `@theme` for dynamic theming
- Use `@utility` for custom utilities (not `@apply` for components)
- Use `@custom-variant` for reusable variant logic
- Combine v4 CSS configuration with legacy v3 plugins incrementally
- Test the automated upgrade tool before manual migration

### ❌ DON'T

- Create a `tailwind.config.js` file (use CSS `@theme` instead)
- Use `@tailwind base/components/utilities` separately
- Configure `content` paths unless you have a specific need
- Forget to update breaking utility changes (shadow, blur, radius)
- Use opacity utilities like `bg-opacity-50` (use `/50` instead)
- Ignore browser compatibility (v4 targets modern browsers)
- Try to load legacy `autoprefixer` or `postcss-import`

## Common Issues & Solutions

### Issue: Classes Not Generating

**Check content paths:**

```css
@import "tailwindcss" source(none);
@source "./src";
@source "./components";
```

### Issue: Variants Not Working

Ensure you're using the correct syntax:

```css
/* ✅ Correct - custom variant */
@custom-variant dark (&:where(.dark, .dark *));

/* ❌ Wrong - don't use @layer for variants */
@layer components {
  .dark-mode {
    @variant dark {
      /* This won't work as expected */
    }
  }
}
```

### Issue: Legacy Plugin Not Loading

Make sure to use `@plugin` directive:

```css
/* ✅ Correct */
@plugin "@tailwindcss/typography";

/* ❌ Wrong */
@layer components {
  @import "@tailwindcss/typography";
}
```

### Issue: Build Performance Slow

Vite plugin uses module graph for optimal performance. Ensure you're using it:

```typescript
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
// Optimal for development and build
```

## Browser Compatibility

Tailwind CSS v4 targets modern browsers:

- **Chrome/Edge:** 111+
- **Firefox:** 128+
- **Safari:** 16.4+

Automatic transpilation for:

- `oklch()` colors
- CSS nesting
- Modern media queries
- `@property` declarations
- `color-mix()` function

If you need to support older browsers, you may need additional polyfills.

## Quick Reference Cheat Sheet

```css
/* Import */
@import "tailwindcss";

/* Global options */
@import "tailwindcss" prefix(tw);
@import "tailwindcss" important;

/* Theme */
@theme {
  --color-*: <value>;
  --font-*: <value>;
  --breakpoint-*: <value>;
  --spacing-*: <value>;
  --shadow-*: <value>;
  --radius-*: <value>;
  --animate-*: <value>;
  --ease-*: <value>;
}

/* Source control */
@source "./path";
@source not "./path";
@import "tailwindcss" source(none);

/* Custom features */
@utility <name> {
  /* styles */
}
@custom-variant <name> (<selector>);
@plugin "<package-name>";
@config "./path/to/config.js";

/* Variant in CSS */
.my-element {
  @variant hover {
    /* styles */
  }
}
```

## References

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Tailwind CSS v4 GitHub](https://github.com/tailwindlabs/tailwindcss)
- [Automatic Upgrade Tool](https://github.com/tailwindlabs/upgrade)
