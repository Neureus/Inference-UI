import React from 'react';
import { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 700, fontSize: '1.5rem' }}>Velvet</span>,
  project: {
    link: 'https://github.com/velvet-ui/velvet',
  },
  docsRepositoryBase: 'https://github.com/velvet-ui/velvet/tree/main/docs',
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{' '}
        <a href="https://velvet.dev" target="_blank">
          Velvet
        </a>
        . AI-Native UI Components.
      </span>
    ),
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Velvet',
    };
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Velvet" />
      <meta
        property="og:description"
        content="AI-Native UI component library for React Native and Web"
      />
    </>
  ),
  primaryHue: 265,
  sidebar: {
    titleComponent({ title, type }) {
      if (type === 'separator') {
        return <div style={{ fontWeight: 'bold', marginTop: '1.5rem' }}>{title}</div>;
      }
      return <>{title}</>;
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    backToTop: true,
  },
  navigation: {
    prev: true,
    next: true,
  },
  editLink: {
    text: 'Edit this page on GitHub →',
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback',
  },
  banner: {
    key: 'velvet-v1',
    text: (
      <a href="/docs/getting-started" target="_blank">
        🎉 Velvet v1 is in development. Read more →
      </a>
    ),
  },
};

export default config;
