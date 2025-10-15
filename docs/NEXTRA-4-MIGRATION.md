# Nextra 4 Migration Guide

This document explains the migration from Nextra 3 (Pages Router) to Nextra 4 (App Router).

## Overview

The Inference UI documentation site has been migrated to **Nextra 4**, which brings significant improvements:

- **36.9% smaller bundle size**
- **Pagefind search** (Rust-powered, faster than FlexSearch)
- **App Router** (Next.js 15+)
- **React Server Components** for better performance
- **Turbopack support** for faster dev builds

## Key Changes

### 1. Directory Structure

**Before (Nextra 3)**:
```
docs/
├── pages/
│   ├── index.mdx
│   ├── _meta.json
│   └── docs/
│       ├── _meta.json
│       └── getting-started.mdx
└── theme.config.tsx
```

**After (Nextra 4)**:
```
docs/
├── app/
│   ├── layout.jsx
│   └── [[...slug]]/
│       ├── layout.jsx
│       └── page.jsx
├── content/
│   ├── index.mdx
│   ├── _meta.ts
│   └── docs/
│       ├── _meta.ts
│       └── getting-started.mdx
└── nextra.config.ts
```

### 2. Configuration Changes

#### package.json

```diff
{
  "dependencies": {
-   "next": "^14.2.0",
+   "next": "^15.1.0",
-   "nextra": "^3.0.0",
+   "nextra": "^4.0.0",
-   "nextra-theme-docs": "^3.0.0",  // Removed
-   "react": "^18.3.0",
+   "react": "^19.0.0",
-   "react-dom": "^18.3.0"
+   "react-dom": "^19.0.0"
  }
}
```

#### next.config.mjs

```diff
import nextra from 'nextra';

const withNextra = nextra({
- theme: 'nextra-theme-docs',
- themeConfig: './theme.config.tsx',
+ latex: false,
+ search: {
+   codeblocks: false,
+ },
  defaultShowCopyCode: true,
- latex: false,
});
```

#### Theme Configuration

**Before**: `theme.config.tsx`
```tsx
import { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: <span>Inference UI</span>,
  project: {
    link: 'https://github.com/velvet-ui/velvet',
  },
  // ... more config
};

export default config;
```

**After**: `nextra.config.ts`
```ts
import type { NextraConfig } from 'nextra';

const config: NextraConfig = {
  theme: {
    logo: <span>Inference UI</span>,
    project: {
      link: 'https://github.com/velvet-ui/velvet',
    },
    // ... more config
  },
};

export default config;
```

### 3. Navigation Configuration

#### _meta files

**Before**: `pages/_meta.json`
```json
{
  "index": {
    "title": "Home",
    "type": "page",
    "display": "hidden"
  },
  "docs": "Documentation"
}
```

**After**: `content/_meta.ts`
```ts
export default {
  index: {
    title: 'Home',
    type: 'page',
    display: 'hidden',
  },
  docs: {
    title: 'Documentation',
    type: 'folder',
  },
};
```

### 4. MDX Files

#### Frontmatter

**Before**:
```mdx
# Page Title

Content here...
```

**After** (with frontmatter):
```mdx
---
title: Page Title
description: Page description for SEO
---

# Page Title

Content here...
```

#### Callouts

**Before (Nextra 3)**:
```mdx
import { Callout } from 'nextra/components'

<Callout type="info">
  This is an info callout
</Callout>
```

**After (Nextra 4)** - GitHub Alert Syntax:
```mdx
> [!NOTE]
> This is a note

> [!TIP]
> This is a tip

> [!IMPORTANT]
> This is important

> [!WARNING]
> This is a warning

> [!CAUTION]
> This is a caution
```

Or continue using the old syntax (still supported):
```mdx
import { Callout } from 'nextra/components'

<Callout type="info">
  Still works!
</Callout>
```

### 5. App Router Setup

#### Root Layout

Create `app/layout.jsx`:
```jsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}

export const metadata = {
  title: 'Inference UI Documentation',
  description: 'AI-Native UI component library',
};
```

#### Docs Layout

Create `app/[[...slug]]/layout.jsx`:
```jsx
export { Layout as default } from 'nextra/layouts';

export const metadata = {
  title: {
    template: '%s – Inference UI',
  },
};
```

#### Page Renderer

Create `app/[[...slug]]/page.jsx`:
```jsx
import { getPage, getPages } from 'nextra/page';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return getPages().map((page) => ({
    slug: page.route.split('/').filter(Boolean),
  }));
}

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const page = getPage(slug);

  if (!page) return {};

  return {
    title: page.frontMatter?.title || page.name,
    description: page.frontMatter?.description,
  };
}

export default async function Page({ params }) {
  const { slug = [] } = await params;
  const page = getPage(slug);

  if (!page) {
    notFound();
  }

  const { default: MDXContent, toc, ...rest } = page;

  return <MDXContent {...rest} />;
}
```

## Migration Steps

### Step 1: Update Dependencies

```bash
npm install next@^15.1.0 nextra@^4.0.0 react@^19.0.0 react-dom@^19.0.0
npm uninstall nextra-theme-docs
```

### Step 2: Create App Router Structure

```bash
mkdir -p app/[[...slug]]
touch app/layout.jsx
touch app/[[...slug]]/layout.jsx
touch app/[[...slug]]/page.jsx
```

### Step 3: Move Content

```bash
mkdir content
mv pages/* content/
```

### Step 4: Convert _meta.json to _meta.ts

For each `_meta.json` file:

```bash
mv content/_meta.json content/_meta.ts
```

Then convert the JSON to TypeScript export:

```ts
// content/_meta.ts
export default {
  index: 'Home',
  docs: 'Documentation',
};
```

### Step 5: Update MDX Files

Add frontmatter to MDX files:

```mdx
---
title: Your Page Title
description: Your page description
---

# Content starts here
```

### Step 6: Update Configuration

1. Create `nextra.config.ts` with theme options
2. Update `next.config.mjs` to remove theme-specific config
3. Delete `theme.config.tsx`

### Step 7: Test

```bash
npm run dev
```

Visit `http://localhost:3001` and verify everything works.

## Breaking Changes

### 1. No Pages Router Support

Nextra 4 only works with Next.js App Router. If you need Pages Router, stay on Nextra 3.

### 2. Theme Config Location

- `theme.config.tsx` → Removed
- Theme options now in `nextra.config.ts` or layout files

### 3. Component Imports

```diff
- import { Callout, Steps, Tabs } from 'nextra-theme-docs/components'
+ import { Callout, Steps, Tabs } from 'nextra/components'
```

### 4. useRouter Hook

```diff
- import { useRouter } from 'nextra-theme-docs'
+ import { useRouter } from 'next/router'  // Pages Router (removed)
+ import { useRouter } from 'next/navigation'  // App Router
```

### 5. File-based Metadata

Use frontmatter instead of `useConfig()`:

```mdx
---
title: My Page
description: My description
---
```

## New Features

### 1. GitHub Alert Syntax

```mdx
> [!NOTE]
> Supports GitHub-style alerts now!
```

### 2. Pagefind Search

Rust-powered search with better performance:

```ts
// next.config.mjs
const withNextra = nextra({
  search: {
    codeblocks: false,  // Don't index code blocks
  },
});
```

### 3. Turbopack Support

```bash
npm run dev --turbo
```

### 4. React Server Components

Better performance with RSC:
- Faster initial page loads
- Smaller client bundles
- Better SEO

## Troubleshooting

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Search Not Working

Pagefind is built during `next build`. Run:

```bash
npm run build
```

### Styles Not Applied

Ensure you have the proper layout structure:
- `app/layout.jsx` for root layout
- `app/[[...slug]]/layout.jsx` for docs layout

### 404 on Routes

Check that:
1. MDX files are in `content/` not `pages/`
2. `_meta.ts` files have correct exports
3. File names match the routes

## Performance Improvements

Nextra 4 brings significant performance gains:

| Metric | Nextra 3 | Nextra 4 | Improvement |
|--------|----------|----------|-------------|
| Bundle Size | 100% | 63.1% | **-36.9%** |
| Search Speed | FlexSearch | Pagefind (Rust) | **~3x faster** |
| Build Time | Baseline | With Turbopack | **~5x faster** |
| First Load | Baseline | With RSC | **~30% faster** |

## Resources

- [Nextra 4 Announcement](https://the-guild.dev/blog/nextra-4)
- [Nextra Documentation](https://nextra.site)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Pagefind Search](https://pagefind.app/)

## Support

If you encounter issues during migration:

1. Check this guide
2. Review [Nextra 4 docs](https://nextra.site)
3. Open an issue on [GitHub](https://github.com/velvet-ui/velvet/issues)

---

**Migration completed**: October 15, 2025
**Nextra version**: 4.0.0
**Next.js version**: 15.1.0
