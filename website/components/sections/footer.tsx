import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  const navigation = {
    product: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "Docs", href: "https://docs.inferenceui.com" },
      { name: "Changelog", href: "/blog" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy", href: "/legal/privacy" },
      { name: "Terms", href: "/legal/terms" },
    ],
    social: [
      {
        name: "GitHub",
        href: "https://github.com/Neureus/Inference-UI",
        icon: Github,
      },
      {
        name: "Twitter",
        href: "https://twitter.com/inferenceui",
        icon: Twitter,
      },
      {
        name: "LinkedIn",
        href: "https://linkedin.com/company/inferenceui",
        icon: Linkedin,
      },
    ],
  }

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Logo and Description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-xl">
                I
              </div>
              <span className="text-xl font-bold text-gray-900">Inference UI</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              AI-native UI component library for building intelligent, adaptive interfaces.
            </p>
            <div className="mt-6 flex space-x-4">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-brand-600 transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Product</h3>
            <ul className="mt-4 space-y-3">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-4 space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="mt-4 space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Inference UI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
