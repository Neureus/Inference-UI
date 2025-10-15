# Inference UI - Marketing Website

The official marketing website for Inference UI, built with Next.js 15, React 19, and Tailwind CSS.

## Features

- **Next.js 15** with App Router
- **React 19** for modern React features
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **TypeScript** for type safety
- **Cloudflare Pages** deployment ready

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) to view the website.

## Project Structure

```
website/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── features/          # Features page
│   ├── pricing/           # Pricing page
│   ├── contact/           # Contact page
│   ├── about/             # About page
│   ├── blog/              # Blog
│   └── legal/             # Legal pages
├── components/
│   ├── ui/                # Reusable UI components
│   ├── sections/          # Page sections (Header, Footer)
│   └── forms/             # Form components
├── lib/                   # Utilities and helpers
├── public/                # Static assets
└── styles/                # Global styles
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server on port 3002
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check
```

## Deployment

### Cloudflare Pages

The site is configured for Cloudflare Pages deployment with static export.

1. **Build Command**: `npm run build`
2. **Output Directory**: `out`
3. **Environment Variables**: None required

### Manual Deployment

```bash
# Build the site
npm run build

# The output will be in the `out` directory
# Upload to your hosting provider
```

## Environment Variables

No environment variables are required for the marketing website.

## Customization

### Brand Colors

Edit `tailwind.config.ts` to customize the brand colors:

```typescript
colors: {
  brand: {
    50: '#f0f9ff',
    // ...
    900: '#0c4a6e',
  },
}
```

### Content

- **Home Page**: `app/page.tsx`
- **Pricing**: `app/pricing/page.tsx`
- **Features**: `app/features/page.tsx`
- **Contact**: `app/contact/page.tsx`

## Performance

- **Lighthouse Score**: 95+ (expected)
- **First Load JS**: <100KB
- **Build Time**: <30s

## Tech Stack

- **Framework**: Next.js 15.1
- **React**: 19.0
- **TypeScript**: 5.7
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Animations**: Framer Motion 11.15

## License

MIT © 2025 Inference UI

## Links

- **Docs**: https://docs.inferenceui.com
- **GitHub**: https://github.com/Neureus/Inference-UI
- **Main Project**: ../

---

Built with ❤️ by the Inference UI team
