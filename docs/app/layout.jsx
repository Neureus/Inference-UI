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
  title: {
    default: 'Velvet – AI-Native UI Components',
    template: '%s – Velvet',
  },
  description: 'AI-Native UI component library for React Native and Web',
  metadataBase: new URL('https://docs.velvet.dev'),
  openGraph: {
    title: 'Velvet',
    description: 'AI-Native UI component library for React Native and Web',
    url: 'https://docs.velvet.dev',
    siteName: 'Velvet Documentation',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Velvet – AI-Native UI Components',
    description: 'AI-Native UI component library for React Native and Web',
  },
};
