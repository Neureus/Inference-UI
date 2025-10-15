# Inference UI Documentation

Official documentation site for Inference UI, built with [Nextra 4](https://nextra.site).

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:3001`.

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run start
```

The static site will be generated in the `.next/` directory (or `out/` if using export).

## 📁 Structure (Nextra 4 with App Router)

```
docs/
├── app/                    # Next.js App Router
│   ├── layout.jsx         # Root layout
│   └── [[...slug]]/       # Dynamic catch-all route
│       ├── layout.jsx     # Docs layout
│       └── page.jsx       # MDX page renderer
├── content/               # Documentation content (MDX)
│   ├── index.mdx          # Landing page
│   ├── _meta.ts           # Navigation config
│   ├── docs/              # Main documentation
│   │   ├── _meta.ts
│   │   ├── getting-started.mdx
│   │   ├── installation.mdx
│   │   ├── architecture.mdx
│   │   └── ...
│   ├── examples/          # Example code
│   ├── api/               # API reference
│   └── deployment/        # Deployment guides
├── public/                # Static assets
│   ├── images/
│   ├── _headers           # Custom headers
│   └── _redirects         # URL redirects
├── nextra.config.ts       # Nextra 4 configuration
├── next.config.mjs        # Next.js config
├── package.json
└── tsconfig.json
```

## 🆕 What's New in Nextra 4

- **App Router Only**: Uses Next.js 15+ App Router (Pages Router deprecated)
- **Content Directory**: MDX files now live in `content/` not `pages/`
- **TypeScript _meta**: Navigation config uses `_meta.ts` instead of `_meta.json`
- **Pagefind Search**: New Rust-powered search engine (replaces FlexSearch)
- **36.9% Smaller Bundle**: Significant performance improvements
- **React Server Components**: Better performance and SEO
- **Turbopack Support**: Faster development builds

## 📝 Writing Documentation

### Creating a New Page

1. Create an MDX file in `content/docs/`:

```mdx
---
title: Page Title
description: Page description for SEO
---

# Page Title

Your content here with MDX features.

> This is a GitHub-style callout with Nextra 4!
```

2. Add it to `content/docs/_meta.ts`:

```ts
export default {
  'my-new-page': 'My New Page',
  // or with options
  'my-new-page': {
    title: 'My New Page',
    display: 'normal', // or 'hidden'
  },
};
```

### MDX Components

Nextra provides built-in components:

```mdx
import { Callout, Steps, Tabs } from 'nextra/components'

## Callouts
<Callout type="info">Information</Callout>
<Callout type="warning">Warning</Callout>
<Callout type="error">Error</Callout>

## Steps
<Steps>
### Step 1
Content for step 1

### Step 2
Content for step 2
</Steps>

## Tabs
<Tabs items={['npm', 'yarn', 'pnpm']}>
  <Tabs.Tab>npm install</Tabs.Tab>
  <Tabs.Tab>yarn add</Tabs.Tab>
  <Tabs.Tab>pnpm add</Tabs.Tab>
</Tabs>
```

### Code Blocks

````mdx
```tsx filename="App.tsx" {1,3-5}
import React from 'react';

export default function App() {
  return <div>Hello World</div>;
}
```
````

Features:
- Syntax highlighting
- Line highlighting: `{1,3-5}`
- Filename: `filename="App.tsx"`
- Copy button (enabled by default)

### Navigation

Update `pages/_meta.json` or `pages/docs/_meta.json`:

```json
{
  "index": {
    "title": "Home",
    "type": "page",
    "display": "hidden"
  },
  "docs": {
    "title": "Documentation",
    "type": "page"
  },
  "---": {
    "type": "separator",
    "title": "Section Title"
  },
  "my-page": "My Page Title"
}
```

## 🎨 Theme Configuration

Edit `theme.config.tsx`:

```tsx
const config: DocsThemeConfig = {
  logo: <span>Inference UI</span>,
  project: {
    link: 'https://github.com/velvet-ui/velvet',
  },
  docsRepositoryBase: 'https://github.com/velvet-ui/velvet/tree/main/docs',
  footer: {
    text: 'MIT © 2025 Inference UI',
  },
  // ... more config
};
```

## 🚀 Deployment

### Cloudflare Pages (Recommended)

**Automatic deployment via GitHub**:

1. Connect repository to Cloudflare Pages
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output**: `out`
   - **Root directory**: `docs`
3. Deploy automatically on push to `main`

**Manual deployment via CLI**:

```bash
# Build the site
npm run build

# Deploy with Wrangler
wrangler pages deploy out --project-name=velvet-docs
```

See [Deployment Guide](/deployment/docs-site) for details.

### Other Platforms

**Vercel**:
```bash
vercel deploy
```

**Netlify**:
```bash
netlify deploy --dir=out --prod
```

**GitHub Pages**:
```bash
# Set basePath in next.config.mjs
basePath: '/velvet'

# Build and push to gh-pages branch
npm run build
```

## 📊 Analytics

Enable Web Analytics in Cloudflare Pages dashboard:

1. Go to Pages project
2. Navigate to **Analytics**
3. Enable **Web Analytics**
4. Track page views, visitors, performance

## 🔍 SEO

Add frontmatter to MDX pages:

```mdx
---
title: Page Title
description: Page description for SEO
---

# Page Content
```

Nextra automatically generates:
- `<title>` tags
- `<meta>` descriptions
- Open Graph tags
- JSON-LD structured data

## 🎯 Best Practices

### Content

- Keep pages under 50KB
- Use clear headings hierarchy
- Add code examples
- Link to related pages
- Include callouts for important info

### Performance

- Optimize images before adding
- Use WebP format when possible
- Minimize external dependencies
- Test with Lighthouse

### Accessibility

- Use semantic HTML
- Add alt text to images
- Ensure proper heading structure
- Test with screen readers

## 🧪 Testing

### Local Testing

```bash
# Run development server
npm run dev

# Test production build
npm run build && npm run start
```

### Link Checking

```bash
# Install markdown-link-check
npm install -g markdown-link-check

# Check all links
find pages -name "*.mdx" -exec markdown-link-check {} \;
```

### Lighthouse Audit

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun --url=http://localhost:3001
```

Target scores:
- Performance: 95+
- Accessibility: 100
- Best Practices: 95+
- SEO: 100

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Module Not Found

```bash
# Ensure all dependencies installed
npm install

# Check imports in MDX files
```

### Styles Not Applied

Check:
1. `next.config.mjs` configuration
2. MDX component imports
3. CSS file paths

### 404 on Routes

Ensure `trailingSlash: true` in `next.config.mjs`.

## 📚 Resources

- [Nextra Documentation](https://nextra.site)
- [Next.js Documentation](https://nextjs.org/docs)
- [MDX Documentation](https://mdxjs.com)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)

## 🤝 Contributing

1. Create a new branch
2. Add or update MDX files
3. Test locally with `npm run dev`
4. Commit changes
5. Open a pull request

### Writing Style

- Use active voice
- Keep sentences short
- Add code examples
- Link to related topics
- Use proper grammar

## 📄 License

MIT © 2025 Inference UI

---

**Built with**: Nextra 3.0 • Next.js 14 • React 18 • TypeScript
