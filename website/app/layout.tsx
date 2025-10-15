import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/sections/navigation"
import { Footer } from "@/components/sections/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Inference UI - AI-Native UI Component Library",
  description: "Build intelligent, adaptive user interfaces with AI-powered components. Privacy-first, cross-platform, and production-ready.",
  keywords: ["AI", "UI components", "React Native", "React", "AI-native", "Cloudflare", "machine learning"],
  authors: [{ name: "Inference UI Team" }],
  openGraph: {
    title: "Inference UI - AI-Native UI Component Library",
    description: "Build intelligent, adaptive user interfaces with AI-powered components",
    type: "website",
    url: "https://inferenceui.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Inference UI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inference UI - AI-Native UI Component Library",
    description: "Build intelligent, adaptive user interfaces with AI-powered components",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
