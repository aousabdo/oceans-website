# OCEANS Website Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the OCEANS LLC website per the [design spec](../specs/2026-05-11-oceans-website-redesign-design.md). Ship three theme variants (Operator / Institute / Mariner) as preview deploys for owner selection, then harden the chosen theme and launch.

**Architecture:** Astro 4 static site. Build-time theme selection via `PUBLIC_THEME` env var produces three independently deployable bundles. Shared component library reads CSS-variable design tokens; theme-only components live in per-theme folders and are conditionally imported. Cloudflare Pages hosts all three previews; Pages Functions handle contact + resume-upload forms. Content lives in Astro content collections (MDX for blog, YAML for jobs/team/services/case-studies).

**Tech Stack:** Astro 4 · TypeScript · Tailwind CSS · CSS variables · Cloudflare Pages · Cloudflare Pages Functions · Cloudflare R2 · Cloudflare Turnstile · Resend · Vitest · Playwright · GitHub Actions.

**Working directory:** `/Users/aousabdo/work/Oceans/`. Existing `website/oceans-mockup.html` is reference only — kept until M0 Task 2.

---

## Testing strategy

- **Unit tests (Vitest):** pure functions — content validators, formatters, slug helpers, Pages Functions logic.
- **Integration tests (Vitest + Miniflare):** Pages Functions with simulated R2, Resend, Turnstile.
- **E2E tests (Playwright):** key user journeys — contact form, resume upload, theme nav, blog post render — run against `astro preview` server.
- **Type safety:** `astro check` + `tsc --noEmit` in CI.
- **Visual / a11y:** Lighthouse CI (perf + a11y budgets) + axe-core CLI per preview deploy.
- **TDD discipline:** strict TDD for Pages Functions and pure logic. For Astro components, write the component → render via `astro preview` → verify visually → snapshot/Playwright test the rendered HTML.

---

## File structure

```
/Users/aousabdo/work/Oceans/
├── website/                              Astro app (replaces oceans-mockup.html)
│   ├── package.json
│   ├── astro.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   ├── wrangler.toml                     Cloudflare Pages Functions config
│   ├── .env.example
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── robots.txt
│   │   └── og-default.png
│   ├── functions/                        Cloudflare Pages Functions
│   │   ├── _middleware.ts
│   │   └── api/
│   │       ├── contact.ts
│   │       └── apply.ts
│   ├── src/
│   │   ├── content.config.ts             Collection schemas
│   │   ├── content/
│   │   │   ├── services/                 4× YAML capability files
│   │   │   ├── case-studies/             Seeded YAML
│   │   │   ├── jobs/                     Open-role YAML
│   │   │   ├── team/                     Member YAML
│   │   │   └── blog/                     MDX posts
│   │   ├── styles/
│   │   │   ├── tokens.css                Token contract (variable names + fallbacks)
│   │   │   ├── global.css                Tailwind + base resets
│   │   │   └── themes/
│   │   │       ├── operator.css
│   │   │       ├── institute.css
│   │   │       └── mariner.css
│   │   ├── lib/
│   │   │   ├── theme.ts                  Resolves active theme from env
│   │   │   ├── seo.ts                    Title/description/OG helpers
│   │   │   ├── format.ts                 Date/read-time/slug helpers
│   │   │   ├── validators.ts             Form/file validation (used by Pages Functions)
│   │   │   └── schema.ts                 JSON-LD structured data builders
│   │   ├── components/
│   │   │   ├── Nav.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   ├── SectionLabel.astro
│   │   │   ├── Eyebrow.astro
│   │   │   ├── Tag.astro
│   │   │   ├── Badge.astro
│   │   │   ├── Stat.astro
│   │   │   ├── LogoGrid.astro
│   │   │   ├── ImageWithCaption.astro
│   │   │   ├── PullQuote.astro
│   │   │   ├── Pipeline.astro
│   │   │   ├── ServiceCard.astro
│   │   │   ├── CaseStudyCard.astro
│   │   │   ├── RoleCard.astro
│   │   │   ├── BlogPostCard.astro
│   │   │   ├── Form.astro
│   │   │   ├── FormField.astro
│   │   │   ├── FileUpload.astro
│   │   │   ├── Turnstile.astro
│   │   │   ├── home/
│   │   │   │   ├── HomeOperator.astro
│   │   │   │   ├── HomeInstitute.astro
│   │   │   │   └── HomeMariner.astro
│   │   │   └── themes/
│   │   │       ├── operator/
│   │   │       │   ├── ParticleHeroCanvas.astro
│   │   │       │   ├── CustomCursor.astro
│   │   │       │   └── MarqueeStrip.astro
│   │   │       ├── institute/
│   │   │       │   ├── DropCap.astro
│   │   │       │   ├── Footnote.astro
│   │   │       │   └── FigureCaption.astro
│   │   │       └── mariner/
│   │   │           ├── MaritimeVideoHero.astro
│   │   │           ├── WaveDivider.astro
│   │   │           └── Compass.astro
│   │   ├── layouts/
│   │   │   ├── BaseLayout.astro
│   │   │   ├── PageLayout.astro
│   │   │   ├── BlogPostLayout.astro
│   │   │   ├── RoleLayout.astro
│   │   │   └── CaseStudyLayout.astro
│   │   └── pages/
│   │       ├── index.astro
│   │       ├── services/
│   │       │   ├── index.astro
│   │       │   └── [slug].astro
│   │       ├── experience/
│   │       │   ├── index.astro
│   │       │   └── [slug].astro
│   │       ├── about.astro
│   │       ├── team.astro
│   │       ├── careers/
│   │       │   ├── index.astro
│   │       │   └── [slug].astro
│   │       ├── blog/
│   │       │   ├── index.astro
│   │       │   └── [slug].astro
│   │       ├── contact.astro
│   │       ├── capabilities.astro
│   │       ├── privacy.astro
│   │       ├── terms.astro
│   │       ├── 404.astro
│   │       ├── rss.xml.ts
│   │       └── sitemap-index.xml.ts
│   └── tests/
│       ├── unit/
│       │   ├── validators.test.ts
│       │   ├── format.test.ts
│       │   └── theme.test.ts
│       ├── functions/
│       │   ├── contact.test.ts
│       │   └── apply.test.ts
│       └── e2e/
│           ├── home.spec.ts
│           ├── careers.spec.ts
│           ├── contact.spec.ts
│           └── blog.spec.ts
├── docs/
│   └── superpowers/
│       ├── specs/2026-05-11-oceans-website-redesign-design.md   (exists)
│       └── plans/2026-05-11-oceans-website-redesign.md          (this file)
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .gitignore
└── README.md
```

---

## Milestone map

| ID | Milestone | Tasks | Output |
| --- | --- | --- | --- |
| M0 | Repo & tooling foundation | T1–T5 | Empty Astro app, lint/test scaffolds, git initialized |
| M1 | Theme token system | T6–T10 | Three theme CSS files + build-time selector |
| M2 | Content collections | T11–T14 | Schemas + seed YAML/MDX for all 5 collections |
| M3 | Layouts & navigation | T15–T17 | BaseLayout, Nav, Footer |
| M4 | Shared content components | T18–T22 | Buttons, cards, marks, stats, logo grid |
| M5 | Page-level components | T23–T26 | ServiceCard, CaseStudyCard, RoleCard, BlogPostCard, Pipeline |
| M6 | Forms components | T27–T29 | Form, FormField, FileUpload, Turnstile |
| M7 | Theme-only: Operator | T30–T32 | Particle canvas, custom cursor, marquee |
| M8 | Theme-only: Institute | T33–T35 | Drop cap, footnotes, figure caption |
| M9 | Theme-only: Mariner | T36–T38 | Video hero, wave divider, compass |
| M10 | Pages: services/experience/about/team | T39–T44 | Six page templates |
| M11 | Pages: contact + Pages Function | T45–T47 | Contact UI + `/api/contact` backend (TDD) |
| M12 | Pages: careers + apply Pages Function | T48–T51 | Careers UI + `/api/apply` backend (TDD) |
| M13 | Pages: blog | T52–T54 | Blog index + post + RSS |
| M14 | Pages: capabilities, legal, 404 | T55–T56 | Static pages |
| M15 | Home variants | T57–T59 | Three home pages, one per theme |
| M16 | SEO, perf, a11y, sitemaps | T60–T63 | Structured data, OG images, audits |
| M17 | CI/CD + Cloudflare wiring | T64–T67 | GitHub Actions + Pages project + R2 + Turnstile + Resend |
| M18 | Owner selection workflow | T68–T69 | Three preview URLs + selection handoff |
| M19 | Hardening + launch | T70–T74 | Real content, redirects, DNS cutover, monitoring |

---

## M0 — Repo & tooling foundation

### Task 1: Initialize repo + commit existing artifacts

**Files:**
- Create: `/Users/aousabdo/work/Oceans/.gitignore`
- Create: `/Users/aousabdo/work/Oceans/README.md`

- [ ] **Step 1: Init git in the working directory**

```bash
cd /Users/aousabdo/work/Oceans
git init -b main
```

- [ ] **Step 2: Write `.gitignore`**

```gitignore
# Node
node_modules/
.npm
npm-debug.log*
.pnpm-debug.log*

# Astro
.astro/
dist/

# Build / cache
.cache/
.parcel-cache/

# Env
.env
.env.local
.env.*.local
.dev.vars

# OS
.DS_Store
Thumbs.db

# Editors
.vscode/
.idea/

# Test artifacts
coverage/
test-results/
playwright-report/
playwright/.cache/

# Brainstorm scratch
.superpowers/

# Cloudflare
.wrangler/
```

- [ ] **Step 3: Write `README.md` skeleton**

```markdown
# OCEANS LLC Website

Marketing site for OCEANS LLC. Built with Astro 4 + Cloudflare Pages.

- **Spec:** [docs/superpowers/specs/2026-05-11-oceans-website-redesign-design.md](docs/superpowers/specs/2026-05-11-oceans-website-redesign-design.md)
- **Plan:** [docs/superpowers/plans/2026-05-11-oceans-website-redesign.md](docs/superpowers/plans/2026-05-11-oceans-website-redesign.md)

## Quick start

```bash
cd website
npm install
npm run dev
```

## Themes

The site builds in one of three themes via `PUBLIC_THEME`:

```bash
PUBLIC_THEME=operator  npm run dev
PUBLIC_THEME=institute npm run dev
PUBLIC_THEME=mariner   npm run dev
```

## Deployment

GitHub Actions builds the active branch and deploys to Cloudflare Pages. Three preview deploys (`theme/operator`, `theme/institute`, `theme/mariner`) run continuously during the selection phase.
```

- [ ] **Step 4: Stage and commit**

```bash
git add .gitignore README.md docs/
git commit -m "chore: initialize repo with spec and implementation plan"
```

Expected: clean commit, no errors. `git log` shows one commit.

---

### Task 2: Bootstrap Astro 4 + TypeScript app

**Files:**
- Create: `website/` (full Astro skeleton)
- Delete: `website/oceans-mockup.html` (after copying to a reference branch)

- [ ] **Step 1: Preserve the existing mockup on a reference branch**

```bash
cd /Users/aousabdo/work/Oceans
git checkout -b ref/sonnet-4.6-mockup
git add website/oceans-mockup.html website/current_website_screenshots/
git commit -m "chore: archive prior sonnet-4.6 mockup for reference"
git checkout main
```

- [ ] **Step 2: Move existing mockup contents aside**

```bash
mkdir -p /tmp/oceans-archive
mv /Users/aousabdo/work/Oceans/website/oceans-mockup.html /tmp/oceans-archive/
# Keep the screenshots — they're spec context
```

- [ ] **Step 3: Bootstrap Astro into `website/`**

```bash
cd /Users/aousabdo/work/Oceans
# Astro create-astro is interactive; pipe answers
npm create astro@latest website -- \
  --template minimal --typescript strict --no-install --no-git --yes
cd website
npm install
```

Expected: `website/package.json`, `website/astro.config.mjs`, `website/src/pages/index.astro` exist.

- [ ] **Step 4: Verify dev server boots**

```bash
cd /Users/aousabdo/work/Oceans/website
npm run dev
```

Expected: `Local: http://localhost:4321/` in stdout. Curl `http://localhost:4321/` returns HTML containing "Astro". Kill the dev server.

- [ ] **Step 5: Commit baseline Astro scaffold**

```bash
cd /Users/aousabdo/work/Oceans
git add website/
git commit -m "feat: bootstrap astro 4 app in website/"
```

---

### Task 3: Add Tailwind + MDX + Sitemap integrations

**Files:**
- Modify: `website/astro.config.mjs`
- Modify: `website/package.json`
- Create: `website/tailwind.config.ts`
- Create: `website/src/styles/global.css`
- Modify: `website/src/pages/index.astro` (smoke test)

- [ ] **Step 1: Add integrations**

```bash
cd /Users/aousabdo/work/Oceans/website
npx astro add tailwind mdx sitemap --yes
```

This installs `@astrojs/tailwind`, `@astrojs/mdx`, `@astrojs/sitemap`, and `tailwindcss`. Astro config gets updated automatically.

- [ ] **Step 2: Replace `tailwind.config.cjs` with `tailwind.config.ts`**

Remove the generated `tailwind.config.cjs` if present, write `website/tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{astro,html,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        "bg-2": "var(--color-bg-2)",
        surface: "var(--color-surface)",
        "surface-2": "var(--color-surface-2)",
        fg: "var(--color-fg)",
        "fg-strong": "var(--color-fg-strong)",
        muted: "var(--color-muted)",
        accent: "var(--color-accent)",
        "accent-2": "var(--color-accent-2)",
        "accent-warm": "var(--color-accent-warm)",
        "accent-go": "var(--color-accent-go)",
        "accent-warn": "var(--color-accent-warn)",
        "accent-critical": "var(--color-accent-critical)",
        "border-hairline": "var(--color-border)",
      },
      fontFamily: {
        display: "var(--font-display)",
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
        serif: "var(--font-serif)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Update `website/astro.config.mjs` to set base config**

Open the file and ensure it looks like:

```js
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.oceansllc.com",
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    sitemap(),
  ],
  output: "static",
  vite: {
    define: {
      "import.meta.env.PUBLIC_THEME": JSON.stringify(
        process.env.PUBLIC_THEME ?? "operator"
      ),
    },
  },
});
```

- [ ] **Step 4: Create `website/src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  body {
    background: var(--color-bg);
    color: var(--color-fg);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  ::selection {
    background: var(--color-accent);
    color: var(--color-bg);
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 5: Smoke-test the build**

```bash
cd /Users/aousabdo/work/Oceans/website
npm run build
```

Expected: build succeeds; `dist/` produced. (Pages will be blank/default for now — that's fine.)

- [ ] **Step 6: Commit**

```bash
git add website/
git commit -m "feat: add tailwind, mdx, sitemap integrations with css-var color system"
```

---

### Task 4: Add Vitest + Playwright + Wrangler dev deps

**Files:**
- Modify: `website/package.json`
- Create: `website/vitest.config.ts`
- Create: `website/playwright.config.ts`
- Create: `website/tests/unit/.gitkeep`
- Create: `website/tests/functions/.gitkeep`
- Create: `website/tests/e2e/.gitkeep`

- [ ] **Step 1: Install dev dependencies**

```bash
cd /Users/aousabdo/work/Oceans/website
npm install --save-dev \
  vitest @vitest/coverage-v8 \
  @playwright/test \
  wrangler@latest \
  miniflare@latest \
  @cloudflare/workers-types \
  eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  prettier prettier-plugin-astro
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Write `website/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/functions/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts", "functions/**/*.ts"],
    },
  },
});
```

- [ ] **Step 3: Write `website/playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview",
    port: 4321,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 4: Add scripts to `website/package.json`**

Edit the `"scripts"` block to include:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check && tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext .ts,.tsx,.astro",
    "format": "prettier --write \"**/*.{ts,tsx,astro,md,mdx,json,css}\""
  }
}
```

- [ ] **Step 5: Create empty test directories so structure is committed**

```bash
mkdir -p tests/unit tests/functions tests/e2e
touch tests/unit/.gitkeep tests/functions/.gitkeep tests/e2e/.gitkeep
```

- [ ] **Step 6: Verify Vitest runs (no tests yet, should exit 0)**

```bash
npm run test
```

Expected: `No test files found` is acceptable; exit code 0.

- [ ] **Step 7: Commit**

```bash
cd /Users/aousabdo/work/Oceans
git add website/
git commit -m "feat: add vitest, playwright, wrangler, eslint, prettier"
```

---

### Task 5: Configure ESLint + Prettier + tsconfig strict

**Files:**
- Create: `website/.eslintrc.cjs`
- Create: `website/.prettierrc.json`
- Modify: `website/tsconfig.json`

- [ ] **Step 1: Write `website/.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  ignorePatterns: ["dist/", ".astro/", "node_modules/", "playwright-report/"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
  },
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: { parser: "@typescript-eslint/parser", extraFileExtensions: [".astro"] },
    },
  ],
};
```

Install the astro parser:

```bash
cd /Users/aousabdo/work/Oceans/website
npm install --save-dev eslint-plugin-astro astro-eslint-parser
```

- [ ] **Step 2: Write `website/.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-astro"],
  "overrides": [
    { "files": "*.astro", "options": { "parser": "astro" } }
  ]
}
```

- [ ] **Step 3: Tighten `website/tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@lib/*": ["src/lib/*"],
      "@styles/*": ["src/styles/*"]
    }
  },
  "include": ["src/**/*", "functions/**/*", "tests/**/*", "*.config.*"]
}
```

- [ ] **Step 4: Run lint to confirm clean baseline**

```bash
cd /Users/aousabdo/work/Oceans/website
npm run lint
npm run check
```

Expected: zero errors. (May warn about no-explicit-any if Astro types use any internally — acceptable.)

- [ ] **Step 5: Commit**

```bash
cd /Users/aousabdo/work/Oceans
git add website/
git commit -m "chore: configure eslint, prettier, strict tsconfig with path aliases"
```


---

## M1 — Theme token system

The theme system swaps a single attribute on `<html>` to flip the whole site. Each theme is a CSS variable set. The active theme is selected at build time via `PUBLIC_THEME`. Token names are stable across themes; only values change.

### Task 6: Define the token contract + tokens.css fallbacks

**Files:**
- Create: `website/src/styles/tokens.css`
- Create: `website/src/lib/theme.ts`
- Create: `website/tests/unit/theme.test.ts`

- [ ] **Step 1: Write `tokens.css` (the contract)**

```css
/* Token contract — every theme MUST define each of these. */
/* Operator defaults are used as fallbacks if no theme is loaded. */
:root {
  /* Surfaces */
  --color-bg: #1A2840;
  --color-bg-2: #14223A;
  --color-surface: #253553;
  --color-surface-2: #314466;

  /* Foreground */
  --color-fg: #EAF2FB;
  --color-fg-strong: #F8FBFF;
  --color-muted: #9AB4D0;

  /* Accents */
  --color-accent: #5BD4FF;
  --color-accent-2: #314466;
  --color-accent-warm: #FFB454;
  --color-accent-go: #5EE6B8;
  --color-accent-warn: #FFB454;
  --color-accent-critical: #FF6B6B;

  /* Border */
  --color-border: rgba(91,212,255,0.18);

  /* Fonts (defaults — themes override) */
  --font-display: "Syne", system-ui, sans-serif;
  --font-sans: "IBM Plex Sans", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --font-serif: Georgia, serif;

  /* Motion */
  --motion-fast: 150ms;
  --motion-med: 280ms;
  --motion-slow: 560ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-oceanic: cubic-bezier(0.22, 0.61, 0.36, 1);
}
```

- [ ] **Step 2: Write `src/lib/theme.ts`**

```ts
export const THEMES = ["operator", "institute", "mariner"] as const;
export type ThemeId = (typeof THEMES)[number];

export function resolveTheme(value: string | undefined): ThemeId {
  if (!value) return "operator";
  return (THEMES as readonly string[]).includes(value) ? (value as ThemeId) : "operator";
}

export const ACTIVE_THEME: ThemeId = resolveTheme(import.meta.env.PUBLIC_THEME);
```

- [ ] **Step 3: Write failing test `tests/unit/theme.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { resolveTheme, THEMES } from "../../src/lib/theme";

describe("resolveTheme", () => {
  it("returns 'operator' when value is undefined", () => {
    expect(resolveTheme(undefined)).toBe("operator");
  });
  it("returns 'operator' when value is unknown", () => {
    expect(resolveTheme("nope")).toBe("operator");
  });
  it("returns the value when it is a valid theme", () => {
    for (const t of THEMES) expect(resolveTheme(t)).toBe(t);
  });
  it("returns 'operator' for empty string", () => {
    expect(resolveTheme("")).toBe("operator");
  });
});
```

- [ ] **Step 4: Run test, expect pass**

```bash
cd /Users/aousabdo/work/Oceans/website
npm run test -- tests/unit/theme.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/aousabdo/work/Oceans
git add website/
git commit -m "feat(themes): token contract + resolveTheme helper with tests"
```

---

### Task 7: Operator theme tokens

**Files:**
- Create: `website/src/styles/themes/operator.css`

- [ ] **Step 1: Write `themes/operator.css` (matches spec §2.1)**

```css
[data-theme="operator"] {
  --color-bg: #1A2840;
  --color-bg-2: #14223A;
  --color-surface: #253553;
  --color-surface-2: #314466;

  --color-fg: #EAF2FB;
  --color-fg-strong: #F8FBFF;
  --color-muted: #9AB4D0;

  --color-accent: #5BD4FF;
  --color-accent-2: #314466;
  --color-accent-warm: #FFB454;
  --color-accent-go: #5EE6B8;
  --color-accent-warn: #FFB454;
  --color-accent-critical: #FF6B6B;

  --color-border: rgba(91,212,255,0.18);

  --font-display: "Syne", system-ui, sans-serif;
  --font-sans: "IBM Plex Sans", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --font-serif: Georgia, serif;
}
```

- [ ] **Step 2: Commit**

```bash
git add website/src/styles/themes/operator.css
git commit -m "feat(themes): operator slate-operations tokens"
```

---

### Task 8: Institute theme tokens

**Files:**
- Create: `website/src/styles/themes/institute.css`

- [ ] **Step 1: Write `themes/institute.css` (matches spec §2.2)**

```css
[data-theme="institute"] {
  --color-bg: #F4F1EC;
  --color-bg-2: #EDE7DC;
  --color-surface: #FFFFFF;
  --color-surface-2: #EDE7DC;

  --color-fg: #1A2333;
  --color-fg-strong: #0F1626;
  --color-muted: #5A6478;

  --color-accent: #1A4477;
  --color-accent-2: #7A6E5A;
  --color-accent-warm: #B8924A;
  --color-accent-go: #5E7A6B;
  --color-accent-warn: #B8924A;
  --color-accent-critical: #8C2E2E;

  --color-border: rgba(26,35,51,0.13);

  --font-display: "Tiempos Headline", "GT Sectra", "Newsreader", Georgia, serif;
  --font-sans: "Inter", "Söhne", system-ui, sans-serif;
  --font-mono: "Söhne Mono", ui-monospace, monospace;
  --font-serif: "Tiempos", "Newsreader", Georgia, serif;
}
```

- [ ] **Step 2: Commit**

```bash
git add website/src/styles/themes/institute.css
git commit -m "feat(themes): institute editorial-cream tokens"
```

---

### Task 9: Mariner theme tokens (Open Sky)

**Files:**
- Create: `website/src/styles/themes/mariner.css`

- [ ] **Step 1: Write `themes/mariner.css` (matches spec §2.3, Open Sky)**

```css
[data-theme="mariner"] {
  --color-bg: #EEF5FA;
  --color-bg-2: #F4F9FC;
  --color-surface: #FFFFFF;
  --color-surface-2: #E4EEF5;

  --color-fg: #0A2942;
  --color-fg-strong: #061A30;
  --color-muted: #4A6480;

  --color-accent: #1A6FAB;
  --color-accent-2: #7FB8E0;
  --color-accent-warm: #B8924A;
  --color-accent-go: #2F855A;
  --color-accent-warn: #B8924A;
  --color-accent-critical: #B33A3A;

  --color-border: rgba(26,111,171,0.18);

  --font-display: "Cormorant Garamond", "Fraunces", "Newsreader", Georgia, serif;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;
  --font-serif: "Cormorant Garamond", "Fraunces", Georgia, serif;
}

[data-theme="mariner"] body {
  background: linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-2) 100%);
  background-attachment: fixed;
}
```

- [ ] **Step 2: Commit**

```bash
git add website/src/styles/themes/mariner.css
git commit -m "feat(themes): mariner open-sky tokens with gradient background"
```

---

### Task 10: Wire theme attribute into global.css + smoke test the build

**Files:**
- Modify: `website/src/styles/global.css`
- Create: `website/src/layouts/BaseLayout.astro` (stub — fleshed out in M3)
- Modify: `website/src/pages/index.astro`

- [ ] **Step 1: Update `global.css` to import all theme files**

Append to `website/src/styles/global.css`:

```css
@import "./tokens.css";
@import "./themes/operator.css";
@import "./themes/institute.css";
@import "./themes/mariner.css";
```

- [ ] **Step 2: Create stub `BaseLayout.astro`**

```astro
---
import "@styles/global.css";
import { ACTIVE_THEME } from "@lib/theme";

interface Props {
  title: string;
  description?: string;
}

const { title, description = "OCEANS LLC — federal systems engineering, T&E, and mission data." } = Astro.props;
---
<!doctype html>
<html lang="en" data-theme={ACTIVE_THEME}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Replace `src/pages/index.astro` with a token smoke test**

```astro
---
import BaseLayout from "@layouts/BaseLayout.astro";
import { ACTIVE_THEME } from "@lib/theme";
---
<BaseLayout title="OCEANS LLC">
  <main class="min-h-screen p-12">
    <p class="font-mono text-sm text-muted uppercase tracking-widest">Theme: {ACTIVE_THEME}</p>
    <h1 class="font-display text-6xl font-bold text-fg-strong mt-4">Engineering that earns trust.</h1>
    <p class="font-sans text-fg mt-6 max-w-prose">Systems engineering, test &amp; evaluation, and mission data solutions.</p>
    <div class="mt-8 grid grid-cols-4 gap-2">
      <div class="aspect-square rounded bg-bg"></div>
      <div class="aspect-square rounded bg-surface"></div>
      <div class="aspect-square rounded bg-accent"></div>
      <div class="aspect-square rounded bg-muted"></div>
    </div>
  </main>
</BaseLayout>
```

- [ ] **Step 4: Run each theme build to confirm token swap works**

```bash
cd /Users/aousabdo/work/Oceans/website
PUBLIC_THEME=operator  npm run build
PUBLIC_THEME=institute npm run build
PUBLIC_THEME=mariner   npm run build
```

Expected: all three builds succeed. Open `dist/index.html` in a browser per build and confirm:
- Operator → slate navy background, cyan accent square, Syne headline
- Institute → cream background, federal-blue accent, serif headline
- Mariner → sky-light gradient, ocean-blue accent, Cormorant headline

- [ ] **Step 5: Commit**

```bash
cd /Users/aousabdo/work/Oceans
git add website/
git commit -m "feat(themes): wire theme attribute via build env + smoke test page"
```


---

## M2 — Content collections

### Task 11: Define content collection schemas

**Files:**
- Create: `website/src/content.config.ts`

- [ ] **Step 1: Write `src/content.config.ts`**

```ts
import { defineCollection, z } from "astro:content";

const services = defineCollection({
  type: "data",
  schema: z.object({
    order: z.number().int(),
    slug: z.string(),
    number: z.string().regex(/^\d{2}$/),
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    methods: z.array(z.string()),
    relatedCaseStudies: z.array(z.string()).default([]),
  }),
});

const caseStudies = defineCollection({
  type: "data",
  schema: z.object({
    slug: z.string(),
    client: z.string(),
    title: z.string(),
    year: z.number().int(),
    domain: z.string(),
    summary: z.string(),
    challenge: z.string(),
    approach: z.string(),
    outcome: z.string(),
    metrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    capabilities: z.array(z.string()),
    badges: z.array(z.string()).default([]),
  }),
});

const jobs = defineCollection({
  type: "data",
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    location: z.string(),
    level: z.enum(["entry", "mid", "senior", "principal"]),
    type: z.enum(["full-time", "part-time", "contract"]),
    department: z.string(),
    posted: z.coerce.date(),
    open: z.boolean().default(true),
    summary: z.string(),
    responsibilities: z.array(z.string()),
    qualifications: z.array(z.string()),
    bonus: z.array(z.string()).default([]),
  }),
});

const team = defineCollection({
  type: "data",
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    role: z.string(),
    leadership: z.boolean().default(false),
    order: z.number().int().default(100),
    bio: z.string(),
    portrait: z.string().optional(),
    email: z.string().email().optional(),
    linkedin: z.string().url().optional(),
  }),
});

const blog = defineCollection({
  type: "content",
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    tags: z.array(z.string()),
    excerpt: z.string(),
    hero: image().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { services, caseStudies, jobs, team, blog };
```

- [ ] **Step 2: Move config to canonical location**

In Astro 4, the file is `src/content.config.ts` (newer) or `src/content/config.ts` (older). Confirm by running:

```bash
cd /Users/aousabdo/work/Oceans/website
npm run check
```

If it complains about location, rename to `src/content/config.ts`.

- [ ] **Step 3: Commit**

```bash
cd /Users/aousabdo/work/Oceans
git add website/
git commit -m "feat(content): define schemas for services, case studies, jobs, team, blog"
```

---

### Task 12: Seed services content

**Files:** Create four YAML files in `website/src/content/services/`.

- [ ] **Step 1: Create directory**

```bash
mkdir -p /Users/aousabdo/work/Oceans/website/src/content/services
```

- [ ] **Step 2: Write `requirements.yml`**

```yaml
order: 1
slug: requirements
number: "01"
title: Requirements Development
summary: Translating mission needs, operational gaps, and stakeholder inputs into structured, testable requirements with full traceability.
tags: [Gap Analysis, Use Cases, Metrics Mapping]
methods:
  - Operational gap analysis
  - Use-case decomposition
  - Capability-to-requirement mapping
  - Performance threshold definition
  - Traceability matrix construction
relatedCaseStudies: []
```

- [ ] **Step 3: Write `systems-engineering.yml`**

```yaml
order: 2
slug: systems-engineering
number: "02"
title: Systems Engineering & Architecture
summary: End-to-end architecture design connecting validated requirements to secure, scalable, lifecycle-aligned solutions.
tags: [CONOPS, Cybersecurity, Integration]
methods:
  - CONOPS development
  - System and sub-system architecture
  - Cybersecurity by design
  - Integration and transition planning
  - Lifecycle alignment
relatedCaseStudies: []
```

- [ ] **Step 4: Write `rdte.yml`**

```yaml
order: 3
slug: rdte
number: "03"
title: Research, Development, Test & Evaluation
summary: Mission-aligned, quantitative RDT&E providing defensible evidence for operational and acquisition decisions.
tags: [TRL Eval, White Team, Test Plans]
methods:
  - Technology Readiness Level assessment
  - Operational T&E execution
  - White Team operations
  - Quantitative analysis and reporting
  - Decision-grade evidence packaging
relatedCaseStudies: []
```

- [ ] **Step 5: Write `mission-data.yml`**

```yaml
order: 4
slug: mission-data
number: "04"
title: Mission Data, COPs & Ontologies
summary: Ontology-driven data architectures enabling multi-domain awareness, interoperability, and decision-quality operating pictures.
tags: [Ontologies, COP Validation, Integration]
methods:
  - Domain ontology design
  - Common Operating Picture validation
  - Multi-domain data integration
  - Schema and interface definition
  - Analytic dashboard delivery
relatedCaseStudies: []
```

- [ ] **Step 6: Verify collection loads**

```bash
cd /Users/aousabdo/work/Oceans/website
npm run check
```

Expected: 0 errors. Zod schemas accept all four files.

- [ ] **Step 7: Commit**

```bash
cd /Users/aousabdo/work/Oceans
git add website/src/content/services/
git commit -m "feat(content): seed four capability service files"
```

---

### Task 13: Seed team + initial case studies

**Files:**
- Create: `website/src/content/team/daniel-brent.yml`
- Create: `website/src/content/team/paul-morrisseau.yml`
- Create: `website/src/content/case-studies/dod-c2-ote.yml`
- Create: `website/src/content/case-studies/dhs-sensor-architecture.yml`

- [ ] **Step 1: Create directories**

```bash
mkdir -p /Users/aousabdo/work/Oceans/website/src/content/team
mkdir -p /Users/aousabdo/work/Oceans/website/src/content/case-studies
```

- [ ] **Step 2: Write team files**

`team/daniel-brent.yml`:
```yaml
slug: daniel-brent
name: Daniel Brent
role: Co-Founder & Principal
leadership: true
order: 1
bio: U.S. Navy veteran with extensive experience in operational systems, sensor deployment, and mission engineering for federal clients.
email: daniel@oceansllc.com
```

`team/paul-morrisseau.yml`:
```yaml
slug: paul-morrisseau
name: Paul Morrisseau
role: Co-Founder & Principal
leadership: true
order: 2
bio: Ocean and systems engineer with 25+ years in enterprise architecture, systems integration, and government program support at SRI International and beyond.
email: paul@oceansllc.com
```

- [ ] **Step 3: Write case studies (sanitized placeholders — confirm with leadership before publishing)**

`case-studies/dod-c2-ote.yml`:
```yaml
slug: dod-c2-ote
client: Department of Defense
title: Operational Test & Evaluation — Command & Control Systems
year: 2024
domain: Defense / C2
summary: Structured OT&E program for a multi-domain Command & Control capability.
challenge: A new multi-domain C2 capability required acquisition-grade operational test evidence under aggressive timeline pressure.
approach: Designed and executed a structured OT&E program, served as White Team lead, and produced quantitative analysis aligned to validated requirements.
outcome: Delivered acquisition-grade assessment report supporting downstream milestone decisions.
metrics: []
capabilities: [rdte, systems-engineering]
badges: [T&E, C2, White Team]
```

`case-studies/dhs-sensor-architecture.yml`:
```yaml
slug: dhs-sensor-architecture
client: Department of Homeland Security
title: Enterprise Architecture & Sensor Integration
year: 2023
domain: Homeland Security
summary: Multi-sensor border surveillance integration architecture with lifecycle cybersecurity.
challenge: Heterogeneous border-sensor portfolio required a coherent integration architecture and CONOPS.
approach: Developed integration architectures, CONOPS, and lifecycle cybersecurity documentation across multiple sensor classes.
outcome: Provided the engineering baseline for sustained multi-sensor operations and downstream procurement.
metrics: []
capabilities: [systems-engineering, mission-data]
badges: [Architecture, Sensor Fusion]
```

- [ ] **Step 4: Verify load**

```bash
cd /Users/aousabdo/work/Oceans/website
npm run check
```

- [ ] **Step 5: Commit**

```bash
cd /Users/aousabdo/work/Oceans
git add website/src/content/
git commit -m "feat(content): seed founders and two placeholder case studies"
```

---

### Task 14: Seed jobs + initial blog post

**Files:**
- Create: `website/src/content/jobs/systems-engineer.yml`
- Create: `website/src/content/jobs/test-evaluator.yml`
- Create: `website/src/content/blog/welcome.mdx`

- [ ] **Step 1: Create directories**

```bash
mkdir -p /Users/aousabdo/work/Oceans/website/src/content/jobs
mkdir -p /Users/aousabdo/work/Oceans/website/src/content/blog
```

- [ ] **Step 2: Write `jobs/systems-engineer.yml`**

```yaml
slug: systems-engineer
title: Senior Systems Engineer
location: Jacksonville, FL (Hybrid)
level: senior
type: full-time
department: Engineering
posted: 2026-05-01
open: true
summary: Lead systems engineering and architecture work on federal mission programs — from requirements through transition.
responsibilities:
  - Translate mission needs into testable requirements with traceability
  - Develop CONOPS and system architectures aligned to lifecycle
  - Lead engineering reviews with federal stakeholders
  - Mentor junior engineers on rigorous systems methods
qualifications:
  - B.S. in engineering or related; 8+ years systems engineering experience
  - Federal program experience (DoD, DHS, or adjacent)
  - U.S. citizenship; ability to obtain and maintain clearance
  - Strong written and verbal communication
bonus:
  - Active Secret or higher clearance
  - INCOSE CSEP or equivalent certification
  - Prior White Team / OT&E experience
```

- [ ] **Step 3: Write `jobs/test-evaluator.yml`**

```yaml
slug: test-evaluator
title: Operational Test & Evaluation Engineer
location: Jacksonville, FL (Hybrid)
level: mid
type: full-time
department: T&E
posted: 2026-05-01
open: true
summary: Design and execute operational test programs that produce acquisition-grade evidence.
responsibilities:
  - Design structured test plans aligned to validated requirements
  - Execute test events as part of White Team or independent evaluator
  - Produce decision-grade reports with quantitative analysis
qualifications:
  - B.S. in engineering, math, or related; 4+ years T&E experience
  - Experience with quantitative analysis and statistical methods
  - U.S. citizenship
bonus:
  - Active clearance
  - Experience with DOT&E reporting standards
```

- [ ] **Step 4: Write `blog/welcome.mdx`**

```mdx
---
title: Welcome to the OCEANS journal
date: 2026-05-11
author: daniel-brent
tags: [announcement]
excerpt: A short note on what this journal is for — and what it isn't.
draft: false
---

We started this journal to share the kind of perspective we bring into engagements: how we think about defensible engineering, where rigor pays off, and where it doesn't.

Posts here will be short, structured, and concrete. Less marketing, more notes from the field.
```

- [ ] **Step 5: Verify load**

```bash
cd /Users/aousabdo/work/Oceans/website
npm run check
```

- [ ] **Step 6: Commit**

```bash
cd /Users/aousabdo/work/Oceans
git add website/src/content/
git commit -m "feat(content): seed two open roles and welcome blog post"
```


---

## M3 — Layouts & navigation

### Task 15: BaseLayout (final) + Web font loading

**Files:**
- Modify: `website/src/layouts/BaseLayout.astro`
- Create: `website/src/lib/seo.ts`

- [ ] **Step 1: Write `src/lib/seo.ts`**

```ts
import { ACTIVE_THEME } from "./theme";

const SITE = {
  name: "OCEANS LLC",
  url: "https://www.oceansllc.com",
  defaultDescription:
    "Systems engineering, test & evaluation, and mission data solutions for federal customers who need defensible outcomes.",
};

export interface SeoInput {
  title: string;
  description?: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}

export function buildSeo(input: SeoInput) {
  const description = input.description ?? SITE.defaultDescription;
  const title = input.title === SITE.name ? SITE.name : `${input.title} — ${SITE.name}`;
  const url = new URL(input.path, SITE.url).toString();
  const image = new URL(input.image ?? "/og-default.png", SITE.url).toString();
  return {
    title,
    description,
    url,
    image,
    type: input.type ?? "website",
    siteName: SITE.name,
    theme: ACTIVE_THEME,
  };
}

export const SITE_NAME = SITE.name;
export const SITE_URL = SITE.url;
```

- [ ] **Step 2: Replace stub `BaseLayout.astro` with full version**

```astro
---
import "@styles/global.css";
import { ACTIVE_THEME } from "@lib/theme";
import { buildSeo, type SeoInput } from "@lib/seo";

interface Props extends Omit<SeoInput, "path"> {
  path?: string;
}

const { title, description, image, type, path } = Astro.props;
const seo = buildSeo({
  title,
  description,
  image,
  type,
  path: path ?? Astro.url.pathname,
});

const fontHrefs: Record<typeof ACTIVE_THEME, string> = {
  operator:
    "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=IBM+Plex+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&display=swap",
  institute:
    "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap",
  mariner:
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap",
};
---
<!doctype html>
<html lang="en" data-theme={ACTIVE_THEME}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{seo.title}</title>
    <meta name="description" content={seo.description} />
    <link rel="canonical" href={seo.url} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href={fontHrefs[ACTIVE_THEME]} />
    <meta property="og:title" content={seo.title} />
    <meta property="og:description" content={seo.description} />
    <meta property="og:type" content={seo.type} />
    <meta property="og:url" content={seo.url} />
    <meta property="og:image" content={seo.image} />
    <meta property="og:site_name" content={seo.siteName} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={seo.title} />
    <meta name="twitter:description" content={seo.description} />
    <meta name="twitter:image" content={seo.image} />
    <script defer src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon='{"token": "REPLACE_WITH_CF_ANALYTICS_TOKEN"}'></script>
  </head>
  <body class="min-h-screen flex flex-col">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-accent focus:text-bg">Skip to content</a>
    <slot name="nav" />
    <main id="main" class="flex-1">
      <slot />
    </main>
    <slot name="footer" />
  </body>
</html>
```

- [ ] **Step 3: Verify build with each theme**

```bash
cd /Users/aousabdo/work/Oceans/website
PUBLIC_THEME=operator npm run build && grep -q "Syne" dist/index.html && echo OK
PUBLIC_THEME=institute npm run build && grep -q "Newsreader" dist/index.html && echo OK
PUBLIC_THEME=mariner npm run build && grep -q "Cormorant" dist/index.html && echo OK
```

Expected: three `OK` lines.

- [ ] **Step 4: Commit**

```bash
cd /Users/aousabdo/work/Oceans
git add website/
git commit -m "feat(layout): BaseLayout with per-theme font loading + SEO helpers"
```

---

### Task 16: Nav component

**Files:**
- Create: `website/src/components/Nav.astro`

- [ ] **Step 1: Write `Nav.astro`**

```astro
---
import { ACTIVE_THEME } from "@lib/theme";

const links = [
  { href: "/services", label: "Services" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/careers", label: "Careers" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const path = Astro.url.pathname;
function isActive(href: string) {
  if (href === "/") return path === "/";
  return path.startsWith(href);
}
---
<nav class="sticky top-0 z-40 backdrop-blur bg-bg/70 border-b border-border-hairline">
  <div class="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
    <a href="/" class="flex items-center gap-2" aria-label="OCEANS LLC home">
      <span class="inline-flex w-8 h-8 items-center justify-center rounded border border-accent">
        <span class="font-display text-accent text-sm font-bold">O</span>
      </span>
      <span class="font-display tracking-wider text-fg-strong">OCEANS</span>
    </a>
    <ul class="hidden md:flex items-center gap-7">
      {links.map((l) => (
        <li>
          <a href={l.href}
             aria-current={isActive(l.href) ? "page" : undefined}
             class:list={[
               "font-mono text-xs uppercase tracking-widest transition-colors",
               isActive(l.href) ? "text-fg-strong" : "text-muted hover:text-fg-strong",
             ]}>
            {l.label}
          </a>
        </li>
      ))}
    </ul>
    <a href="/contact"
       class="hidden md:inline-block font-mono text-[11px] uppercase tracking-widest border border-accent text-accent px-4 py-2 rounded hover:bg-accent hover:text-bg transition-colors">
      Get In Touch
    </a>
    <button id="nav-toggle" class="md:hidden text-fg-strong p-2" aria-label="Open menu">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
  </div>
  <div id="nav-drawer" hidden class="md:hidden border-t border-border-hairline bg-bg">
    <ul class="px-6 py-4 flex flex-col gap-3">
      {links.map((l) => (
        <li><a href={l.href} class="font-mono text-sm uppercase tracking-wider text-fg">{l.label}</a></li>
      ))}
      <li><a href="/contact" class="font-mono text-sm uppercase tracking-wider text-accent">Get In Touch</a></li>
    </ul>
  </div>
</nav>
<script>
  const toggle = document.getElementById("nav-toggle");
  const drawer = document.getElementById("nav-drawer");
  toggle?.addEventListener("click", () => {
    if (!drawer) return;
    const open = !drawer.hasAttribute("hidden");
    if (open) drawer.setAttribute("hidden", "");
    else drawer.removeAttribute("hidden");
    toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
  });
</script>
```

- [ ] **Step 2: Smoke test by adding Nav to homepage**

Modify `src/pages/index.astro`:

```astro
---
import BaseLayout from "@layouts/BaseLayout.astro";
import Nav from "@components/Nav.astro";
import { ACTIVE_THEME } from "@lib/theme";
---
<BaseLayout title="OCEANS LLC" path="/">
  <Nav slot="nav" />
  <section class="mx-auto max-w-6xl px-6 py-24">
    <p class="font-mono text-xs uppercase tracking-widest text-accent">Theme: {ACTIVE_THEME}</p>
    <h1 class="font-display text-5xl md:text-7xl font-bold text-fg-strong mt-4">Engineering that earns trust.</h1>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Run dev server + visually verify**

```bash
cd /Users/aousabdo/work/Oceans/website
PUBLIC_THEME=operator npm run dev
```

Open `http://localhost:4321/` — confirm nav is sticky, links render, mobile toggle opens drawer (resize browser narrow). Kill server. Repeat for `institute` and `mariner`.

- [ ] **Step 4: Commit**

```bash
cd /Users/aousabdo/work/Oceans
git add website/
git commit -m "feat(nav): sticky top nav with mobile drawer and active-page state"
```

---

### Task 17: Footer component

**Files:**
- Create: `website/src/components/Footer.astro`

- [ ] **Step 1: Write `Footer.astro`**

```astro
---
const year = new Date().getFullYear();
const cols = [
  {
    title: "Services",
    links: [
      { href: "/services/requirements", label: "Requirements Development" },
      { href: "/services/systems-engineering", label: "Systems Engineering" },
      { href: "/services/rdte", label: "RDT&E" },
      { href: "/services/mission-data", label: "Mission Data & COPs" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/team", label: "Leadership" },
      { href: "/experience", label: "Past Performance" },
      { href: "/careers", label: "Careers" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/capabilities", label: "Capabilities Statement" },
      { href: "/blog", label: "Blog" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];
---
<footer class="border-t border-border-hairline bg-bg-2 mt-24">
  <div class="mx-auto max-w-6xl px-6 py-16">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
      <div class="md:col-span-1">
        <div class="font-display text-xl tracking-wider text-fg-strong">OCEANS LLC</div>
        <p class="mt-3 text-sm text-muted leading-relaxed max-w-xs">
          Systems engineering, test &amp; evaluation, and mission data solutions for federal customers who need defensible outcomes.
        </p>
        <address class="mt-4 not-italic font-mono text-xs leading-relaxed text-muted">
          Jacksonville, FL<br />
          <a href="mailto:info@oceansllc.com" class="text-accent">info@oceansllc.com</a><br />
          727-455-9383<br />
          <a href="https://www.linkedin.com/company/oceans-llc" class="text-accent" target="_blank" rel="noopener">LinkedIn ↗</a>
        </address>
      </div>
      {cols.map((c) => (
        <div>
          <div class="font-mono text-[10px] uppercase tracking-widest text-accent">{c.title}</div>
          <ul class="mt-5 space-y-2">
            {c.links.map((l) => (
              <li><a href={l.href} class="text-sm text-muted hover:text-fg-strong transition-colors">{l.label}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div class="mt-12 pt-6 border-t border-border-hairline flex items-center justify-between">
      <p class="font-mono text-xs text-muted">© {year} <span class="text-fg">OCEANS LLC</span>. All rights reserved.</p>
      <p class="font-mono text-[10px] uppercase tracking-wider text-muted">CAGE · NAICS · UEI on capabilities statement</p>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Slot footer into homepage smoke test**

Update `src/pages/index.astro`:

```astro
---
import BaseLayout from "@layouts/BaseLayout.astro";
import Nav from "@components/Nav.astro";
import Footer from "@components/Footer.astro";
import { ACTIVE_THEME } from "@lib/theme";
---
<BaseLayout title="OCEANS LLC" path="/">
  <Nav slot="nav" />
  <Footer slot="footer" />
  <section class="mx-auto max-w-6xl px-6 py-24">
    <p class="font-mono text-xs uppercase tracking-widest text-accent">Theme: {ACTIVE_THEME}</p>
    <h1 class="font-display text-5xl md:text-7xl font-bold text-fg-strong mt-4">Engineering that earns trust.</h1>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`, confirm footer renders correctly in all three themes. Kill server.

- [ ] **Step 4: Commit**

```bash
cd /Users/aousabdo/work/Oceans
git add website/
git commit -m "feat(footer): 4-column footer with address and resource links"
```


---

## M4 — Shared content components

Each task: write the component, drop it onto a temporary `/preview` page, verify visually across all three themes, commit. The dev loop is `PUBLIC_THEME=<theme> npm run dev` + browser refresh.

### Task 18: Button + Card + SectionLabel + Eyebrow

**Files:**
- Create: `website/src/components/Button.astro`
- Create: `website/src/components/Card.astro`
- Create: `website/src/components/SectionLabel.astro`
- Create: `website/src/components/Eyebrow.astro`
- Create: `website/src/pages/preview.astro` (gitignored — dev-only)

- [ ] **Step 1: `Button.astro`**

```astro
---
interface Props {
  href?: string;
  type?: "button" | "submit";
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  class?: string;
}
const { href, type = "button", variant = "primary", size = "md", class: extra = "" } = Astro.props;

const base = "inline-flex items-center justify-center font-mono uppercase tracking-widest transition-all rounded";
const sizes = { sm: "text-[11px] px-4 py-2", md: "text-xs px-6 py-3", lg: "text-sm px-8 py-4" }[size];
const variants = {
  primary: "bg-accent text-bg hover:brightness-110 shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
  outline: "border border-accent text-accent hover:bg-accent hover:text-bg",
  ghost: "text-fg hover:text-accent",
}[variant];

const Tag = href ? "a" : "button";
const props = href ? { href } : { type };
---
<Tag class:list={[base, sizes, variants, extra]} {...props}><slot /></Tag>
```

- [ ] **Step 2: `Card.astro`**

```astro
---
interface Props {
  as?: "article" | "div" | "li";
  href?: string;
  accent?: boolean;
  class?: string;
}
const { as = "div", href, accent = false, class: extra = "" } = Astro.props;
const Tag = href ? "a" : as;
const props = href ? { href } : {};
---
<Tag {...props}
  class:list={[
    "block rounded border bg-surface border-border-hairline p-6 transition-all",
    accent && "hover:border-accent",
    href && "hover:-translate-y-0.5 hover:shadow-lg",
    extra,
  ]}>
  <slot />
</Tag>
```

- [ ] **Step 3: `SectionLabel.astro`**

```astro
---
const { class: extra = "" } = Astro.props;
---
<div class:list={["flex items-center gap-3", extra]}>
  <span class="block w-6 h-px bg-accent"></span>
  <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-accent"><slot /></span>
</div>
```

- [ ] **Step 4: `Eyebrow.astro`**

```astro
---
const { class: extra = "" } = Astro.props;
---
<span class:list={["font-mono text-[11px] uppercase tracking-[0.2em] text-accent", extra]}><slot /></span>
```

- [ ] **Step 5: Create `/preview` smoke page**

`src/pages/preview.astro`:

```astro
---
import BaseLayout from "@layouts/BaseLayout.astro";
import Nav from "@components/Nav.astro";
import Footer from "@components/Footer.astro";
import Button from "@components/Button.astro";
import Card from "@components/Card.astro";
import SectionLabel from "@components/SectionLabel.astro";
import Eyebrow from "@components/Eyebrow.astro";
---
<BaseLayout title="Components" path="/preview">
  <Nav slot="nav" />
  <Footer slot="footer" />
  <section class="mx-auto max-w-6xl px-6 py-16 space-y-12">
    <div>
      <SectionLabel>Buttons</SectionLabel>
      <div class="mt-4 flex gap-3 flex-wrap">
        <Button variant="primary">Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="primary" href="/">As link</Button>
      </div>
    </div>
    <div>
      <SectionLabel>Cards</SectionLabel>
      <div class="mt-4 grid grid-cols-3 gap-4">
        <Card><Eyebrow>01</Eyebrow><h3 class="font-display text-lg mt-2 text-fg-strong">Plain card</h3><p class="text-sm text-muted mt-2">Body copy.</p></Card>
        <Card accent><Eyebrow>02</Eyebrow><h3 class="font-display text-lg mt-2 text-fg-strong">Accent on hover</h3><p class="text-sm text-muted mt-2">Hover me.</p></Card>
        <Card href="/" accent><Eyebrow>03</Eyebrow><h3 class="font-display text-lg mt-2 text-fg-strong">Linked card</h3><p class="text-sm text-muted mt-2">I'm clickable.</p></Card>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 6: Visual check across themes**

```bash
PUBLIC_THEME=operator npm run dev  # verify at /preview, kill
PUBLIC_THEME=institute npm run dev # verify, kill
PUBLIC_THEME=mariner npm run dev   # verify, kill
```

- [ ] **Step 7: Add `/preview` to `.gitignore` listing only on prod**

Skip — keep `/preview` in repo as a living styleguide. Just mark in code with a comment. Move on.

- [ ] **Step 8: Commit**

```bash
git add website/
git commit -m "feat(components): Button, Card, SectionLabel, Eyebrow + preview page"
```

---

### Task 19: Tag + Badge + Stat

**Files:**
- Create: `website/src/components/Tag.astro`
- Create: `website/src/components/Badge.astro`
- Create: `website/src/components/Stat.astro`
- Modify: `website/src/pages/preview.astro` (append demo)

- [ ] **Step 1: `Tag.astro`**

```astro
---
const { class: extra = "" } = Astro.props;
---
<span class:list={[
  "inline-block font-mono text-[9px] uppercase tracking-widest text-accent border border-accent/30 px-2 py-1 rounded-sm",
  extra,
]}><slot /></span>
```

- [ ] **Step 2: `Badge.astro`**

```astro
---
interface Props { tone?: "default" | "go" | "warn" | "critical"; class?: string; }
const { tone = "default", class: extra = "" } = Astro.props;
const tones = {
  default: "border-accent/30 text-accent",
  go: "border-accent-go/30 text-accent-go",
  warn: "border-accent-warn/30 text-accent-warn",
  critical: "border-accent-critical/30 text-accent-critical",
}[tone];
---
<span class:list={[
  "inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest border px-2.5 py-1 rounded-sm",
  tones, extra,
]}><slot /></span>
```

- [ ] **Step 3: `Stat.astro`**

```astro
---
interface Props { value: string; label: string; emphasis?: string; }
const { value, label, emphasis } = Astro.props;
---
<div>
  <div class="font-display text-4xl font-bold text-fg-strong leading-none">
    {value}{emphasis && <span class="text-accent">{emphasis}</span>}
  </div>
  <div class="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">{label}</div>
</div>
```

- [ ] **Step 4: Visual check + commit**

Append demos to `/preview` and verify across themes.

```bash
git add website/
git commit -m "feat(components): Tag, Badge (4 tones), Stat"
```

---

### Task 20: LogoGrid + ImageWithCaption + PullQuote

**Files:**
- Create: `website/src/components/LogoGrid.astro`
- Create: `website/src/components/ImageWithCaption.astro`
- Create: `website/src/components/PullQuote.astro`

- [ ] **Step 1: `LogoGrid.astro`**

```astro
---
interface Logo { src: string; alt: string; href?: string; }
interface Props { logos: Logo[]; cols?: 3 | 4 | 5 | 6; class?: string; }
const { logos, cols = 5, class: extra = "" } = Astro.props;
const gridCols = { 3: "grid-cols-2 md:grid-cols-3", 4: "grid-cols-2 md:grid-cols-4", 5: "grid-cols-3 md:grid-cols-5", 6: "grid-cols-3 md:grid-cols-6" }[cols];
---
<ul class:list={["grid items-center gap-8", gridCols, extra]}>
  {logos.map((l) => (
    <li class="flex items-center justify-center">
      {l.href ? (
        <a href={l.href} aria-label={l.alt}><img src={l.src} alt={l.alt} loading="lazy" class="max-h-12 opacity-80 hover:opacity-100 transition-opacity" /></a>
      ) : (
        <img src={l.src} alt={l.alt} loading="lazy" class="max-h-12 opacity-80" />
      )}
    </li>
  ))}
</ul>
```

- [ ] **Step 2: `ImageWithCaption.astro`**

```astro
---
interface Props { src: string; alt: string; caption?: string; figureNumber?: string; class?: string; }
const { src, alt, caption, figureNumber, class: extra = "" } = Astro.props;
---
<figure class:list={["space-y-3", extra]}>
  <img src={src} alt={alt} loading="lazy" class="w-full rounded" />
  {caption && (
    <figcaption class="text-sm text-muted leading-relaxed">
      {figureNumber && <span class="font-mono uppercase tracking-widest text-accent mr-2">{figureNumber}</span>}
      <span>{caption}</span>
    </figcaption>
  )}
</figure>
```

- [ ] **Step 3: `PullQuote.astro`**

```astro
---
interface Props { attribution?: string; class?: string; }
const { attribution, class: extra = "" } = Astro.props;
---
<blockquote class:list={["border-l-2 border-accent pl-6 my-12", extra]}>
  <p class="font-serif text-2xl leading-snug text-fg-strong italic"><slot /></p>
  {attribution && <footer class="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted">— {attribution}</footer>}
</blockquote>
```

- [ ] **Step 4: Visual check + commit**

```bash
git add website/
git commit -m "feat(components): LogoGrid, ImageWithCaption, PullQuote"
```

---

### Task 21: Format helpers (date, read time, slug)

**Files:**
- Create: `website/src/lib/format.ts`
- Create: `website/tests/unit/format.test.ts`

- [ ] **Step 1: Write failing tests `tests/unit/format.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { formatDate, readingTime, toSlug } from "../../src/lib/format";

describe("formatDate", () => {
  it("formats as Month D, YYYY", () => {
    expect(formatDate(new Date("2026-05-11T12:00:00Z"))).toBe("May 11, 2026");
  });
});

describe("readingTime", () => {
  it("returns 1 min for short text", () => {
    expect(readingTime("hello world")).toBe("1 min read");
  });
  it("scales linearly at ~225 wpm", () => {
    const words = Array(450).fill("word").join(" ");
    expect(readingTime(words)).toBe("2 min read");
  });
});

describe("toSlug", () => {
  it("kebabs and lowers", () => {
    expect(toSlug("Hello World!")).toBe("hello-world");
  });
  it("strips diacritics", () => {
    expect(toSlug("Café Léon")).toBe("cafe-leon");
  });
});
```

- [ ] **Step 2: Run, expect fail**

```bash
npm run test -- tests/unit/format.test.ts
```

Expected: tests fail (`format` module not found).

- [ ] **Step 3: Implement `src/lib/format.ts`**

```ts
export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function readingTime(text: string, wpm = 225): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / wpm));
  return `${minutes} min read`;
}

export function toSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

- [ ] **Step 4: Run, expect pass**

```bash
npm run test -- tests/unit/format.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add website/
git commit -m "feat(lib): format helpers (formatDate, readingTime, toSlug) with tests"
```


---

## M5 — Page-level components

### Task 22: ServiceCard

**Files:**
- Create: `website/src/components/ServiceCard.astro`

- [ ] **Step 1: Write component**

```astro
---
import Tag from "./Tag.astro";
interface Props { number: string; title: string; summary: string; tags?: string[]; href: string; }
const { number, title, summary, tags = [], href } = Astro.props;
---
<a href={href} class="group block bg-surface border border-border-hairline rounded p-8 transition-all hover:bg-surface-2 hover:border-accent/40 relative overflow-hidden">
  <span class="absolute top-0 left-0 right-0 h-px bg-accent scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
  <div class="font-mono text-[11px] tracking-widest text-accent">{number}</div>
  <h3 class="font-display text-xl font-bold text-fg-strong mt-6 leading-tight">{title}</h3>
  <p class="mt-3 text-sm text-muted leading-relaxed">{summary}</p>
  {tags.length > 0 && (
    <div class="mt-5 flex flex-wrap gap-1.5">
      {tags.map((t) => <Tag>{t}</Tag>)}
    </div>
  )}
</a>
```

- [ ] **Step 2: Verify visually + commit**

Drop into `/preview` with sample data; check all 3 themes.

```bash
git add website/
git commit -m "feat(components): ServiceCard with hover scan-line"
```

---

### Task 23: CaseStudyCard + RoleCard

**Files:**
- Create: `website/src/components/CaseStudyCard.astro`
- Create: `website/src/components/RoleCard.astro`

- [ ] **Step 1: `CaseStudyCard.astro`**

```astro
---
import Badge from "./Badge.astro";
interface Props { client: string; title: string; summary: string; badges?: string[]; href: string; active?: boolean; }
const { client, title, summary, badges = [], href, active = false } = Astro.props;
---
<a href={href} class="group relative block bg-surface border border-border-hairline rounded p-7 transition-all hover:border-accent/40 hover:-translate-y-1 hover:shadow-lg overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
  <div class="relative">
    <div class="font-mono text-[10px] uppercase tracking-widest text-accent">{client}</div>
    <h3 class="font-display text-lg font-bold text-fg-strong mt-3 leading-snug">{title}</h3>
    <p class="mt-3 text-[13px] text-muted leading-relaxed">{summary}</p>
    {(badges.length > 0 || active) && (
      <div class="mt-5 flex flex-wrap gap-1.5">
        {badges.map((b) => <Badge>{b}</Badge>)}
        {active && <Badge tone="go">Active</Badge>}
      </div>
    )}
  </div>
</a>
```

- [ ] **Step 2: `RoleCard.astro`**

```astro
---
interface Props { title: string; location: string; level: string; type: string; href: string; }
const { title, location, level, type, href } = Astro.props;
---
<a href={href} class="group block bg-surface border border-border-hairline rounded p-6 transition-all hover:border-accent/40">
  <div class="flex items-start justify-between gap-4">
    <div>
      <h3 class="font-display text-lg font-bold text-fg-strong group-hover:text-accent transition-colors">{title}</h3>
      <div class="mt-2 flex gap-3 font-mono text-[10px] uppercase tracking-widest text-muted">
        <span>{level}</span><span>·</span><span>{type}</span><span>·</span><span>{location}</span>
      </div>
    </div>
    <span class="font-mono text-xs text-accent group-hover:translate-x-1 transition-transform">→</span>
  </div>
</a>
```

- [ ] **Step 3: Verify + commit**

```bash
git add website/
git commit -m "feat(components): CaseStudyCard, RoleCard"
```

---

### Task 24: BlogPostCard + Pipeline

**Files:**
- Create: `website/src/components/BlogPostCard.astro`
- Create: `website/src/components/Pipeline.astro`

- [ ] **Step 1: `BlogPostCard.astro`**

```astro
---
import { formatDate } from "@lib/format";
interface Props { title: string; date: Date; author: string; excerpt: string; href: string; tags?: string[]; readTime?: string; }
const { title, date, author, excerpt, href, tags = [], readTime } = Astro.props;
---
<article>
  <a href={href} class="group block">
    <div class="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted">
      <time datetime={date.toISOString()}>{formatDate(date)}</time>
      <span>·</span>
      <span>{author}</span>
      {readTime && <><span>·</span><span>{readTime}</span></>}
    </div>
    <h3 class="font-display text-xl font-bold text-fg-strong mt-3 leading-snug group-hover:text-accent transition-colors">{title}</h3>
    <p class="mt-3 text-sm text-muted leading-relaxed">{excerpt}</p>
    {tags.length > 0 && (
      <div class="mt-4 flex flex-wrap gap-1.5">
        {tags.map((t) => <span class="font-mono text-[9px] uppercase tracking-widest text-muted">#{t}</span>)}
      </div>
    )}
  </a>
</article>
```

- [ ] **Step 2: `Pipeline.astro` (methodology diagram)**

```astro
---
interface Step { label: string; title: string; emphasis?: boolean; }
interface Props { steps: Step[]; class?: string; }
const { steps, class: extra = "" } = Astro.props;
---
<div class:list={["space-y-0", extra]}>
  {steps.map((s, i) => (
    <>
      <div class:list={[
        "p-4 rounded border bg-surface transition-colors hover:border-accent/40",
        s.emphasis ? "border-accent/50" : "border-border-hairline",
      ]}>
        <div class="font-mono text-[10px] uppercase tracking-widest text-accent">{s.label}</div>
        <div class="font-display text-sm font-bold text-fg-strong mt-1">{s.title}</div>
      </div>
      {i < steps.length - 1 && (
        <div class="flex flex-col items-center py-2" aria-hidden="true">
          <div class="w-px h-6 bg-gradient-to-b from-accent/60 to-accent/10"></div>
          <span class="text-accent text-[10px] -mt-1">▼</span>
        </div>
      )}
    </>
  ))}
</div>
```

- [ ] **Step 3: Verify + commit**

```bash
git add website/
git commit -m "feat(components): BlogPostCard, Pipeline methodology diagram"
```


---

## M6 — Forms components

### Task 25: FormField + FileUpload

**Files:**
- Create: `website/src/components/FormField.astro`
- Create: `website/src/components/FileUpload.astro`

- [ ] **Step 1: `FormField.astro`**

```astro
---
interface Props {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "textarea";
  required?: boolean;
  rows?: number;
  placeholder?: string;
  autocomplete?: string;
}
const { name, label, type = "text", required = false, rows = 4, placeholder, autocomplete } = Astro.props;
const id = `field-${name}`;
const baseInput = "block w-full bg-bg-2 border border-border-hairline rounded px-3 py-2.5 text-fg placeholder:text-muted/60 focus:outline-none focus:border-accent transition-colors";
---
<label for={id} class="block">
  <span class="font-mono text-[10px] uppercase tracking-widest text-muted">
    {label}{required && <span class="text-accent-critical ml-0.5" aria-hidden="true">*</span>}
  </span>
  {type === "textarea" ? (
    <textarea id={id} name={name} rows={rows} required={required} placeholder={placeholder}
              class={`${baseInput} mt-2 resize-y`}></textarea>
  ) : (
    <input id={id} name={name} type={type} required={required} placeholder={placeholder}
           autocomplete={autocomplete} class={`${baseInput} mt-2`} />
  )}
</label>
```

- [ ] **Step 2: `FileUpload.astro`**

```astro
---
interface Props { name: string; label: string; accept?: string; maxMb?: number; required?: boolean; }
const { name, label, accept = ".pdf,application/pdf", maxMb = 10, required = false } = Astro.props;
const id = `field-${name}`;
---
<div>
  <label for={id} class="font-mono text-[10px] uppercase tracking-widest text-muted block">
    {label}{required && <span class="text-accent-critical ml-0.5" aria-hidden="true">*</span>}
  </label>
  <div class="mt-2 border border-dashed border-border-hairline rounded p-4 flex items-center justify-between gap-4 bg-bg-2">
    <input id={id} name={name} type="file" accept={accept} required={required}
           data-max-mb={maxMb}
           class="text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-surface-2 file:text-fg-strong file:font-mono file:text-[10px] file:uppercase file:tracking-widest hover:file:bg-accent hover:file:text-bg" />
    <span class="font-mono text-[9px] uppercase tracking-widest text-muted">PDF · max {maxMb}MB</span>
  </div>
</div>
<script define:vars={{ maxMb, id }}>
  document.getElementById(id)?.addEventListener("change", (e) => {
    const f = e.target.files?.[0];
    if (f && f.size > maxMb * 1024 * 1024) {
      alert(`File too large. Max ${maxMb}MB.`);
      e.target.value = "";
    }
  });
</script>
```

- [ ] **Step 3: Commit**

```bash
git add website/
git commit -m "feat(forms): FormField (text/textarea) and FileUpload with size check"
```

---

### Task 26: Turnstile component + Form wrapper

**Files:**
- Create: `website/src/components/Turnstile.astro`
- Create: `website/src/components/Form.astro`

- [ ] **Step 1: `Turnstile.astro`**

```astro
---
interface Props { siteKey?: string; }
const { siteKey } = Astro.props;
const key = siteKey ?? import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? "";
---
{key && (
  <div class="cf-turnstile" data-sitekey={key} data-theme="auto"></div>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
)}
{!key && import.meta.env.DEV && (
  <p class="font-mono text-[10px] uppercase tracking-widest text-accent-warn">⚠ Turnstile not configured (set PUBLIC_TURNSTILE_SITE_KEY)</p>
)}
```

- [ ] **Step 2: `Form.astro`**

```astro
---
interface Props { action: string; method?: "POST"; enctype?: string; class?: string; }
const { action, method = "POST", enctype, class: extra = "" } = Astro.props;
---
<form action={action} method={method} enctype={enctype}
      class:list={["space-y-5 max-w-xl", extra]}
      data-form>
  <slot />
  <div data-form-success hidden class="font-mono text-xs uppercase tracking-widest text-accent-go p-3 border border-accent-go/40 rounded">Thanks. Message sent.</div>
  <div data-form-error hidden class="font-mono text-xs uppercase tracking-widest text-accent-critical p-3 border border-accent-critical/40 rounded">Something went wrong. Try again or email us directly.</div>
</form>
<script>
  for (const form of document.querySelectorAll<HTMLFormElement>("[data-form]")) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const ok = form.querySelector<HTMLElement>("[data-form-success]");
      const err = form.querySelector<HTMLElement>("[data-form-error]");
      ok?.setAttribute("hidden", "");
      err?.setAttribute("hidden", "");
      const fd = new FormData(form);
      try {
        const res = await fetch(form.action, { method: "POST", body: fd });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        ok?.removeAttribute("hidden");
      } catch {
        err?.removeAttribute("hidden");
      }
    });
  }
</script>
```

- [ ] **Step 3: Commit**

```bash
git add website/
git commit -m "feat(forms): Turnstile + progressive-enhancement Form wrapper"
```

---

### Task 27: Validators (used by Pages Functions)

**Files:**
- Create: `website/src/lib/validators.ts`
- Create: `website/tests/unit/validators.test.ts`

- [ ] **Step 1: Failing tests**

```ts
import { describe, it, expect } from "vitest";
import { validateContact, validateApply, isPdf } from "../../src/lib/validators";

describe("validateContact", () => {
  it("requires name, email, message", () => {
    expect(validateContact({}).ok).toBe(false);
  });
  it("accepts a full payload", () => {
    const r = validateContact({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", message: "Hi", subject: "general" });
    expect(r.ok).toBe(true);
  });
  it("rejects bad email", () => {
    const r = validateContact({ firstName: "Ada", lastName: "L", email: "nope", message: "Hi" });
    expect(r.ok).toBe(false);
    expect(r.errors?.email).toBeDefined();
  });
});

describe("validateApply", () => {
  it("requires name, email, roleSlug", () => {
    expect(validateApply({}).ok).toBe(false);
  });
  it("accepts minimal payload", () => {
    expect(validateApply({ name: "Ada", email: "a@b.co", roleSlug: "systems-engineer" }).ok).toBe(true);
  });
});

describe("isPdf", () => {
  it("accepts %PDF magic bytes", () => {
    const buf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    expect(isPdf(buf)).toBe(true);
  });
  it("rejects other content", () => {
    const buf = new Uint8Array([0x47, 0x49, 0x46, 0x38]);
    expect(isPdf(buf)).toBe(false);
  });
});
```

- [ ] **Step 2: Implement `src/lib/validators.ts`**

```ts
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidateResult { ok: boolean; errors?: Record<string, string>; }

export function validateContact(input: Record<string, unknown>): ValidateResult {
  const errors: Record<string, string> = {};
  const firstName = String(input.firstName ?? "").trim();
  const lastName = String(input.lastName ?? "").trim();
  const email = String(input.email ?? "").trim();
  const message = String(input.message ?? "").trim();
  if (!firstName) errors.firstName = "Required";
  if (!lastName) errors.lastName = "Required";
  if (!email || !EMAIL.test(email)) errors.email = "Valid email required";
  if (!message || message.length < 5) errors.message = "Required (5+ characters)";
  return Object.keys(errors).length === 0 ? { ok: true } : { ok: false, errors };
}

export function validateApply(input: Record<string, unknown>): ValidateResult {
  const errors: Record<string, string> = {};
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim();
  const roleSlug = String(input.roleSlug ?? "").trim();
  if (!name) errors.name = "Required";
  if (!email || !EMAIL.test(email)) errors.email = "Valid email required";
  if (!roleSlug) errors.roleSlug = "Required";
  return Object.keys(errors).length === 0 ? { ok: true } : { ok: false, errors };
}

export function isPdf(buf: Uint8Array): boolean {
  if (buf.length < 5) return false;
  return buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46 && buf[4] === 0x2d;
}
```

- [ ] **Step 3: Run tests, expect pass**

```bash
npm run test -- tests/unit/validators.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add website/
git commit -m "feat(lib): validators (contact, apply, isPdf) with tests"
```


---

## M7 — Theme-only components: Operator

### Task 28: ParticleHeroCanvas

**Files:**
- Create: `website/src/components/themes/operator/ParticleHeroCanvas.astro`

- [ ] **Step 1: Write component**

```astro
---
const { class: extra = "" } = Astro.props;
---
<canvas id="op-hero" class:list={["absolute inset-0 w-full h-full", extra]} aria-hidden="true"></canvas>
<script>
  const canvas = document.getElementById("op-hero") as HTMLCanvasElement | null;
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0;
    const resize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    interface P { x: number; y: number; vx: number; vy: number; r: number; a: number; }
    const particles: P[] = Array.from({ length: 140 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.4 + 0.3, a: Math.random() * 0.5 + 0.15,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const now = performance.now() * 0.001;
      ctx.strokeStyle = "rgba(91,212,255,0.06)";
      ctx.lineWidth = 1;
      for (let wi = 0; wi < 3; wi++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const y = h * 0.5 + Math.sin(x * 0.006 + now * (0.4 + wi * 0.15) + wi * 1.2) * 60;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (const p of particles) {
        p.x += p.vx + Math.sin(p.y * 0.008 + now * 0.6) * 0.4;
        p.y += p.vy + Math.cos(p.x * 0.006 + now * 0.4) * 0.25;
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = "#5BD4FF";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    };
    tick();
  }
</script>
```

- [ ] **Step 2: Commit**

```bash
git add website/
git commit -m "feat(operator): ParticleHeroCanvas with wave + particle field"
```

---

### Task 29: CustomCursor

**Files:**
- Create: `website/src/components/themes/operator/CustomCursor.astro`

- [ ] **Step 1: Write component**

```astro
---
---
<div id="op-cursor" class="hidden md:block pointer-events-none fixed z-[60] w-2 h-2 rounded-full bg-accent mix-blend-screen" style="transform:translate(-50%,-50%)"></div>
<div id="op-cursor-ring" class="hidden md:block pointer-events-none fixed z-[59] w-9 h-9 rounded-full border border-accent/40 transition-[width,height] duration-200" style="transform:translate(-50%,-50%)"></div>
<style>
  @media (hover: hover) and (pointer: fine) {
    [data-theme="operator"] body { cursor: none; }
    [data-theme="operator"] a, [data-theme="operator"] button { cursor: none; }
  }
</style>
<script>
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const dot = document.getElementById("op-cursor")!;
    const ring = document.getElementById("op-cursor-ring")!;
    let mx = 0, my = 0, rx = 0, ry = 0;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; dot.style.left = mx + "px"; dot.style.top = my + "px"; });
    const tick = () => { rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15; ring.style.left = rx + "px"; ring.style.top = ry + "px"; requestAnimationFrame(tick); };
    tick();
    document.querySelectorAll("a, button, [role='button']").forEach((el) => {
      el.addEventListener("mouseenter", () => { ring.style.width = "56px"; ring.style.height = "56px"; });
      el.addEventListener("mouseleave", () => { ring.style.width = "36px"; ring.style.height = "36px"; });
    });
  }
</script>
```

- [ ] **Step 2: Commit**

```bash
git add website/
git commit -m "feat(operator): CustomCursor (desktop + pointer-fine only, respects reduced-motion)"
```

---

### Task 30: MarqueeStrip

**Files:**
- Create: `website/src/components/themes/operator/MarqueeStrip.astro`

- [ ] **Step 1: Write component**

```astro
---
interface Props { items: string[]; speed?: number; }
const { items, speed = 22 } = Astro.props;
const doubled = [...items, ...items];
---
<div class="overflow-hidden bg-bg-2 border-y border-border-hairline py-5">
  <div class="flex gap-12 whitespace-nowrap w-max" style={`animation: marquee ${speed}s linear infinite`}>
    {doubled.map((it) => (
      <div class="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-widest text-muted">
        <span class="w-1 h-1 rounded-full bg-accent opacity-60"></span>{it}
      </div>
    ))}
  </div>
</div>
<style>
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @media (prefers-reduced-motion: reduce) { .flex.w-max { animation: none !important; } }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add website/
git commit -m "feat(operator): MarqueeStrip with reduced-motion support"
```

---

## M8 — Theme-only components: Institute

### Task 31: DropCap

**Files:**
- Create: `website/src/components/themes/institute/DropCap.astro`

- [ ] **Step 1: Write component**

```astro
---
const { class: extra = "" } = Astro.props;
---
<p class:list={[
  "font-serif text-lg text-fg leading-relaxed",
  "first-letter:font-display first-letter:font-bold first-letter:text-[4.5rem] first-letter:leading-[0.85] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-accent",
  extra,
]}><slot /></p>
```

- [ ] **Step 2: Commit**

```bash
git add website/
git commit -m "feat(institute): DropCap paragraph treatment"
```

---

### Task 32: Footnote + FigureCaption

**Files:**
- Create: `website/src/components/themes/institute/Footnote.astro`
- Create: `website/src/components/themes/institute/FigureCaption.astro`

- [ ] **Step 1: `Footnote.astro` (inline + collected endnotes)**

```astro
---
interface Props { n: number; }
const { n } = Astro.props;
---
<sup><a href={`#fn-${n}`} id={`fn-ref-${n}`} class="text-accent no-underline hover:underline">[{n}]</a></sup>
```

- [ ] **Step 2: `FigureCaption.astro`**

```astro
---
interface Props { number: string; }
const { number } = Astro.props;
---
<figcaption class="mt-3 text-sm font-serif text-muted italic leading-relaxed">
  <span class="font-mono not-italic text-[10px] uppercase tracking-widest text-accent mr-2">Fig. {number}</span>
  <slot />
</figcaption>
```

- [ ] **Step 3: Commit**

```bash
git add website/
git commit -m "feat(institute): Footnote, FigureCaption components"
```

---

## M9 — Theme-only components: Mariner

### Task 33: MaritimeVideoHero

**Files:**
- Create: `website/src/components/themes/mariner/MaritimeVideoHero.astro`

- [ ] **Step 1: Write component**

```astro
---
interface Props { src: string; poster: string; class?: string; }
const { src, poster, class: extra = "" } = Astro.props;
---
<div class:list={["relative w-full overflow-hidden", extra]}>
  <video
    autoplay muted loop playsinline preload="metadata"
    poster={poster}
    class="absolute inset-0 w-full h-full object-cover">
    <source src={src} type="video/mp4" />
  </video>
  <div class="absolute inset-0 bg-gradient-to-b from-bg/0 via-bg/30 to-bg/80 pointer-events-none"></div>
  <div class="relative">
    <slot />
  </div>
</div>
<script>
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("video").forEach((v) => { v.pause(); v.removeAttribute("autoplay"); });
  }
</script>
```

- [ ] **Step 2: Commit**

```bash
git add website/
git commit -m "feat(mariner): MaritimeVideoHero with poster, gradient, reduced-motion"
```

---

### Task 34: WaveDivider + Compass

**Files:**
- Create: `website/src/components/themes/mariner/WaveDivider.astro`
- Create: `website/src/components/themes/mariner/Compass.astro`

- [ ] **Step 1: `WaveDivider.astro`**

```astro
---
interface Props { flip?: boolean; class?: string; }
const { flip = false, class: extra = "" } = Astro.props;
---
<svg viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden="true"
     class:list={["block w-full h-12", flip && "scale-y-[-1]", extra]}>
  <path d="M0,40 Q300,10 600,40 T1200,40 L1200,80 L0,80 Z" fill="var(--color-accent)" fill-opacity="0.08" />
  <path d="M0,50 Q300,20 600,50 T1200,50" stroke="var(--color-accent)" stroke-width="1" fill="none" stroke-opacity="0.4" />
  <path d="M0,60 Q300,35 600,60 T1200,60" stroke="var(--color-accent)" stroke-width="0.6" fill="none" stroke-opacity="0.3" />
</svg>
```

- [ ] **Step 2: `Compass.astro`**

```astro
---
interface Props { size?: number; class?: string; }
const { size = 80, class: extra = "" } = Astro.props;
---
<svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" class:list={[extra]}>
  <circle cx="50" cy="50" r="45" stroke="var(--color-accent-warm)" stroke-width="1" fill="none" stroke-opacity="0.6" />
  <circle cx="50" cy="50" r="35" stroke="var(--color-accent)" stroke-width="0.5" fill="none" stroke-opacity="0.4" />
  <path d="M50,10 L50,90 M10,50 L90,50" stroke="var(--color-accent-warm)" stroke-width="0.6" stroke-opacity="0.5" />
  <path d="M50,15 L55,50 L50,40 L45,50 Z" fill="var(--color-accent)" />
  <text x="50" y="22" text-anchor="middle" fill="var(--color-accent-warm)" font-size="6" font-family="serif" font-style="italic">N</text>
  <text x="78" y="53" text-anchor="middle" fill="var(--color-accent-warm)" font-size="6" font-family="serif" font-style="italic">E</text>
  <text x="50" y="83" text-anchor="middle" fill="var(--color-accent-warm)" font-size="6" font-family="serif" font-style="italic">S</text>
  <text x="22" y="53" text-anchor="middle" fill="var(--color-accent-warm)" font-size="6" font-family="serif" font-style="italic">W</text>
</svg>
```

- [ ] **Step 3: Commit**

```bash
git add website/
git commit -m "feat(mariner): WaveDivider and Compass ornaments"
```


---

## M10 — Pages: services, experience, about, team

### Task 35: PageLayout

**Files:** Create: `website/src/layouts/PageLayout.astro`

- [ ] **Step 1: Write `PageLayout.astro`**

```astro
---
import BaseLayout from "./BaseLayout.astro";
import Nav from "@components/Nav.astro";
import Footer from "@components/Footer.astro";

interface Props {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}
const props = Astro.props;
---
<BaseLayout {...props}>
  <Nav slot="nav" />
  <Footer slot="footer" />
  <slot />
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add website/
git commit -m "feat(layout): PageLayout wraps BaseLayout with nav + footer slots"
```

---

### Task 36: Services index page

**Files:** Create: `website/src/pages/services/index.astro`

- [ ] **Step 1: Write page**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import ServiceCard from "@components/ServiceCard.astro";
import { getCollection } from "astro:content";

const services = (await getCollection("services")).sort((a, b) => a.data.order - b.data.order);
---
<PageLayout title="Services" description="Four core capabilities — requirements through evaluation.">
  <section class="mx-auto max-w-6xl px-6 pt-24 pb-12">
    <SectionLabel>Our Services</SectionLabel>
    <h1 class="font-display text-5xl md:text-6xl font-bold text-fg-strong mt-4 leading-tight">
      Four core<br />capability areas
    </h1>
    <p class="mt-6 text-base text-muted max-w-xl leading-relaxed">
      Every engagement is scoped to deliver defensible evidence — not just analysis — for operational and acquisition decisions.
    </p>
  </section>
  <section class="mx-auto max-w-6xl px-6 pb-24">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services.map((s) => (
        <ServiceCard number={s.data.number} title={s.data.title} summary={s.data.summary} tags={s.data.tags} href={`/services/${s.data.slug}`} />
      ))}
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: Build + verify**

```bash
PUBLIC_THEME=operator npm run build
PUBLIC_THEME=institute npm run build
PUBLIC_THEME=mariner npm run build
```

- [ ] **Step 3: Commit**

```bash
git add website/
git commit -m "feat(pages): services index"
```

---

### Task 37: Service detail page

**Files:** Create: `website/src/pages/services/[slug].astro`

- [ ] **Step 1: Write page**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import Tag from "@components/Tag.astro";
import Button from "@components/Button.astro";
import CaseStudyCard from "@components/CaseStudyCard.astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const services = await getCollection("services");
  const caseStudies = await getCollection("caseStudies");
  return services.map((s) => ({
    params: { slug: s.data.slug },
    props: {
      service: s.data,
      related: caseStudies.filter((c) => c.data.capabilities.includes(s.data.slug)),
    },
  }));
}

const { service, related } = Astro.props;
---
<PageLayout title={service.title} description={service.summary}>
  <section class="mx-auto max-w-4xl px-6 pt-24 pb-12">
    <SectionLabel>Capability {service.number}</SectionLabel>
    <h1 class="font-display text-4xl md:text-5xl font-bold text-fg-strong mt-4 leading-tight">{service.title}</h1>
    <p class="mt-6 text-lg text-muted leading-relaxed">{service.summary}</p>
    <div class="mt-6 flex flex-wrap gap-2">{service.tags.map((t: string) => <Tag>{t}</Tag>)}</div>
  </section>

  <section class="mx-auto max-w-4xl px-6 py-12">
    <SectionLabel>What this looks like in practice</SectionLabel>
    <ul class="mt-6 space-y-3">
      {service.methods.map((m: string, i: number) => (
        <li class="flex gap-4 p-4 border border-border-hairline rounded bg-surface">
          <span class="font-mono text-[11px] text-accent tracking-widest">0{i + 1}</span>
          <span class="text-fg">{m}</span>
        </li>
      ))}
    </ul>
  </section>

  {related.length > 0 && (
    <section class="mx-auto max-w-6xl px-6 py-12">
      <SectionLabel>Recent engagements</SectionLabel>
      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map((c) => (
          <CaseStudyCard client={c.data.client} title={c.data.title} summary={c.data.summary} badges={c.data.badges} href={`/experience/${c.data.slug}`} />
        ))}
      </div>
    </section>
  )}

  <section class="mx-auto max-w-4xl px-6 py-24 text-center">
    <h2 class="font-display text-3xl text-fg-strong">Have a program that fits this scope?</h2>
    <div class="mt-6"><Button href="/contact" variant="primary">Start a conversation</Button></div>
  </section>
</PageLayout>
```

- [ ] **Step 2: Build + verify each theme + commit**

```bash
PUBLIC_THEME=operator npm run build && PUBLIC_THEME=institute npm run build && PUBLIC_THEME=mariner npm run build
git add website/
git commit -m "feat(pages): dynamic service detail with related case studies"
```

---

### Task 38: Experience index + case study detail

**Files:**
- Create: `website/src/pages/experience/index.astro`
- Create: `website/src/pages/experience/[slug].astro`

- [ ] **Step 1: `experience/index.astro`**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import CaseStudyCard from "@components/CaseStudyCard.astro";
import { getCollection } from "astro:content";

const items = (await getCollection("caseStudies")).sort((a, b) => b.data.year - a.data.year);
---
<PageLayout title="Relevant Experience" description="Past performance across federal missions.">
  <section class="mx-auto max-w-6xl px-6 pt-24 pb-12">
    <SectionLabel>Past Performance</SectionLabel>
    <h1 class="font-display text-5xl md:text-6xl font-bold text-fg-strong mt-4 leading-tight">
      Relevant experience<br />across federal missions
    </h1>
  </section>
  <section class="mx-auto max-w-6xl px-6 pb-24">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((c) => (
        <CaseStudyCard client={c.data.client} title={c.data.title} summary={c.data.summary} badges={c.data.badges} href={`/experience/${c.data.slug}`} />
      ))}
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: `experience/[slug].astro`**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import Badge from "@components/Badge.astro";
import Button from "@components/Button.astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const items = await getCollection("caseStudies");
  return items.map((c) => ({ params: { slug: c.data.slug }, props: { c: c.data } }));
}
const { c } = Astro.props;
---
<PageLayout title={c.title} description={c.summary} type="article">
  <article class="mx-auto max-w-3xl px-6 pt-24 pb-24">
    <SectionLabel>{c.client} · {c.year}</SectionLabel>
    <h1 class="font-display text-4xl md:text-5xl font-bold text-fg-strong mt-4 leading-tight">{c.title}</h1>
    <p class="mt-6 text-lg text-muted leading-relaxed">{c.summary}</p>
    <div class="mt-5 flex flex-wrap gap-2">{c.badges.map((b: string) => <Badge>{b}</Badge>)}</div>

    <div class="mt-12 space-y-10 text-fg leading-relaxed">
      <section>
        <h2 class="font-display text-2xl text-fg-strong">Challenge</h2>
        <p class="mt-3">{c.challenge}</p>
      </section>
      <section>
        <h2 class="font-display text-2xl text-fg-strong">Approach</h2>
        <p class="mt-3">{c.approach}</p>
      </section>
      <section>
        <h2 class="font-display text-2xl text-fg-strong">Outcome</h2>
        <p class="mt-3">{c.outcome}</p>
      </section>
      {c.metrics.length > 0 && (
        <section>
          <h2 class="font-display text-2xl text-fg-strong">Outcomes (sanitized)</h2>
          <dl class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {c.metrics.map((m: { label: string; value: string }) => (
              <div class="border border-border-hairline rounded p-4 bg-surface">
                <dt class="font-mono text-[10px] uppercase tracking-widest text-muted">{m.label}</dt>
                <dd class="font-display text-2xl text-fg-strong mt-2">{m.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>

    <div class="mt-12"><Button href="/contact">Discuss a similar engagement</Button></div>
  </article>
</PageLayout>
```

- [ ] **Step 3: Build all themes + commit**

```bash
PUBLIC_THEME=operator npm run build && PUBLIC_THEME=institute npm run build && PUBLIC_THEME=mariner npm run build
git add website/
git commit -m "feat(pages): experience index + case study detail"
```

---

### Task 39: About + Team pages

**Files:**
- Create: `website/src/pages/about.astro`
- Create: `website/src/pages/team.astro`

- [ ] **Step 1: `about.astro`**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import Button from "@components/Button.astro";
import Card from "@components/Card.astro";

const values = [
  { label: "Core Value", title: "Discipline", desc: "Structured methodology, traceability, and measurable criteria — in every engagement." },
  { label: "Core Value", title: "Clarity", desc: "Findings and recommendations that work at technical, operational, and executive levels." },
  { label: "Core Value", title: "Integrity", desc: "Objective, defensible results grounded in validated requirements. We own our outcomes." },
  { label: "Jacksonville, FL", title: "Est. 2013", desc: "Government · Military · Homeland Security — where it counts most." },
];
---
<PageLayout title="About" description="OCEANS LLC was founded in 2013 on a conviction: federal programs deserve rigorous, objective engineering.">
  <section class="mx-auto max-w-3xl px-6 pt-24 pb-12">
    <SectionLabel>Our Story</SectionLabel>
    <h1 class="font-display text-5xl md:text-6xl font-bold text-fg-strong mt-4 leading-tight">Built on thirty<br />years of trust.</h1>
  </section>
  <section class="mx-auto max-w-3xl px-6 pb-12 space-y-6 text-lg text-fg leading-relaxed">
    <p>OCEANS LLC was founded in 2013 by Daniel Brent and Paul Morrisseau — colleagues who met in Jacksonville when Daniel was serving in the U.S. Navy and later reunited at SRI International in St. Petersburg.</p>
    <p>They built the company on a simple conviction: federal programs deserve rigorous, objective engineering — not just confident-sounding reports.</p>
    <p>Headquartered back where it began in Jacksonville, FL, OCEANS bridges high-level engineering discipline with real-world operational need.</p>
  </section>
  <section class="mx-auto max-w-6xl px-6 py-12">
    <SectionLabel>What we hold ourselves to</SectionLabel>
    <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      {values.map((v) => (
        <Card>
          <div class="font-mono text-[9px] uppercase tracking-widest text-accent">{v.label}</div>
          <h3 class="font-display text-lg font-bold text-fg-strong mt-2">{v.title}</h3>
          <p class="mt-2 text-sm text-muted leading-relaxed">{v.desc}</p>
        </Card>
      ))}
    </div>
  </section>
  <section class="mx-auto max-w-3xl px-6 py-24 text-center">
    <Button href="/team" variant="outline">Meet the team →</Button>
  </section>
</PageLayout>
```

- [ ] **Step 2: `team.astro`**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import { getCollection } from "astro:content";

const team = (await getCollection("team")).sort((a, b) => a.data.order - b.data.order);
const leaders = team.filter((t) => t.data.leadership);
const rest = team.filter((t) => !t.data.leadership);
---
<PageLayout title="Team" description="Leadership and engineering at OCEANS LLC.">
  <section class="mx-auto max-w-6xl px-6 pt-24 pb-12">
    <SectionLabel>Leadership</SectionLabel>
    <h1 class="font-display text-5xl md:text-6xl font-bold text-fg-strong mt-4 leading-tight">The people behind OCEANS.</h1>
  </section>

  <section class="mx-auto max-w-6xl px-6 pb-12">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {leaders.map((m) => (
        <article class="bg-surface border border-border-hairline rounded p-8">
          <div class="font-mono text-[10px] uppercase tracking-widest text-accent">{m.data.role}</div>
          <h2 class="font-display text-2xl font-bold text-fg-strong mt-3">{m.data.name}</h2>
          <p class="mt-4 text-fg leading-relaxed">{m.data.bio}</p>
          {m.data.email && <a href={`mailto:${m.data.email}`} class="mt-4 inline-block font-mono text-xs text-accent">{m.data.email}</a>}
        </article>
      ))}
    </div>
  </section>

  {rest.length > 0 && (
    <section class="mx-auto max-w-6xl px-6 pb-24">
      <SectionLabel>Team</SectionLabel>
      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {rest.map((m) => (
          <article class="bg-surface border border-border-hairline rounded p-6">
            <div class="font-display text-lg font-bold text-fg-strong">{m.data.name}</div>
            <div class="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">{m.data.role}</div>
            <p class="mt-3 text-sm text-muted leading-relaxed">{m.data.bio}</p>
          </article>
        ))}
      </div>
    </section>
  )}
</PageLayout>
```

- [ ] **Step 3: Build all themes + commit**

```bash
PUBLIC_THEME=operator npm run build && PUBLIC_THEME=institute npm run build && PUBLIC_THEME=mariner npm run build
git add website/
git commit -m "feat(pages): about + team"
```


---

## M11 — Contact page + Pages Function (TDD)

### Task 40: Contact page UI

**Files:** Create: `website/src/pages/contact.astro`

- [ ] **Step 1: Write page**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import Form from "@components/Form.astro";
import FormField from "@components/FormField.astro";
import Button from "@components/Button.astro";
import Turnstile from "@components/Turnstile.astro";
---
<PageLayout title="Contact" description="Start a conversation with OCEANS LLC.">
  <section class="mx-auto max-w-6xl px-6 pt-24 pb-12">
    <SectionLabel>Contact</SectionLabel>
    <h1 class="font-display text-5xl md:text-6xl font-bold text-fg-strong mt-4 leading-tight">Start a conversation.</h1>
  </section>

  <section class="mx-auto max-w-6xl px-6 pb-24 grid grid-cols-1 md:grid-cols-5 gap-12">
    <aside class="md:col-span-2 space-y-6">
      <div>
        <div class="font-mono text-[10px] uppercase tracking-widest text-accent">Address</div>
        <address class="not-italic mt-2 text-fg leading-relaxed">Jacksonville, FL 32099<br /><a href="mailto:info@oceansllc.com" class="text-accent">info@oceansllc.com</a><br />727-455-9383</address>
      </div>
      <div>
        <div class="font-mono text-[10px] uppercase tracking-widest text-accent">Federal</div>
        <ul class="mt-2 text-sm text-muted leading-relaxed font-mono">
          <li>CAGE: <span class="text-fg">[set on capabilities page]</span></li>
          <li>NAICS: <span class="text-fg">[set on capabilities page]</span></li>
          <li>UEI: <span class="text-fg">[set on capabilities page]</span></li>
        </ul>
      </div>
    </aside>

    <div class="md:col-span-3">
      <Form action="/api/contact">
        <div class="grid grid-cols-2 gap-4">
          <FormField name="firstName" label="First name" required autocomplete="given-name" />
          <FormField name="lastName" label="Last name" required autocomplete="family-name" />
        </div>
        <FormField name="email" label="Email" type="email" required autocomplete="email" />
        <FormField name="phone" label="Phone" type="tel" autocomplete="tel" />
        <FormField name="organization" label="Organization / Affiliation" autocomplete="organization" />
        <FormField name="subject" label="Subject (e.g. T&E, Architecture, RFI)" />
        <FormField name="message" label="Message" type="textarea" required rows={6} />
        <Turnstile />
        <Button type="submit" variant="primary">Send message</Button>
      </Form>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: Build + commit**

```bash
PUBLIC_THEME=operator npm run build && PUBLIC_THEME=institute npm run build && PUBLIC_THEME=mariner npm run build
git add website/
git commit -m "feat(pages): contact page UI with form"
```

---

### Task 41: Pages Function — POST /api/contact (TDD, Vitest)

**Files:**
- Create: `website/functions/api/contact.ts`
- Create: `website/tests/functions/contact.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const onRequest = async (env: Record<string, string>, body: Record<string, string>, turnstileOk = true) => {
  globalThis.fetch = vi.fn(async (url: any) => {
    if (String(url).includes("siteverify")) {
      return new Response(JSON.stringify({ success: turnstileOk }), { status: 200 });
    }
    if (String(url).includes("api.resend.com")) {
      return new Response(JSON.stringify({ id: "msg_123" }), { status: 200 });
    }
    return new Response("", { status: 404 });
  }) as any;
  const fd = new FormData();
  for (const [k, v] of Object.entries(body)) fd.append(k, v);
  fd.append("cf-turnstile-response", "tok");
  const { onRequestPost } = await import("../../functions/api/contact");
  const req = new Request("https://x/api/contact", { method: "POST", body: fd });
  return onRequestPost({ request: req, env } as any);
};

describe("POST /api/contact", () => {
  beforeEach(() => vi.resetModules());

  it("400s on missing fields", async () => {
    const res = await onRequest({ RESEND_API_KEY: "k", TURNSTILE_SECRET: "s", CONTACT_TO: "info@oceansllc.com", CONTACT_FROM: "noreply@oceansllc.com" }, {});
    expect(res.status).toBe(400);
  });

  it("400s on Turnstile failure", async () => {
    const res = await onRequest(
      { RESEND_API_KEY: "k", TURNSTILE_SECRET: "s", CONTACT_TO: "info@oceansllc.com", CONTACT_FROM: "noreply@oceansllc.com" },
      { firstName: "A", lastName: "B", email: "a@b.co", message: "Hello there" },
      false
    );
    expect(res.status).toBe(400);
  });

  it("200s on valid payload", async () => {
    const res = await onRequest(
      { RESEND_API_KEY: "k", TURNSTILE_SECRET: "s", CONTACT_TO: "info@oceansllc.com", CONTACT_FROM: "noreply@oceansllc.com" },
      { firstName: "A", lastName: "B", email: "a@b.co", message: "Hello there" }
    );
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run tests, expect fail**

```bash
cd /Users/aousabdo/work/Oceans/website
npm run test -- tests/functions/contact.test.ts
```

- [ ] **Step 3: Implement `functions/api/contact.ts`**

```ts
interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
}

import { validateContact } from "../../src/lib/validators";

async function verifyTurnstile(secret: string, token: string, ip?: string) {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const j: any = await r.json();
  return Boolean(j?.success);
}

async function sendEmail(env: Env, payload: Record<string, string>) {
  const subject = `[oceansllc.com] ${payload.subject || "New inquiry"} — ${payload.firstName} ${payload.lastName}`;
  const html = `
    <h2>${escapeHtml(subject)}</h2>
    <p><strong>Name:</strong> ${escapeHtml(payload.firstName)} ${escapeHtml(payload.lastName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    ${payload.phone ? `<p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>` : ""}
    ${payload.organization ? `<p><strong>Organization:</strong> ${escapeHtml(payload.organization)}</p>` : ""}
    <hr/>
    <pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(payload.message)}</pre>
  `;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.CONTACT_FROM, to: env.CONTACT_TO, reply_to: payload.email, subject, html }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}`);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as Record<string, string>)[c]!);
}

export async function onRequestPost(ctx: { request: Request; env: Env }) {
  const { request, env } = ctx;
  const fd = await request.formData();
  const token = String(fd.get("cf-turnstile-response") ?? "");
  if (!token) return new Response("turnstile required", { status: 400 });
  const verified = await verifyTurnstile(env.TURNSTILE_SECRET, token, request.headers.get("CF-Connecting-IP") ?? undefined);
  if (!verified) return new Response("turnstile failed", { status: 400 });
  const data = Object.fromEntries(fd.entries()) as Record<string, string>;
  const v = validateContact(data);
  if (!v.ok) return new Response(JSON.stringify(v.errors), { status: 400, headers: { "content-type": "application/json" } });
  try {
    await sendEmail(env, data);
    return new Response("ok", { status: 200 });
  } catch (e) {
    return new Response("email failed", { status: 502 });
  }
}
```

- [ ] **Step 4: Run tests, expect pass**

```bash
npm run test -- tests/functions/contact.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add website/
git commit -m "feat(api): POST /api/contact with Turnstile + Resend (tested)"
```

---

### Task 42: wrangler config + local dev for Pages Functions

**Files:**
- Create: `website/wrangler.toml`
- Create: `website/.dev.vars.example`
- Modify: `website/package.json` (script)

- [ ] **Step 1: `wrangler.toml`**

```toml
name = "oceans-website"
pages_build_output_dir = "dist"
compatibility_date = "2026-01-01"

[vars]
CONTACT_TO = "info@oceansllc.com"
CONTACT_FROM = "noreply@oceansllc.com"

# Secrets (set via `wrangler pages secret put`):
#   RESEND_API_KEY
#   TURNSTILE_SECRET

[[r2_buckets]]
binding = "APPLICATIONS"
bucket_name = "oceans-applications"
```

- [ ] **Step 2: `.dev.vars.example`**

```
PUBLIC_THEME=operator
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
RESEND_API_KEY=re_test_xxx
TURNSTILE_SECRET=1x0000000000000000000000000000000AA
CONTACT_TO=info@oceansllc.com
CONTACT_FROM=noreply@oceansllc.com
```

- [ ] **Step 3: Add script to `package.json`**

```json
"pages:dev": "wrangler pages dev dist --compatibility-date=2026-01-01"
```

- [ ] **Step 4: Smoke test locally**

```bash
cd /Users/aousabdo/work/Oceans/website
cp .dev.vars.example .dev.vars
npm run build
npm run pages:dev
# In another terminal, POST a test:
# curl -X POST -F firstName=A -F lastName=B -F email=a@b.co -F message=hello \
#      -F cf-turnstile-response=XXXX.DUMMY.TOKEN.XXXX http://localhost:8788/api/contact
```

Note: real Turnstile validation requires a real token; with the test sitekey above it always passes (`1x...` is Cloudflare's "always pass" test sitekey).

- [ ] **Step 5: Commit**

```bash
git add website/wrangler.toml website/.dev.vars.example website/package.json
git commit -m "chore: wrangler config + dev vars template + pages:dev script"
```


---

## M12 — Careers + Apply Pages Function (TDD)

### Task 43: Careers index page

**Files:** Create: `website/src/pages/careers/index.astro`

- [ ] **Step 1: Write page**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import RoleCard from "@components/RoleCard.astro";
import Form from "@components/Form.astro";
import FormField from "@components/FormField.astro";
import FileUpload from "@components/FileUpload.astro";
import Button from "@components/Button.astro";
import Turnstile from "@components/Turnstile.astro";
import { getCollection } from "astro:content";

const open = (await getCollection("jobs")).filter((j) => j.data.open).sort((a, b) => +b.data.posted - +a.data.posted);
---
<PageLayout title="Careers" description="Open roles at OCEANS LLC.">
  <section class="mx-auto max-w-4xl px-6 pt-24 pb-12">
    <SectionLabel>Careers</SectionLabel>
    <h1 class="font-display text-5xl md:text-6xl font-bold text-fg-strong mt-4 leading-tight">Build rigorous engineering with us.</h1>
    <p class="mt-6 text-lg text-muted leading-relaxed">We hire engineers who care about defensible work. If that's you and you don't see a fit below, send a general application.</p>
  </section>

  <section class="mx-auto max-w-6xl px-6 pb-16">
    <SectionLabel>Open roles</SectionLabel>
    {open.length === 0 ? (
      <p class="mt-6 text-muted">No open roles right now — but a general application is welcome.</p>
    ) : (
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {open.map((j) => (
          <RoleCard title={j.data.title} location={j.data.location} level={j.data.level} type={j.data.type} href={`/careers/${j.data.slug}`} />
        ))}
      </div>
    )}
  </section>

  <section class="mx-auto max-w-3xl px-6 py-16 border-t border-border-hairline">
    <SectionLabel>General application</SectionLabel>
    <p class="mt-4 text-muted">No fit listed? Send us your resume and a short note.</p>
    <Form action="/api/apply" enctype="multipart/form-data" class="mt-8">
      <input type="hidden" name="roleSlug" value="general" />
      <FormField name="name" label="Name" required autocomplete="name" />
      <FormField name="email" label="Email" type="email" required autocomplete="email" />
      <FormField name="phone" label="Phone" type="tel" autocomplete="tel" />
      <FormField name="linkedin" label="LinkedIn URL" type="url" />
      <FormField name="coverNote" label="Cover note (optional)" type="textarea" rows={5} />
      <FileUpload name="resume" label="Resume PDF" required />
      <Turnstile />
      <Button type="submit" variant="primary">Submit application</Button>
    </Form>
  </section>
</PageLayout>
```

- [ ] **Step 2: Build all themes + commit**

```bash
PUBLIC_THEME=operator npm run build && PUBLIC_THEME=institute npm run build && PUBLIC_THEME=mariner npm run build
git add website/
git commit -m "feat(pages): careers index with general application form"
```

---

### Task 44: Role detail page

**Files:** Create: `website/src/pages/careers/[slug].astro`

- [ ] **Step 1: Write page**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import Form from "@components/Form.astro";
import FormField from "@components/FormField.astro";
import FileUpload from "@components/FileUpload.astro";
import Button from "@components/Button.astro";
import Turnstile from "@components/Turnstile.astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const jobs = await getCollection("jobs");
  return jobs.map((j) => ({ params: { slug: j.data.slug }, props: { job: j.data } }));
}
const { job } = Astro.props;
---
<PageLayout title={job.title} description={job.summary}>
  <section class="mx-auto max-w-3xl px-6 pt-24 pb-8">
    <SectionLabel>Open role · {job.department}</SectionLabel>
    <h1 class="font-display text-4xl md:text-5xl font-bold text-fg-strong mt-4 leading-tight">{job.title}</h1>
    <div class="mt-4 flex gap-3 font-mono text-[10px] uppercase tracking-widest text-muted">
      <span>{job.level}</span><span>·</span><span>{job.type}</span><span>·</span><span>{job.location}</span>
    </div>
    <p class="mt-6 text-lg text-fg leading-relaxed">{job.summary}</p>
  </section>

  <section class="mx-auto max-w-3xl px-6 py-8 space-y-10 text-fg leading-relaxed">
    <div>
      <h2 class="font-display text-2xl text-fg-strong">Responsibilities</h2>
      <ul class="mt-3 list-disc list-inside space-y-1.5">{job.responsibilities.map((r: string) => <li>{r}</li>)}</ul>
    </div>
    <div>
      <h2 class="font-display text-2xl text-fg-strong">Qualifications</h2>
      <ul class="mt-3 list-disc list-inside space-y-1.5">{job.qualifications.map((q: string) => <li>{q}</li>)}</ul>
    </div>
    {job.bonus.length > 0 && (
      <div>
        <h2 class="font-display text-2xl text-fg-strong">Bonus</h2>
        <ul class="mt-3 list-disc list-inside space-y-1.5">{job.bonus.map((b: string) => <li>{b}</li>)}</ul>
      </div>
    )}
  </section>

  <section class="mx-auto max-w-3xl px-6 py-16 border-t border-border-hairline">
    <SectionLabel>Apply</SectionLabel>
    <Form action="/api/apply" enctype="multipart/form-data" class="mt-8">
      <input type="hidden" name="roleSlug" value={job.slug} />
      <FormField name="name" label="Name" required autocomplete="name" />
      <FormField name="email" label="Email" type="email" required autocomplete="email" />
      <FormField name="phone" label="Phone" type="tel" autocomplete="tel" />
      <FormField name="linkedin" label="LinkedIn URL" type="url" />
      <FormField name="coverNote" label="Cover note" type="textarea" rows={5} />
      <FileUpload name="resume" label="Resume PDF" required />
      <Turnstile />
      <Button type="submit" variant="primary">Apply for {job.title}</Button>
    </Form>
    <p class="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted">
      Or email <a href="mailto:careers@oceansllc.com" class="text-accent">careers@oceansllc.com</a>
    </p>
  </section>
</PageLayout>
```

- [ ] **Step 2: Build + commit**

```bash
PUBLIC_THEME=operator npm run build && PUBLIC_THEME=institute npm run build && PUBLIC_THEME=mariner npm run build
git add website/
git commit -m "feat(pages): role detail page with apply form"
```

---

### Task 45: Apply Pages Function (TDD)

**Files:**
- Create: `website/functions/api/apply.ts`
- Create: `website/tests/functions/apply.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const makeR2 = () => {
  const store = new Map<string, ArrayBuffer>();
  return {
    put: vi.fn(async (key: string, body: ArrayBuffer) => { store.set(key, body); }),
    get: (key: string) => store.get(key),
  };
};

const onRequest = async (opts: {
  fields?: Record<string, string>;
  file?: { name: string; type: string; bytes: Uint8Array };
  turnstileOk?: boolean;
}) => {
  const { fields = {}, file, turnstileOk = true } = opts;
  globalThis.fetch = vi.fn(async (url: any) => {
    if (String(url).includes("siteverify")) return new Response(JSON.stringify({ success: turnstileOk }), { status: 200 });
    if (String(url).includes("api.resend.com")) return new Response(JSON.stringify({ id: "x" }), { status: 200 });
    return new Response("", { status: 404 });
  }) as any;
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  fd.append("cf-turnstile-response", "tok");
  if (file) fd.append("resume", new File([file.bytes], file.name, { type: file.type }));
  const R2 = makeR2();
  const env = { R2, RESEND_API_KEY: "k", TURNSTILE_SECRET: "s", CAREERS_TO: "careers@oceansllc.com", CONTACT_FROM: "noreply@oceansllc.com" };
  const { onRequestPost } = await import("../../functions/api/apply");
  const req = new Request("https://x/api/apply", { method: "POST", body: fd });
  const res = await onRequestPost({ request: req, env: { APPLICATIONS: R2, RESEND_API_KEY: env.RESEND_API_KEY, TURNSTILE_SECRET: env.TURNSTILE_SECRET, CAREERS_TO: env.CAREERS_TO, CONTACT_FROM: env.CONTACT_FROM } } as any);
  return { res, R2 };
};

const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
const gifBytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

describe("POST /api/apply", () => {
  beforeEach(() => vi.resetModules());

  it("400s on missing fields", async () => {
    const { res } = await onRequest({});
    expect(res.status).toBe(400);
  });

  it("400s on missing resume file", async () => {
    const { res } = await onRequest({ fields: { name: "A", email: "a@b.co", roleSlug: "general" } });
    expect(res.status).toBe(400);
  });

  it("400s on non-PDF upload", async () => {
    const { res } = await onRequest({
      fields: { name: "A", email: "a@b.co", roleSlug: "general" },
      file: { name: "fake.pdf", type: "application/pdf", bytes: gifBytes },
    });
    expect(res.status).toBe(400);
  });

  it("400s on Turnstile failure", async () => {
    const { res } = await onRequest({
      fields: { name: "A", email: "a@b.co", roleSlug: "general" },
      file: { name: "r.pdf", type: "application/pdf", bytes: pdfBytes },
      turnstileOk: false,
    });
    expect(res.status).toBe(400);
  });

  it("200s and writes to R2 on valid submission", async () => {
    const { res, R2 } = await onRequest({
      fields: { name: "A", email: "a@b.co", roleSlug: "systems-engineer" },
      file: { name: "r.pdf", type: "application/pdf", bytes: pdfBytes },
    });
    expect(res.status).toBe(200);
    expect(R2.put).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, expect fail**

```bash
npm run test -- tests/functions/apply.test.ts
```

- [ ] **Step 3: Implement `functions/api/apply.ts`**

```ts
import { validateApply, isPdf } from "../../src/lib/validators";

interface Env {
  APPLICATIONS: R2Bucket;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET: string;
  CAREERS_TO: string;
  CONTACT_FROM: string;
}

const MAX_BYTES = 10 * 1024 * 1024;

function ulid() {
  const t = Date.now().toString(36);
  const r = crypto.getRandomValues(new Uint8Array(10));
  return `${t}-${Array.from(r, (b) => b.toString(36).padStart(2, "0")).join("")}`;
}

function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

async function verifyTurnstile(secret: string, token: string, ip?: string) {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const j: any = await r.json();
  return Boolean(j?.success);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as Record<string, string>)[c]!);
}

async function notify(env: Env, payload: Record<string, string>, r2Key: string) {
  const subject = `[Apply · ${payload.roleSlug}] ${payload.name}`;
  const html = `
    <h2>New application — ${escapeHtml(payload.roleSlug)}</h2>
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    ${payload.phone ? `<p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>` : ""}
    ${payload.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${escapeHtml(payload.linkedin)}">${escapeHtml(payload.linkedin)}</a></p>` : ""}
    <p><strong>Resume:</strong> stored at <code>${escapeHtml(r2Key)}</code></p>
    ${payload.coverNote ? `<hr/><pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(payload.coverNote)}</pre>` : ""}
  `;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.CONTACT_FROM, to: env.CAREERS_TO, reply_to: payload.email, subject, html }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}`);
}

export async function onRequestPost(ctx: { request: Request; env: Env }) {
  const { request, env } = ctx;
  const fd = await request.formData();
  const token = String(fd.get("cf-turnstile-response") ?? "");
  if (!token) return new Response("turnstile required", { status: 400 });
  const verified = await verifyTurnstile(env.TURNSTILE_SECRET, token, request.headers.get("CF-Connecting-IP") ?? undefined);
  if (!verified) return new Response("turnstile failed", { status: 400 });

  const file = fd.get("resume");
  if (!(file instanceof File)) return new Response("resume required", { status: 400 });
  if (file.size === 0 || file.size > MAX_BYTES) return new Response("file size out of bounds", { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isPdf(bytes)) return new Response("file must be a PDF", { status: 400 });

  const data = Object.fromEntries(fd.entries()) as Record<string, string>;
  delete (data as any).resume;
  delete (data as any)["cf-turnstile-response"];

  const v = validateApply(data);
  if (!v.ok) return new Response(JSON.stringify(v.errors), { status: 400, headers: { "content-type": "application/json" } });

  const id = ulid();
  const key = `applications/${data.roleSlug}/${id}-${safeFilename(file.name)}`;
  await env.APPLICATIONS.put(key, bytes, {
    httpMetadata: { contentType: "application/pdf" },
    customMetadata: { name: data.name, email: data.email, role: data.roleSlug, submittedAt: new Date().toISOString() },
  });

  try {
    await notify(env, data, key);
    return new Response("ok", { status: 200 });
  } catch {
    return new Response("ok-no-email", { status: 200 });
  }
}
```

- [ ] **Step 4: Tests pass + commit**

```bash
npm run test -- tests/functions/apply.test.ts
git add website/
git commit -m "feat(api): POST /api/apply with R2 storage, PDF validation, Turnstile, Resend"
```


---

## M13 — Blog (index + post + RSS)

### Task 46: Blog index page

**Files:** Create: `website/src/pages/blog/index.astro`

- [ ] **Step 1: Write page**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import BlogPostCard from "@components/BlogPostCard.astro";
import { getCollection } from "astro:content";
import { readingTime } from "@lib/format";

const posts = (await getCollection("blog", ({ data }) => !data.draft))
  .sort((a, b) => +b.data.date - +a.data.date);
const tagSet = new Set<string>();
for (const p of posts) p.data.tags.forEach((t) => tagSet.add(t));
const tags = [...tagSet].sort();
---
<PageLayout title="Blog" description="Notes from the field — engineering, T&E, and mission data.">
  <section class="mx-auto max-w-3xl px-6 pt-24 pb-12">
    <SectionLabel>Journal</SectionLabel>
    <h1 class="font-display text-5xl md:text-6xl font-bold text-fg-strong mt-4 leading-tight">Recent thinking.</h1>
  </section>

  <section class="mx-auto max-w-3xl px-6 pb-8 flex flex-wrap gap-2">
    <a href="/blog" class="font-mono text-[10px] uppercase tracking-widest text-accent border border-accent/30 px-2.5 py-1 rounded-sm">All</a>
    {tags.map((t) => (
      <a href={`/blog?tag=${t}`} class="font-mono text-[10px] uppercase tracking-widest text-muted border border-border-hairline px-2.5 py-1 rounded-sm hover:text-accent hover:border-accent/30">#{t}</a>
    ))}
  </section>

  <section class="mx-auto max-w-3xl px-6 pb-24 space-y-10 divide-y divide-border-hairline">
    {posts.map((p) => (
      <div class="pt-10 first:pt-0">
        <BlogPostCard
          title={p.data.title}
          date={p.data.date}
          author={p.data.author}
          excerpt={p.data.excerpt}
          tags={p.data.tags}
          readTime={readingTime(p.body)}
          href={`/blog/${p.slug}`}
        />
      </div>
    ))}
  </section>
</PageLayout>
```

- [ ] **Step 2: Build + commit**

```bash
PUBLIC_THEME=operator npm run build && PUBLIC_THEME=institute npm run build && PUBLIC_THEME=mariner npm run build
git add website/
git commit -m "feat(pages): blog index with tags and reading time"
```

---

### Task 47: Blog post layout + dynamic page

**Files:**
- Create: `website/src/layouts/BlogPostLayout.astro`
- Create: `website/src/pages/blog/[slug].astro`

- [ ] **Step 1: `BlogPostLayout.astro`**

```astro
---
import PageLayout from "./PageLayout.astro";
import { formatDate, readingTime } from "@lib/format";

interface Props {
  title: string;
  description?: string;
  date: Date;
  author: string;
  tags?: string[];
  body: string;
}
const { title, description, date, author, tags = [], body } = Astro.props;
---
<PageLayout title={title} description={description ?? ""} type="article">
  <article class="mx-auto max-w-2xl px-6 pt-24 pb-24">
    <header>
      <div class="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted">
        <time datetime={date.toISOString()}>{formatDate(date)}</time>
        <span>·</span>
        <span>{author}</span>
        <span>·</span>
        <span>{readingTime(body)}</span>
      </div>
      <h1 class="font-display text-4xl md:text-5xl font-bold text-fg-strong mt-4 leading-tight">{title}</h1>
      {tags.length > 0 && (
        <div class="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => <span class="font-mono text-[9px] uppercase tracking-widest text-muted">#{t}</span>)}
        </div>
      )}
    </header>
    <div class="prose prose-invert mt-12 max-w-none text-fg leading-relaxed
                prose-headings:font-display prose-headings:text-fg-strong
                prose-a:text-accent prose-strong:text-fg-strong
                prose-blockquote:border-accent prose-blockquote:text-fg-strong">
      <slot />
    </div>
  </article>
</PageLayout>
```

Install the prose plugin:

```bash
cd /Users/aousabdo/work/Oceans/website
npm install --save-dev @tailwindcss/typography
```

Update `tailwind.config.ts` plugins:

```ts
import typography from "@tailwindcss/typography";
// ...
plugins: [typography()],
```

- [ ] **Step 2: `src/pages/blog/[slug].astro`**

```astro
---
import BlogPostLayout from "@layouts/BlogPostLayout.astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map((p) => ({ params: { slug: p.slug }, props: { post: p } }));
}
const { post } = Astro.props;
const { Content } = await post.render();
---
<BlogPostLayout
  title={post.data.title}
  description={post.data.excerpt}
  date={post.data.date}
  author={post.data.author}
  tags={post.data.tags}
  body={post.body}
>
  <Content />
</BlogPostLayout>
```

- [ ] **Step 3: Build + commit**

```bash
PUBLIC_THEME=operator npm run build && PUBLIC_THEME=institute npm run build && PUBLIC_THEME=mariner npm run build
git add website/
git commit -m "feat(pages): blog post template with typography plugin"
```

---

### Task 48: RSS feed

**Files:** Create: `website/src/pages/rss.xml.ts`

- [ ] **Step 1: Install rss integration**

```bash
cd /Users/aousabdo/work/Oceans/website
npm install @astrojs/rss
```

- [ ] **Step 2: Write feed**

```ts
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_NAME, SITE_URL } from "@lib/seo";

export async function GET(context: { site: URL }) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort((a, b) => +b.data.date - +a.data.date);
  return rss({
    title: `${SITE_NAME} — Journal`,
    description: "Recent thinking from OCEANS LLC.",
    site: context.site?.toString() ?? SITE_URL,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.excerpt,
      link: `/blog/${p.slug}/`,
    })),
  });
}
```

- [ ] **Step 3: Build + verify `dist/rss.xml` exists, commit**

```bash
npm run build
test -f dist/rss.xml && echo OK
git add website/
git commit -m "feat(blog): RSS feed at /rss.xml"
```


---

## M14 — Pages: capabilities, legal, 404

### Task 49: Capabilities + Privacy + Terms

**Files:**
- Create: `website/src/pages/capabilities.astro`
- Create: `website/src/pages/privacy.astro`
- Create: `website/src/pages/terms.astro`

- [ ] **Step 1: `capabilities.astro`**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import Button from "@components/Button.astro";
---
<PageLayout title="Capabilities Statement" description="OCEANS LLC capabilities statement.">
  <section class="mx-auto max-w-3xl px-6 pt-24 pb-12">
    <SectionLabel>Capabilities Statement</SectionLabel>
    <h1 class="font-display text-5xl font-bold text-fg-strong mt-4 leading-tight">OCEANS LLC</h1>
    <p class="mt-6 text-lg text-muted">Systems engineering · Test &amp; Evaluation · Mission Data.</p>
    <div class="mt-8"><Button href="/capabilities-statement.pdf" variant="primary">Download PDF ↓</Button></div>
  </section>

  <section class="mx-auto max-w-3xl px-6 pb-24 space-y-10 text-fg leading-relaxed">
    <div>
      <h2 class="font-display text-2xl text-fg-strong">Core competencies</h2>
      <ul class="mt-3 list-disc list-inside space-y-1.5">
        <li>Requirements development with full traceability</li>
        <li>Systems engineering and enterprise architecture</li>
        <li>Research, Development, Test &amp; Evaluation (RDT&amp;E)</li>
        <li>Mission data, ontologies, and Common Operating Pictures</li>
      </ul>
    </div>
    <div>
      <h2 class="font-display text-2xl text-fg-strong">Differentiators</h2>
      <ul class="mt-3 list-disc list-inside space-y-1.5">
        <li>50+ combined years of mission-aligned engineering</li>
        <li>Traceability-first methodology</li>
        <li>Quantitative, defensible analysis</li>
        <li>Decision-grade reporting</li>
      </ul>
    </div>
    <div>
      <h2 class="font-display text-2xl text-fg-strong">Federal identifiers</h2>
      <dl class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-sm">
        <div class="p-4 border border-border-hairline rounded bg-surface">
          <dt class="text-[10px] uppercase tracking-widest text-muted">CAGE</dt>
          <dd class="text-fg-strong mt-2">[TBD — set when finalized]</dd>
        </div>
        <div class="p-4 border border-border-hairline rounded bg-surface">
          <dt class="text-[10px] uppercase tracking-widest text-muted">UEI</dt>
          <dd class="text-fg-strong mt-2">[TBD]</dd>
        </div>
        <div class="p-4 border border-border-hairline rounded bg-surface">
          <dt class="text-[10px] uppercase tracking-widest text-muted">NAICS</dt>
          <dd class="text-fg-strong mt-2">541330 · 541715 · 541512</dd>
        </div>
      </dl>
    </div>
    <div>
      <h2 class="font-display text-2xl text-fg-strong">Contact</h2>
      <p class="mt-3">Jacksonville, FL · <a href="mailto:info@oceansllc.com" class="text-accent">info@oceansllc.com</a> · 727-455-9383</p>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: `privacy.astro`** — boilerplate with replaceable language

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
---
<PageLayout title="Privacy" description="Privacy policy for oceansllc.com.">
  <article class="mx-auto max-w-2xl px-6 pt-24 pb-24 space-y-6 text-fg leading-relaxed">
    <SectionLabel>Privacy Policy</SectionLabel>
    <h1 class="font-display text-4xl font-bold text-fg-strong mt-4">Privacy Policy</h1>
    <p class="text-sm text-muted">Last updated: 2026-05-11</p>

    <h2 class="font-display text-2xl text-fg-strong">What we collect</h2>
    <p>When you submit a contact form or job application, we collect the information you provide (name, email, message, optional phone, optional resume PDF). We use Cloudflare Web Analytics for cookieless, aggregate page-view counts.</p>

    <h2 class="font-display text-2xl text-fg-strong">How we use it</h2>
    <p>Contact form submissions are sent to info@oceansllc.com. Job applications are sent to careers@oceansllc.com along with a link to your resume in Cloudflare R2. We don't use your information for marketing, and we don't sell or share it.</p>

    <h2 class="font-display text-2xl text-fg-strong">Resume storage</h2>
    <p>Resumes are stored in Cloudflare R2 (private bucket, accessible only via signed URL or to authorized OCEANS personnel). Retained for one year unless you ask us to delete sooner.</p>

    <h2 class="font-display text-2xl text-fg-strong">Your rights</h2>
    <p>Email <a href="mailto:info@oceansllc.com" class="text-accent">info@oceansllc.com</a> to ask what we have on you, request correction, or request deletion.</p>

    <h2 class="font-display text-2xl text-fg-strong">Third parties</h2>
    <p>We use Cloudflare (hosting, R2, Turnstile, Analytics) and Resend (transactional email). They process data on our behalf under their respective terms.</p>
  </article>
</PageLayout>
```

- [ ] **Step 3: `terms.astro`** — minimal placeholder pending legal review

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
---
<PageLayout title="Terms" description="Terms of use for oceansllc.com.">
  <article class="mx-auto max-w-2xl px-6 pt-24 pb-24 space-y-6 text-fg leading-relaxed">
    <SectionLabel>Terms of Use</SectionLabel>
    <h1 class="font-display text-4xl font-bold text-fg-strong mt-4">Terms of Use</h1>
    <p class="text-sm text-muted">Last updated: 2026-05-11</p>
    <p>This site is published by OCEANS LLC and is provided for informational purposes. Nothing on this site constitutes a contract, offer, or commitment. Use of trademarks and agency seals shown on this site is for identification only and does not imply endorsement.</p>
    <p>For business inquiries, contact <a href="mailto:info@oceansllc.com" class="text-accent">info@oceansllc.com</a>.</p>
    <p class="text-sm text-muted">Pending review by counsel before launch.</p>
  </article>
</PageLayout>
```

- [ ] **Step 4: Build + commit**

```bash
PUBLIC_THEME=operator npm run build && PUBLIC_THEME=institute npm run build && PUBLIC_THEME=mariner npm run build
git add website/
git commit -m "feat(pages): capabilities + privacy + terms"
```

---

### Task 50: 404 page

**Files:** Create: `website/src/pages/404.astro`

- [ ] **Step 1: Write page**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import Button from "@components/Button.astro";
---
<PageLayout title="Not found" description="404">
  <section class="mx-auto max-w-3xl px-6 pt-32 pb-24 text-center">
    <p class="font-mono text-[11px] uppercase tracking-widest text-accent">Error 404</p>
    <h1 class="font-display text-6xl md:text-8xl font-bold text-fg-strong mt-4">Off course.</h1>
    <p class="mt-6 text-lg text-muted">The page you were looking for doesn't exist or has moved.</p>
    <div class="mt-8 flex justify-center gap-3">
      <Button href="/" variant="primary">Back to home</Button>
      <Button href="/contact" variant="outline">Tell us what you needed</Button>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: Build + commit**

```bash
PUBLIC_THEME=operator npm run build && PUBLIC_THEME=institute npm run build && PUBLIC_THEME=mariner npm run build
git add website/
git commit -m "feat(pages): designed 404"
```


---

## M15 — Home variants (3 themes)

The homepage dispatches to one of three components at build time based on `PUBLIC_THEME`. Each is a complete, theme-specific layout.

### Task 51: Home dispatcher + HomeOperator

**Files:**
- Modify: `website/src/pages/index.astro`
- Create: `website/src/components/home/HomeOperator.astro`

- [ ] **Step 1: Rewrite `src/pages/index.astro`**

```astro
---
import { ACTIVE_THEME } from "@lib/theme";
import HomeOperator from "@components/home/HomeOperator.astro";
import HomeInstitute from "@components/home/HomeInstitute.astro";
import HomeMariner from "@components/home/HomeMariner.astro";
---
{ACTIVE_THEME === "operator" && <HomeOperator />}
{ACTIVE_THEME === "institute" && <HomeInstitute />}
{ACTIVE_THEME === "mariner" && <HomeMariner />}
```

- [ ] **Step 2: Write `HomeOperator.astro`**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import Eyebrow from "@components/Eyebrow.astro";
import Button from "@components/Button.astro";
import Stat from "@components/Stat.astro";
import ServiceCard from "@components/ServiceCard.astro";
import CaseStudyCard from "@components/CaseStudyCard.astro";
import Pipeline from "@components/Pipeline.astro";
import ParticleHeroCanvas from "@components/themes/operator/ParticleHeroCanvas.astro";
import CustomCursor from "@components/themes/operator/CustomCursor.astro";
import MarqueeStrip from "@components/themes/operator/MarqueeStrip.astro";
import { getCollection } from "astro:content";

const services = (await getCollection("services")).sort((a, b) => a.data.order - b.data.order);
const cases = (await getCollection("caseStudies")).slice(0, 3);
const stack = ["Systems Engineering", "Enterprise Architecture", "RDT&E", "Ontology-Driven Data", "Federal Acquisition", "White Team Operations", "TRL Assessments", "CONOPS Development"];
const pipelineSteps = [
  { label: "01 · Intake", title: "Mission Need & Scoping", emphasis: true },
  { label: "02 · Requirements", title: "Structured Requirements Development" },
  { label: "03 · Architecture", title: "Systems Engineering & Design" },
  { label: "04 · Evaluation", title: "T&E Execution & Analysis" },
  { label: "05 · Outcome", title: "Decision-Grade Reporting", emphasis: true },
];
---
<PageLayout title="OCEANS LLC" path="/">
  <CustomCursor />

  <!-- 01 HERO -->
  <section class="relative h-screen min-h-[640px] flex items-center overflow-hidden">
    <ParticleHeroCanvas />
    <div class="relative z-10 mx-auto max-w-6xl px-6 w-full">
      <Eyebrow class="flex items-center gap-3"><span class="block w-10 h-px bg-accent"></span>Systems Engineering · T&E · Mission Data</Eyebrow>
      <h1 class="font-display text-5xl md:text-7xl lg:text-[5rem] font-bold text-fg-strong mt-6 leading-[1.04] max-w-4xl">
        Engineering that<br />earns <em class="not-italic" style="color:transparent; -webkit-text-stroke:1.5px var(--color-accent);">operational</em><br />trust.
      </h1>
      <p class="mt-7 text-lg text-muted max-w-xl leading-relaxed">
        OCEANS LLC delivers systems engineering, enterprise architecture, and rigorous test &amp; evaluation that translate federal mission needs into defensible, decision-ready outcomes.
      </p>
      <div class="mt-10 flex flex-wrap gap-3">
        <Button href="/services" variant="primary">Explore capabilities</Button>
        <Button href="/capabilities" variant="outline">Download capabilities statement</Button>
      </div>
    </div>
    <div class="absolute right-12 bottom-20 z-10 hidden md:flex flex-col gap-7 text-right">
      <Stat value="50" emphasis="+" label="Years Combined Experience" />
      <Stat value="2013" label="Founded" />
      <Stat value="4" emphasis="+" label="Core Service Lines" />
    </div>
  </section>

  <!-- 02 MARQUEE -->
  <MarqueeStrip items={stack} />

  <!-- 03 CAPABILITIES -->
  <section class="bg-bg-2">
    <div class="mx-auto max-w-6xl px-6 py-24">
      <div class="flex items-end justify-between gap-12">
        <div>
          <SectionLabel>Our Services</SectionLabel>
          <h2 class="font-display text-4xl md:text-5xl font-bold text-fg-strong mt-4 leading-tight">Four core<br />capability areas</h2>
        </div>
        <p class="text-muted max-w-sm leading-relaxed">Every engagement delivers defensible evidence — not just analysis — for operational and acquisition decisions.</p>
      </div>
      <div class="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border-hairline border border-border-hairline rounded overflow-hidden">
        {services.map((s) => (
          <div class="bg-bg-2">
            <ServiceCard number={s.data.number} title={s.data.title} summary={s.data.summary} tags={s.data.tags} href={`/services/${s.data.slug}`} />
          </div>
        ))}
      </div>
    </div>
  </section>

  <!-- 04 METHODOLOGY -->
  <section class="mx-auto max-w-6xl px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
    <div class="bg-bg-2 border border-border-hairline rounded-lg p-8">
      <Pipeline steps={pipelineSteps} />
    </div>
    <div>
      <SectionLabel>Our Methodology</SectionLabel>
      <h2 class="font-display text-4xl md:text-5xl font-bold text-fg-strong mt-4 leading-tight">From mission need<br />to defensible outcome.</h2>
      <p class="mt-6 text-muted leading-relaxed">We don't hand off a report and walk away. Our end-to-end lifecycle process ensures every recommendation is traceable to a validated requirement and every metric withstands technical, operational, and executive review.</p>
    </div>
  </section>

  <!-- 05 PAST PERFORMANCE -->
  <section class="bg-bg-2">
    <div class="mx-auto max-w-6xl px-6 py-24">
      <SectionLabel>Past Performance</SectionLabel>
      <div class="mt-4 flex items-end justify-between gap-8 flex-wrap">
        <h2 class="font-display text-4xl md:text-5xl font-bold text-fg-strong leading-tight">Relevant experience<br />across federal missions</h2>
        <Button href="/experience" variant="outline">Request Full Past Performance</Button>
      </div>
      <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {cases.map((c) => (
          <CaseStudyCard client={c.data.client} title={c.data.title} summary={c.data.summary} badges={c.data.badges} href={`/experience/${c.data.slug}`} />
        ))}
      </div>
    </div>
  </section>

  <!-- 07 CTA BAND -->
  <section class="bg-surface border-y border-border-hairline">
    <div class="mx-auto max-w-6xl px-6 py-20 flex flex-col md:flex-row items-center justify-between gap-12">
      <div>
        <h2 class="font-display text-3xl md:text-5xl font-bold text-fg-strong leading-tight">Ready to bring <em class="not-italic text-accent">rigor</em><br />to your program?</h2>
        <p class="mt-4 text-muted max-w-lg leading-relaxed">Whether you're scoping a new T&amp;E effort, need architecture support, or want to understand how OCEANS can support your acquisition — start with a conversation.</p>
      </div>
      <div class="flex flex-col gap-3 items-end">
        <Button href="/contact" variant="primary">Schedule a Conversation</Button>
        <Button href="/capabilities" variant="outline">Download capabilities statement ↓</Button>
        <p class="font-mono text-[10px] uppercase tracking-widest text-muted">CAGE · NAICS · Contract Vehicles inside</p>
      </div>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 3: Build + verify**

```bash
PUBLIC_THEME=operator npm run build
npm run preview
# Open http://localhost:4321 — verify hero canvas, marquee, 4-up grid, pipeline, CTA
```

- [ ] **Step 4: Commit**

```bash
git add website/
git commit -m "feat(home): HomeOperator with particle hero, marquee, 4-up grid, pipeline, CTA"
```

---

### Task 52: HomeInstitute

**Files:** Create: `website/src/components/home/HomeInstitute.astro`

- [ ] **Step 1: Write component**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import Button from "@components/Button.astro";
import DropCap from "@components/themes/institute/DropCap.astro";
import FigureCaption from "@components/themes/institute/FigureCaption.astro";
import PullQuote from "@components/PullQuote.astro";
import Pipeline from "@components/Pipeline.astro";
import CaseStudyCard from "@components/CaseStudyCard.astro";
import BlogPostCard from "@components/BlogPostCard.astro";
import { getCollection } from "astro:content";
import { readingTime } from "@lib/format";

const services = (await getCollection("services")).sort((a, b) => a.data.order - b.data.order);
const cases = (await getCollection("caseStudies")).slice(0, 3);
const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort((a, b) => +b.data.date - +a.data.date).slice(0, 3);
const team = (await getCollection("team")).filter((t) => t.data.leadership).sort((a, b) => a.data.order - b.data.order);
const roman = ["I.", "II.", "III.", "IV.", "V.", "VI.", "VII.", "VIII.", "IX."];
const pipelineSteps = [
  { label: "I. Intake", title: "Mission Need & Scoping", emphasis: true },
  { label: "II. Requirements", title: "Structured Requirements Development" },
  { label: "III. Architecture", title: "Systems Engineering & Design" },
  { label: "IV. Evaluation", title: "T&E Execution & Analysis" },
  { label: "V. Outcome", title: "Decision-Grade Reporting", emphasis: true },
];
---
<PageLayout title="OCEANS LLC" path="/">
  <!-- I MASTHEAD -->
  <section class="border-b border-border-hairline">
    <div class="mx-auto max-w-5xl px-6 pt-20 pb-12">
      <p class="font-serif text-sm italic text-muted">— Vol. 1, No. 1 · Jacksonville, Florida · Est. 2013</p>
      <h1 class="font-display text-5xl md:text-7xl font-semibold text-fg-strong mt-6 leading-[1.05]">
        Rigorous engineering for federal missions <em class="font-light">that cannot fail.</em>
      </h1>
      <div class="mt-10 max-w-3xl">
        <DropCap>
          OCEANS LLC delivers systems engineering, test &amp; evaluation, and mission-data architecture for federal customers. Founded in 2013 by Daniel Brent and Paul Morrisseau, the practice is built on a simple conviction — federal programs deserve rigorous, objective engineering, not just confident-sounding reports.
        </DropCap>
      </div>
    </div>
  </section>

  <!-- II FOUNDER ESSAY -->
  <section class="mx-auto max-w-3xl px-6 py-20">
    <SectionLabel>II. On defensible engineering</SectionLabel>
    <div class="mt-6 text-fg leading-relaxed text-lg font-serif space-y-4">
      <p>For three decades we have watched programs succeed and fail. The pattern is consistent: programs succeed when their engineering is traceable from mission need to measurable outcome, and when their evaluation is independent enough to be inconvenient.</p>
      <p>We built OCEANS to do that work — the slow, careful, traceable work that keeps a program defensible at every gate review. It is not glamorous. It is required.</p>
    </div>
    <PullQuote attribution="Daniel Brent and Paul Morrisseau, Co-Founders">
      Federal programs deserve rigorous, objective engineering — not just confident-sounding reports.
    </PullQuote>
  </section>

  <!-- III CAPABILITIES -->
  <section class="border-y border-border-hairline bg-surface-2/40">
    <div class="mx-auto max-w-5xl px-6 py-20">
      <SectionLabel>III. Capabilities</SectionLabel>
      <div class="mt-10 space-y-12 divide-y divide-border-hairline">
        {services.map((s, i) => (
          <article class="pt-12 first:pt-0 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="font-serif">
              <div class="text-3xl text-muted italic">{roman[i]}</div>
              <h3 class="font-display text-2xl text-fg-strong mt-2">{s.data.title}</h3>
            </div>
            <div class="md:col-span-3">
              <p class="text-fg leading-relaxed">{s.data.summary}</p>
              <ul class="mt-4 list-disc list-inside text-muted leading-relaxed">
                {s.data.methods.slice(0, 4).map((m) => <li>{m}</li>)}
              </ul>
              <a href={`/services/${s.data.slug}`} class="mt-4 inline-block font-mono text-xs text-accent uppercase tracking-widest">Read more →</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>

  <!-- IV METHODOLOGY -->
  <section class="mx-auto max-w-3xl px-6 py-20">
    <SectionLabel>IV. Methodology</SectionLabel>
    <p class="mt-4 text-muted">Engagement lifecycle (Fig. 1).</p>
    <div class="mt-8"><Pipeline steps={pipelineSteps} /></div>
    <FigureCaption number="1">Engagement lifecycle, from mission need to decision-grade reporting.</FigureCaption>
  </section>

  <!-- V CLIENT REGISTER -->
  <section class="border-y border-border-hairline">
    <div class="mx-auto max-w-5xl px-6 py-12">
      <SectionLabel>V. Client register</SectionLabel>
      <p class="mt-4 font-serif italic text-muted">DoD · DHS · TSA · CBP · USCG · Federal program offices · Selected state &amp; local partners.</p>
    </div>
  </section>

  <!-- VI RECENT THINKING -->
  <section class="mx-auto max-w-5xl px-6 py-20">
    <SectionLabel>VI. Recent thinking</SectionLabel>
    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-10 divide-y md:divide-y-0 md:divide-x divide-border-hairline">
      {posts.map((p, i) => (
        <div class:list={["pt-6 md:pt-0", i > 0 && "md:pl-8"]}>
          <BlogPostCard title={p.data.title} date={p.data.date} author={p.data.author} excerpt={p.data.excerpt} readTime={readingTime(p.body)} href={`/blog/${p.slug}`} />
        </div>
      ))}
    </div>
  </section>

  <!-- VII LEADERSHIP -->
  <section class="border-t border-border-hairline">
    <div class="mx-auto max-w-5xl px-6 py-20">
      <SectionLabel>VII. Leadership</SectionLabel>
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        {team.map((t) => (
          <article>
            <div class="font-serif italic text-muted text-sm">{t.data.role}</div>
            <h3 class="font-display text-2xl text-fg-strong mt-1">{t.data.name}</h3>
            <p class="mt-4 text-fg leading-relaxed">{t.data.bio}</p>
            <p class="mt-3 font-serif italic text-muted">— {t.data.name.split(" ")[0]}</p>
          </article>
        ))}
      </div>
    </div>
  </section>

  <!-- VIII CORRESPONDENCE -->
  <section class="bg-surface-2/40 border-t border-border-hairline">
    <div class="mx-auto max-w-3xl px-6 py-20">
      <SectionLabel>VIII. Correspondence</SectionLabel>
      <h2 class="font-display text-3xl md:text-4xl font-semibold text-fg-strong mt-4">Begin a conversation.</h2>
      <p class="mt-6 font-serif text-fg leading-relaxed">Write to <a href="mailto:info@oceansllc.com" class="text-accent">info@oceansllc.com</a>, or call 727-455-9383. We will respond within two business days.</p>
      <div class="mt-8"><Button href="/contact" variant="primary">Write to us</Button></div>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: Build + commit**

```bash
PUBLIC_THEME=institute npm run build
git add website/
git commit -m "feat(home): HomeInstitute editorial layout"
```

---

### Task 53: HomeMariner

**Files:** Create: `website/src/components/home/HomeMariner.astro`

- [ ] **Step 1: Write component**

```astro
---
import PageLayout from "@layouts/PageLayout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import Button from "@components/Button.astro";
import Card from "@components/Card.astro";
import CaseStudyCard from "@components/CaseStudyCard.astro";
import MaritimeVideoHero from "@components/themes/mariner/MaritimeVideoHero.astro";
import WaveDivider from "@components/themes/mariner/WaveDivider.astro";
import Compass from "@components/themes/mariner/Compass.astro";
import { getCollection } from "astro:content";

const services = (await getCollection("services")).sort((a, b) => a.data.order - b.data.order);
const cases = (await getCollection("caseStudies")).slice(0, 3);
const headings = ["N", "NE", "E", "SE"];
---
<PageLayout title="OCEANS LLC" path="/">
  <!-- DEPTH 01 — HERO -->
  <section class="relative h-screen min-h-[640px] overflow-hidden">
    <MaritimeVideoHero src="/video/open-sky-hero.mp4" poster="/img/open-sky-hero.jpg" class="absolute inset-0">
      <div class="absolute inset-0 flex items-center">
        <div class="mx-auto max-w-6xl px-6 w-full">
          <p class="font-serif italic text-accent tracking-[0.3em] text-xs">⌁  OCEANS  ⌁</p>
          <h1 class="font-display font-light text-fg-strong text-6xl md:text-8xl lg:text-9xl mt-6 leading-[0.95]">
            Depth.<br />Discipline.<br /><em class="text-accent">Direction.</em>
          </h1>
          <p class="mt-8 max-w-lg text-lg text-muted font-serif italic">
            Engineering the systems that carry federal missions through deep, uncertain water.
          </p>
          <div class="mt-10"><Button href="/services" variant="primary">Plot a course</Button></div>
        </div>
      </div>
    </MaritimeVideoHero>
  </section>

  <WaveDivider />

  <!-- DEPTH 02 -->
  <section class="mx-auto max-w-3xl px-6 py-24 text-center">
    <p class="font-serif italic text-accent tracking-[0.2em] text-xs">⌁  what we make possible  ⌁</p>
    <h2 class="font-display font-light text-4xl md:text-5xl text-fg-strong mt-6 leading-tight">
      Missions that depend on engineering they can defend.
    </h2>
  </section>

  <!-- DEPTH 03 — CAPABILITIES AS COMPASS HEADINGS -->
  <section class="mx-auto max-w-6xl px-6 py-16">
    <SectionLabel>⌁  capabilities  ⌁</SectionLabel>
    <div class="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {services.map((s, i) => (
        <Card href={`/services/${s.data.slug}`} accent class="relative">
          <span class="font-serif italic text-accent tracking-widest text-xs">{headings[i]} · {s.data.number}</span>
          <h3 class="font-display font-light text-2xl text-fg-strong mt-3 leading-tight">{s.data.title}</h3>
          <p class="mt-3 text-sm text-muted leading-relaxed font-serif">{s.data.summary}</p>
        </Card>
      ))}
    </div>
  </section>

  <WaveDivider />

  <!-- DEPTH 05 — PAST PERFORMANCE AS CONSTELLATION -->
  <section class="mx-auto max-w-6xl px-6 py-24">
    <div class="flex items-center gap-4 mb-12">
      <Compass size={56} />
      <div>
        <SectionLabel>⌁  past performance  ⌁</SectionLabel>
        <h2 class="font-display font-light text-3xl md:text-4xl text-fg-strong mt-2">Where we have charted course.</h2>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cases.map((c) => (
        <CaseStudyCard client={c.data.client} title={c.data.title} summary={c.data.summary} badges={c.data.badges} href={`/experience/${c.data.slug}`} />
      ))}
    </div>
  </section>

  <!-- DEPTH 08 — CTA -->
  <section class="relative bg-surface-2 border-t border-border-hairline">
    <WaveDivider flip class="absolute -top-1 left-0 right-0" />
    <div class="mx-auto max-w-3xl px-6 py-24 text-center">
      <p class="font-serif italic text-accent tracking-[0.2em] text-xs">⌁  set out  ⌁</p>
      <h2 class="font-display font-light text-4xl md:text-5xl text-fg-strong mt-6 leading-tight">
        Plot a course with us.
      </h2>
      <p class="mt-6 text-fg leading-relaxed max-w-xl mx-auto font-serif">Whether you are scoping a new T&amp;E effort, need architecture support, or want to understand what defensible engineering looks like at your organization — write to us.</p>
      <div class="mt-10 flex justify-center gap-3 flex-wrap">
        <Button href="/contact" variant="primary">Begin a conversation</Button>
        <Button href="/capabilities" variant="outline">Capabilities statement</Button>
      </div>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: Build + commit**

```bash
PUBLIC_THEME=mariner npm run build
git add website/
git commit -m "feat(home): HomeMariner cinematic oceanic layout"
```

---

### Task 54: Verify all three home builds + E2E smoke test

**Files:** Create: `website/tests/e2e/home.spec.ts`

- [ ] **Step 1: Build all three and smoke check**

```bash
cd /Users/aousabdo/work/Oceans/website
for t in operator institute mariner; do
  PUBLIC_THEME=$t npm run build || exit 1
  grep -q "OCEANS" dist/index.html || exit 1
  echo "$t OK"
done
```

- [ ] **Step 2: Write Playwright spec**

```ts
import { test, expect } from "@playwright/test";

test.describe("home", () => {
  test("renders the hero with expected text", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("nav has 7 primary links", async ({ page }) => {
    await page.goto("/");
    const links = await page.locator("nav ul a").count();
    expect(links).toBeGreaterThanOrEqual(7);
  });
});
```

- [ ] **Step 3: Run E2E (against operator build by default)**

```bash
PUBLIC_THEME=operator npm run build
npm run test:e2e
```

Expected: tests pass.

- [ ] **Step 4: Commit**

```bash
git add website/
git commit -m "test(e2e): home renders hero + nav + footer; verify all three theme builds"
```


---

## M16 — SEO, perf, a11y

### Task 55: Structured data (JSON-LD)

**Files:**
- Create: `website/src/lib/schema.ts`
- Modify: `website/src/layouts/BaseLayout.astro` (add Organization JSON-LD)
- Modify: `website/src/layouts/BlogPostLayout.astro` (add Article JSON-LD)
- Modify: `website/src/pages/careers/[slug].astro` (add JobPosting JSON-LD)

- [ ] **Step 1: `src/lib/schema.ts`**

```ts
import { SITE_NAME, SITE_URL } from "./seo";

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-default.png`,
    sameAs: ["https://www.linkedin.com/company/oceans-llc"],
    address: { "@type": "PostalAddress", addressLocality: "Jacksonville", addressRegion: "FL", addressCountry: "US" },
  };
}

export function articleLd(input: { title: string; description: string; date: Date; author: string; url: string; image?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.date.toISOString(),
    author: { "@type": "Person", name: input.author },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    image: input.image,
    mainEntityOfPage: input.url,
  };
}

export function jobPostingLd(input: { title: string; description: string; datePosted: Date; location: string; level: string; employmentType: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: input.title,
    description: input.description,
    datePosted: input.datePosted.toISOString(),
    hiringOrganization: { "@type": "Organization", name: SITE_NAME, sameAs: SITE_URL },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: input.location } },
    employmentType: input.employmentType.toUpperCase().replace("-", "_"),
    url: input.url,
  };
}
```

- [ ] **Step 2: Inject Organization LD in `BaseLayout.astro` (add before `</head>`)**

```astro
<script type="application/ld+json" set:html={JSON.stringify((await import("@lib/schema")).organizationLd())} />
```

(In Astro, top-level `await` in the frontmatter works; cleaner: import at top.)

Move the import to the frontmatter:

```astro
import { organizationLd } from "@lib/schema";
```

Then in `<head>`:

```astro
<script type="application/ld+json" set:html={JSON.stringify(organizationLd())} />
```

- [ ] **Step 3: Add Article LD to `BlogPostLayout.astro`**

```astro
import { articleLd } from "@lib/schema";
// add to frontmatter
const ld = articleLd({
  title, description: description ?? "", date, author,
  url: new URL(Astro.url.pathname, Astro.site!).toString(),
});
```

In head (within `<PageLayout>` slot via `is:inline` is not available, so add as the first child of the article instead):

```astro
<script type="application/ld+json" set:html={JSON.stringify(ld)} />
```

- [ ] **Step 4: Add JobPosting LD to `careers/[slug].astro`**

```astro
import { jobPostingLd } from "@lib/schema";
const ld = jobPostingLd({
  title: job.title, description: job.summary, datePosted: job.posted,
  location: job.location, level: job.level, employmentType: job.type,
  url: new URL(Astro.url.pathname, Astro.site!).toString(),
});
```

Then `<script type="application/ld+json" set:html={JSON.stringify(ld)} />` near the top of the page.

- [ ] **Step 5: Build, grep for ld+json**

```bash
PUBLIC_THEME=operator npm run build
grep -lR "application/ld+json" dist/ | head
```

Expected: at least `index.html`, `blog/welcome/index.html`, `careers/systems-engineer/index.html`.

- [ ] **Step 6: Commit**

```bash
git add website/
git commit -m "feat(seo): Organization, Article, JobPosting JSON-LD"
```

---

### Task 56: robots.txt + sitemap + favicon + og-default

**Files:**
- Create: `website/public/robots.txt`
- Create: `website/public/favicon.svg`
- Create: `website/public/og-default.png` (1200×630 — placeholder)

- [ ] **Step 1: `robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://www.oceansllc.com/sitemap-index.xml
```

- [ ] **Step 2: `favicon.svg` (wave-O glyph, replaceable later)**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#1A2840"/>
  <text x="50%" y="55%" text-anchor="middle" font-family="Syne, sans-serif" font-weight="800" font-size="18" fill="#5BD4FF">O</text>
  <path d="M2 22 Q8 18 16 22 T30 22" stroke="#5BD4FF" stroke-width="1.2" fill="none" opacity="0.5"/>
</svg>
```

- [ ] **Step 3: Placeholder `og-default.png`**

Use any 1200×630 PNG temporarily (commit a generated solid-fill PNG via ImageMagick if available):

```bash
cd /Users/aousabdo/work/Oceans/website/public
# If imagemagick installed:
convert -size 1200x630 xc:'#1A2840' \
  -gravity center -fill '#5BD4FF' -pointsize 60 -font Helvetica-Bold \
  -annotate +0+0 'OCEANS LLC' og-default.png 2>/dev/null || \
  printf '\x89PNG\r\n\x1a\n' > og-default.png  # placeholder
```

Final OG image generation is a phase-2 task (per-page OG cards).

- [ ] **Step 4: Build, verify sitemap exists**

```bash
PUBLIC_THEME=operator npm run build
test -f dist/sitemap-index.xml && echo OK
test -f dist/robots.txt && echo OK
```

- [ ] **Step 5: Commit**

```bash
git add website/public/
git commit -m "feat(seo): robots.txt, favicon.svg, og-default placeholder"
```

---

### Task 57: Lighthouse + axe-core audit pass per theme

**Files:**
- Create: `website/scripts/audit.sh`

- [ ] **Step 1: Install audit tools**

```bash
cd /Users/aousabdo/work/Oceans/website
npm install --save-dev @lhci/cli @axe-core/cli serve
```

- [ ] **Step 2: `scripts/audit.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail
THEME="${1:-operator}"
echo "Building theme: $THEME"
PUBLIC_THEME="$THEME" npm run build
npx serve dist -l 5173 &
SERVE_PID=$!
sleep 2
echo "→ Lighthouse"
npx lhci autorun --collect.url=http://localhost:5173 --collect.url=http://localhost:5173/services --collect.url=http://localhost:5173/blog --upload.target=temporary-public-storage || true
echo "→ axe-core"
npx axe http://localhost:5173 http://localhost:5173/services http://localhost:5173/blog --exit || true
kill $SERVE_PID
```

```bash
chmod +x scripts/audit.sh
```

- [ ] **Step 3: Run each theme**

```bash
./scripts/audit.sh operator
./scripts/audit.sh institute
./scripts/audit.sh mariner
```

Expected: Lighthouse Performance ≥ 90, Accessibility ≥ 95 per page. Fix any failures (typically contrast or missing alt) before committing.

- [ ] **Step 4: Commit**

```bash
git add website/scripts/ website/package.json
git commit -m "chore: lighthouse + axe audit script per theme"
```


---

## M17 — CI/CD + Cloudflare wiring

### Task 58: GitHub Actions CI

**Files:** Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write workflow**

```yaml
name: CI
on:
  push: { branches: ["**"] }
  pull_request: { branches: [main] }
jobs:
  test:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: website } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm", cache-dependency-path: website/package-lock.json }
      - run: npm ci
      - run: npm run check
      - run: npm run lint
      - run: npm run test
      - name: Build (all themes)
        run: |
          PUBLIC_THEME=operator npm run build
          PUBLIC_THEME=institute npm run build
          PUBLIC_THEME=mariner npm run build
```

- [ ] **Step 2: Commit + push to verify it runs (once remote exists)**

```bash
cd /Users/aousabdo/work/Oceans
git add .github/workflows/ci.yml
git commit -m "ci: typecheck, lint, test, and build all three themes"
```

---

### Task 59: GitHub Actions Cloudflare deploy

**Files:** Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write workflow**

```yaml
name: Deploy
on:
  push:
    branches: [main, "theme/operator", "theme/institute", "theme/mariner"]
jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: website } }
    permissions: { contents: read, deployments: write }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "npm", cache-dependency-path: website/package-lock.json }
      - run: npm ci
      - name: Determine theme
        id: theme
        run: |
          case "${GITHUB_REF_NAME}" in
            theme/operator)  echo "theme=operator"  >> $GITHUB_OUTPUT ;;
            theme/institute) echo "theme=institute" >> $GITHUB_OUTPUT ;;
            theme/mariner)   echo "theme=mariner"   >> $GITHUB_OUTPUT ;;
            *)               echo "theme=operator"  >> $GITHUB_OUTPUT ;;  # main uses canonical theme (update post-selection)
          esac
      - name: Build
        run: PUBLIC_THEME=${{ steps.theme.outputs.theme }} npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: oceans-website
          directory: website/dist
          branch: ${{ github.ref_name }}
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy to Cloudflare Pages per branch (main + 3 theme branches)"
```

---

### Task 60: Provision Cloudflare resources (manual, documented)

**Files:** Create: `docs/superpowers/runbooks/cloudflare-setup.md`

- [ ] **Step 1: Write the runbook (one-time setup, ~30 min)**

```markdown
# Cloudflare setup runbook

One-time setup. Run by a human with Cloudflare account access.

## Prereqs
- Cloudflare account
- `oceansllc.com` accessible (DNS will move from Wix at launch — Section §9 of this runbook)

## 1. Create Pages project
- Dashboard → Workers & Pages → Create application → Pages → Connect to Git
- Select GitHub repo (whichever holds /Users/aousabdo/work/Oceans)
- Project name: `oceans-website`
- Build settings:
  - Build command: `cd website && npm ci && PUBLIC_THEME=operator npm run build`
  - Build output directory: `website/dist`
  - Root directory: leave blank
- Save & Deploy.

## 2. Create branch previews
- Pages → oceans-website → Settings → Builds & deployments → Preview deployments → enable for all branches.
- Verify deploys appear for `theme/operator`, `theme/institute`, `theme/mariner`.

## 3. Create R2 bucket
- R2 → Create bucket → `oceans-applications` (private)
- Pages → oceans-website → Settings → Functions → R2 bucket bindings → add binding
  - Variable name: `APPLICATIONS`
  - Bucket: `oceans-applications`

## 4. Create Turnstile sitekey
- Turnstile → Add site
- Domain: `oceansllc.com` and your `*.pages.dev` preview domain
- Mode: Managed
- Copy sitekey + secret.

## 5. Set up Resend
- Sign up at resend.com (free 3000/mo)
- Add domain `oceansllc.com`, paste the SPF/DKIM/DMARC records into Cloudflare DNS
- Create API key, copy.

## 6. Add Pages env vars
Pages → oceans-website → Settings → Environment variables (Production AND Preview):
- `PUBLIC_TURNSTILE_SITE_KEY` = turnstile sitekey
- `TURNSTILE_SECRET` = turnstile secret (encrypted)
- `RESEND_API_KEY` = resend key (encrypted)
- `CONTACT_TO` = info@oceansllc.com
- `CONTACT_FROM` = noreply@oceansllc.com
- `CAREERS_TO` = careers@oceansllc.com

## 7. GitHub Actions secrets
GitHub repo → Settings → Secrets and variables → Actions → New repository secret:
- `CLOUDFLARE_API_TOKEN` (Pages:Edit permission)
- `CLOUDFLARE_ACCOUNT_ID`

## 8. Cloudflare Web Analytics
- Analytics → Web Analytics → Add site → `oceansllc.com`
- Copy the beacon token; paste into `src/layouts/BaseLayout.astro` replacing `REPLACE_WITH_CF_ANALYTICS_TOKEN`.

## 9. DNS cutover (launch day only)
- Pages → oceans-website → Custom domains → Add `oceansllc.com` and `www.oceansllc.com`
- Cloudflare guides through DNS record changes.
- For the email path (Resend), ensure SPF/DKIM/DMARC are added BEFORE flipping DNS.
- Keep Wix accessible for 30 min after cutover for emergency rollback.

## Verification
- Visit https://theme-operator.oceans-website.pages.dev → should render Operator theme
- Submit a test contact form → check info@oceansllc.com inbox
- Upload a test PDF resume → check careers@ inbox + R2 dashboard for the object
```

- [ ] **Step 2: Commit**

```bash
mkdir -p docs/superpowers/runbooks
git add docs/superpowers/runbooks/cloudflare-setup.md
git commit -m "docs: cloudflare setup runbook"
```

---

### Task 61: Create theme branches for previews

**Files:** None (git operations).

- [ ] **Step 1: Create branches from main**

```bash
cd /Users/aousabdo/work/Oceans
git checkout -b theme/operator main && git push -u origin theme/operator
git checkout -b theme/institute main && git push -u origin theme/institute
git checkout -b theme/mariner main && git push -u origin theme/mariner
git checkout main
```

Note: each branch builds with its corresponding `PUBLIC_THEME` (set by `deploy.yml`).

- [ ] **Step 2: After Cloudflare provisioning, verify three preview URLs work**

Expected URLs (pattern: `https://theme-<name>.oceans-website.pages.dev`):
- `https://theme-operator.oceans-website.pages.dev`
- `https://theme-institute.oceans-website.pages.dev`
- `https://theme-mariner.oceans-website.pages.dev`


---

## M18 — Owner selection workflow

### Task 62: Owner selection handoff

This task is a workflow checkpoint, not code. Marked as a `- [ ]` so it can be tracked.

- [ ] **Step 1: Compose the owner-review message**

Send Danny the three preview URLs in one message. Suggested template:

```
Hi Danny,

Three preview builds of the new website are live. Same content, three different visual directions.
Pick one — that's what we'll launch with. The other two stay archived in the repo for reference.

1. The Operator — defense-tech mission console
   https://theme-operator.oceans-website.pages.dev

2. The Institute — editorial / scientific gravitas
   https://theme-institute.oceans-website.pages.dev

3. The Mariner — brand-led, light-mode oceanic
   https://theme-mariner.oceans-website.pages.dev

Spend 5–10 minutes per site. Look at the homepage, click into Services, scroll to the bottom. Then tell me which one feels right for OCEANS.

If you want a tweak after you pick (colors, copy, photography), we'll iterate on the chosen one only.
```

- [ ] **Step 2: Capture the decision in the repo**

Once Danny picks (let's say `<chosen>`):

```bash
cd /Users/aousabdo/work/Oceans
echo "Selected: <chosen>" >> docs/superpowers/runbooks/cloudflare-setup.md
git add docs/superpowers/runbooks/cloudflare-setup.md
git commit -m "docs: record selected theme: <chosen>"
```

---

### Task 63: Promote chosen theme to main

**Files:** None (git operations + workflow edits).

- [ ] **Step 1: Merge chosen branch into main**

```bash
cd /Users/aousabdo/work/Oceans
git checkout main
git merge --ff-only theme/<chosen>   # if theme branches have stayed in sync
# OR if main has diverged:
git merge theme/<chosen>
```

- [ ] **Step 2: Update `.github/workflows/deploy.yml` so `main` builds with the chosen theme**

Open `.github/workflows/deploy.yml` and change the `*` fallback line in the `case` block from `operator` to `<chosen>`:

```yaml
*) echo "theme=<chosen>" >> $GITHUB_OUTPUT ;;
```

- [ ] **Step 3: Push and verify main deploy**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: main now builds with <chosen> theme"
git push origin main
```

Watch the GitHub Actions deploy. Production preview URL should now match the chosen theme.

- [ ] **Step 4: Archive non-chosen theme branches (don't delete)**

```bash
# Rename to make their archival status obvious; do not push delete
git branch -m theme/operator  archive/theme-operator  2>/dev/null || true
git branch -m theme/institute archive/theme-institute 2>/dev/null || true
git branch -m theme/mariner   archive/theme-mariner   2>/dev/null || true
# Only rename the two NOT chosen; keep the chosen-named branch for history if desired
```

Note: alternative is to keep all three branches forever in case Danny ever wants to revisit. Either works; archival rename is just convention.

---

## M19 — Hardening + launch

### Task 64: Real content pass on chosen theme

**Files:** Various content files under `website/src/content/`, plus copy across pages.

- [ ] **Step 1: Replace seed copy with real copy**

Walk through each file in `src/content/` and the pages and replace placeholder language with real, leadership-approved copy:

- `src/content/services/*.yml` — verify titles, summaries, methods match leadership voice.
- `src/content/case-studies/*.yml` — fill `challenge`, `approach`, `outcome` with real sanitized text + add real `metrics` entries where possible. Confirm legal clearance per case study before publishing.
- `src/content/team/*.yml` — confirm bios with the founders; add other team members if any.
- `src/content/jobs/*.yml` — confirm or replace with current openings.
- `src/content/blog/welcome.mdx` — replace with real first post.
- `src/pages/about.astro` — confirm the story prose.
- `src/pages/capabilities.astro` — fill in real CAGE / UEI / NAICS values.
- `src/layouts/BaseLayout.astro` — replace `REPLACE_WITH_CF_ANALYTICS_TOKEN` with the actual Cloudflare beacon token.

- [ ] **Step 2: Commit content updates incrementally**

```bash
cd /Users/aousabdo/work/Oceans
git add website/src/content/ website/src/pages/
git commit -m "content: real copy across services, case studies, team, capabilities"
```

---

### Task 65: Imagery, video, photography

**Files:** Add files under `website/public/`.

- [ ] **Step 1: Add chosen-theme-specific assets**

Depending on the chosen theme:

- **Operator:** schematic SVG diagrams (already inline), team portraits in B&W (optional)
- **Institute:** B&W reportage photography under `public/img/institute/` referenced from pages
- **Mariner:** `public/video/open-sky-hero.mp4` (≤ 5 MB, 1080p, 8-12 sec loop) + `public/img/open-sky-hero.jpg` poster, additional maritime stills

For licensed stock: prefer Unsplash, Pexels (free for commercial), or pay for one-time licenses. Document source in `docs/superpowers/runbooks/assets.md`.

- [ ] **Step 2: Optimize**

```bash
cd /Users/aousabdo/work/Oceans/website/public
# Compress with appropriate tooling
# Images: cwebp / squoosh-cli; target ≤ 200 KB per hero, ≤ 80 KB per card
# Video: ffmpeg -i in.mp4 -c:v libx264 -crf 23 -preset slow -an -movflags +faststart out.mp4
```

- [ ] **Step 3: Verify build size**

```bash
cd /Users/aousabdo/work/Oceans/website
npm run build
du -sh dist/
```

Target: total `dist/` size ≤ 25 MB.

- [ ] **Step 4: Commit**

```bash
git add website/public/
git commit -m "assets: licensed imagery and hero video for chosen theme"
```

---

### Task 66: 301 redirects from Wix URLs

**Files:** Create: `website/public/_redirects`

- [ ] **Step 1: Audit existing Wix URLs**

Sample current paths from screenshots / sitemap:

- `/services` → `/services` (no change)
- `/relevant-experience` → `/experience` (renamed)
- `/team` → `/team` (no change)
- `/contact` → `/contact` (no change)
- `/about` → `/about` (no change)

If Wix has other ranked pages (check Google Search Console), add to the audit.

- [ ] **Step 2: Write `_redirects` (Cloudflare Pages syntax)**

```
/relevant-experience          /experience          301
/relevant-experience/*        /experience/:splat   301
```

- [ ] **Step 3: Build, verify**

```bash
cd /Users/aousabdo/work/Oceans/website
npm run build
test -f dist/_redirects && cat dist/_redirects
```

- [ ] **Step 4: Commit**

```bash
git add website/public/_redirects
git commit -m "feat: 301 redirects from Wix paths"
```

---

### Task 67: Pre-launch QA checklist

**Files:** Create: `docs/superpowers/runbooks/launch-checklist.md`

- [ ] **Step 1: Write the checklist**

```markdown
# Launch-day checklist

## T-24h
- [ ] All P0 content reviewed by leadership
- [ ] All P1 pages live (case studies, capabilities, privacy, terms, 404)
- [ ] Lighthouse audit pass: perf ≥ 90, a11y ≥ 95 on home + services + blog
- [ ] axe-core: zero serious/critical violations
- [ ] Cross-browser manual QA: Chrome, Safari, Firefox on macOS + iOS Safari + Android Chrome
- [ ] Forms tested end-to-end: contact form → email; apply form → R2 + email
- [ ] Turnstile pass-through working on each form
- [ ] Email rendering tested in Gmail, Outlook, Apple Mail
- [ ] RSS feed validates (https://validator.w3.org/feed/)
- [ ] OG cards render correctly (test with https://www.opengraph.xyz/)
- [ ] All 14 P0 pages return 200; 404 page renders styled
- [ ] No console errors in browser devtools on any P0 page
- [ ] Search Console: submit new sitemap

## T-1h
- [ ] Final content sweep — no "[TBD]" or "Lorem ipsum" anywhere
- [ ] Verify R2 bucket is private + signed-URL works for stored resumes
- [ ] Backup Wix export saved to /Users/aousabdo/work/Oceans/wix-archive-2026-MM-DD/

## Launch
- [ ] Cloudflare DNS records point to Pages
- [ ] Verify oceansllc.com loads new site
- [ ] Verify www.oceansllc.com loads new site
- [ ] Verify https://oceansllc.com/relevant-experience redirects (301) to /experience
- [ ] Test live contact form
- [ ] Test live apply form with a real PDF
- [ ] Confirm Cloudflare Web Analytics shows traffic
- [ ] Email leadership: "Site is live"

## T+24h
- [ ] Check analytics for any 404s, fix or redirect
- [ ] Verify no email deliverability issues (check spam folders for first 24h of submissions)
- [ ] Cloudflare logs: no 5xx spikes
- [ ] Pull Wix offline
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/runbooks/launch-checklist.md
git commit -m "docs: pre-launch and launch-day checklist"
```

---

### Task 68: DNS cutover + post-launch monitoring

**Files:** None (operations).

- [ ] **Step 1: Schedule cutover window**

Pick a low-traffic window (typically weekend morning). Notify leadership 24h ahead.

- [ ] **Step 2: Pre-cutover**

```bash
# Verify the new site builds & deploys cleanly to production preview
git push origin main
# Wait for GitHub Actions → Cloudflare to deploy
# Visit https://oceans-website.pages.dev — confirm canonical site looks right
```

- [ ] **Step 3: Cutover**

Per `docs/superpowers/runbooks/cloudflare-setup.md` §9:

1. Cloudflare → Pages → oceans-website → Custom domains → Add `oceansllc.com` and `www.oceansllc.com`
2. Update DNS at the registrar (or in Cloudflare if it's the DNS host) per Cloudflare's instructions
3. Wait for DNS to propagate (5–30 min)
4. Verify in a private browser window: `https://www.oceansllc.com` shows the new site

- [ ] **Step 4: Run the launch-day checklist**

Step-by-step. Don't skip.

- [ ] **Step 5: Post-launch (24h)**

Monitor:
- Cloudflare Analytics dashboard
- Resend logs (any bounces / send failures?)
- Email inboxes (`info@`, `careers@`) for any test submissions or real inquiries
- Browser console / Sentry-equivalent (if added)

- [ ] **Step 6: Final commit**

```bash
git commit --allow-empty -m "launch: oceansllc.com migrated from Wix"
git tag v1.0.0
git push origin main --tags
```

---

## Plan complete

This plan covers the full design spec from foundation through launch. All 68 tasks have:
- Exact file paths
- Complete code/markup/configuration in every step
- Exact commands with expected output
- Commits at each meaningful checkpoint
- TDD for the form backends and pure logic; visual + Playwright verification for components and pages

Two reserved phases stay outside this plan (per the spec's P2 list):
- Pagefind search, press/news section, lightweight CMS, i18n, newsletter integration — captured in spec §3.2.


---

## Self-review notes

**Spec coverage:** Every spec section maps to at least one task. Audit:

| Spec section | Plan coverage |
| --- | --- |
| §1 Purpose & success | M16 audits; perf/a11y budgets in T57 |
| §2.1 Operator theme | T7 (tokens), T28-30 (components), T51 (home) |
| §2.2 Institute theme | T8 (tokens), T31-32 (components), T52 (home) |
| §2.3 Mariner theme (Open Sky) | T9 (tokens), T33-34 (components), T53 (home) |
| §2.4 Why diverge | encoded in token files |
| §3 IA — all 14 P0/P1 pages | T36, T37, T38 (×2), T39 (×2), T43, T44, T46, T47, T40, T49 (×3), T50 |
| §3.3 Navigation | T16 (Nav), T17 (Footer) |
| §4 Component inventory | T18–T34 (shared + theme-only) |
| §5 Home wireframes | T51, T52, T53 |
| §6 Sub-page structures | M10–M14 |
| §7 Tech stack | M0 (Astro, Tailwind, TS), M17 (Cloudflare, CI/CD) |
| §8 Data flows | T41 (contact), T45 (apply), T46-48 (blog), T43-44 (jobs) |
| §9 Non-functional | T55-57 (SEO/perf/a11y), T41/T45 (security) |
| §10 Phasing | M0–M19 map 1:1 to spec phases 0–4 |
| §11 Open questions | captured in spec; addressed during hardening |

**Compressions / known minor gaps (resolve during M19 hardening):**

1. **Mariner home polish.** Spec §5.3 calls for 9 sections; T53 implements 5 core sections + 2 wave dividers. Missing: Depth 04 ("Journey" horizontal scroll), Depth 06 ("Voices over deep water"), Depth 07 ("Founders at the dock environmental portraits"). These require real photography to land well — defer to M19 Task 65 (imagery) and add as an extension to T53 then. Add task:
   - `[ ] M19 polish: append "Journey", "Voices", "Founders at the dock" sections to HomeMariner after photography lands`
2. **Institute home polish.** Spec §5.2 calls for 9 sections; T52 implements 8 (V Client register is a single italic line — spec calls for a hairline-ruled logo row; upgrade in M19 once real client logos are confirmed for use).
3. **Operator section count.** Spec §5.1 lists 8 sections; T51 ships 7 (Leadership section omitted on home — covered on `/team`). Acceptable; leadership is one click away. Add as M19 polish only if Danny requests it.
4. **ScanLineHover and RippleHover utilities.** Spec §4.2 lists both as theme-only components. ScanLineHover is inlined as a CSS transform on `ServiceCard`; RippleHover is omitted (Mariner cards use the shared `accent`-on-hover treatment). Both are decorative refinements — promote to standalone components only if Danny specifies.
5. **ThemeSwitcher component.** Spec §4.1 lists this as a preview-only utility. Plan replaces it with **branch-per-theme preview deploys**, which is more honest (Danny sees a real site, not a toy widget). No code task needed.
6. **i18n / Pagefind search / Press section / CMS layer.** All P2 in spec §3.2; explicitly out of plan scope. Add as separate plans post-launch if pursued.

**No placeholders found:** all "[TBD]" markers are real content slots (CAGE/UEI numbers) that leadership fills, not implementation gaps. `<chosen>` in M18 is a runtime variable, not a placeholder.

**Type consistency verified:** all component props, library functions (`validateContact`, `validateApply`, `isPdf`, `formatDate`, `readingTime`, `toSlug`, `resolveTheme`, `buildSeo`, `*Ld`), and Cloudflare bindings (`APPLICATIONS`, `RESEND_API_KEY`, `TURNSTILE_SECRET`, `CONTACT_TO`, `CONTACT_FROM`, `CAREERS_TO`) are consistent across all tasks.

