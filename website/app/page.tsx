"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Brain,
  Zap,
  Shield,
  Globe,
  Code,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Cpu,
  BarChart3,
} from "lucide-react"
import { motion } from "framer-motion"

export default function HomePage() {
  const features = [
    {
      icon: Brain,
      title: "AI-Native Components",
      description: "Every component includes built-in AI capabilities for smart validation, autocomplete, and adaptive UX.",
    },
    {
      icon: Shield,
      title: "Privacy-First",
      description: "Local AI processing by default with optional cloud enhancement. Your data stays on device.",
    },
    {
      icon: Zap,
      title: "Blazing Fast",
      description: "<100ms local AI latency. Edge compute for advanced features with <500ms response time.",
    },
    {
      icon: Globe,
      title: "Cross-Platform",
      description: "Unified components for React Native, React, Vue, and more. Write once, run everywhere.",
    },
    {
      icon: Code,
      title: "Developer Experience",
      description: "TypeScript-first with excellent IntelliSense, comprehensive docs, and AI-powered code generation.",
    },
    {
      icon: TrendingUp,
      title: "Built-in Analytics",
      description: "Zero-configuration event intelligence with AI-powered insights and real-time dashboards.",
    },
  ]

  const stats = [
    { label: "GitHub Stars", value: "10K+" },
    { label: "Weekly Downloads", value: "100K+" },
    { label: "Production Apps", value: "500+" },
    { label: "AI Inferences", value: "10M+" },
  ]

  const benefits = [
    "Smart validation with real-time AI feedback",
    "Intelligent autocomplete powered by local models",
    "Adaptive UX that learns from user behavior",
    "Automatic accessibility suggestions",
    "Privacy-first with local processing",
    "98%+ gross margins with Cloudflare edge",
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-brand-50 to-brand-100 py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700">
              <Sparkles className="h-4 w-4" />
              World's First AI-Native UI Library
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 lg:text-7xl">
              Build Intelligent UIs
              <span className="block bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                with AI-Powered Components
              </span>
            </h1>
            <p className="mb-10 text-xl text-gray-600 lg:text-2xl">
              Every component includes built-in AI capabilities. Create adaptive, intelligent interfaces that learn from users while keeping data private.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/contact">
                <Button size="lg" className="text-lg px-8">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://docs.inferenceui.com">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  View Documentation
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-600">
              {benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-600" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-24 right-0 -z-10 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-brand-300/20 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="border-y bg-white py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-brand-600">{stat.value}</div>
                <div className="mt-2 text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
              Everything You Need to Build AI-Native UIs
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Powerful features designed for modern developers building intelligent applications
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full transition-all hover:scale-105 hover:shadow-xl">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100">
                      <feature.icon className="h-6 w-6 text-brand-600" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-6 text-4xl font-bold text-gray-900">
                Hybrid AI Architecture
              </h2>
              <p className="mb-8 text-lg text-gray-600">
                Intelligent routing between local TFLite and Cloudflare Workers AI ensures optimal performance, privacy, and cost efficiency.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">Local AI (TFLite)</h3>
                    <p className="text-gray-600">
                      Privacy-first, offline-capable, zero-cost processing for sensitive operations.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <Cpu className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">Edge AI (Workers AI)</h3>
                    <p className="text-gray-600">
                      GPU-powered inference at 180+ edge locations for advanced AI capabilities.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">98%+ Gross Margins</h3>
                    <p className="text-gray-600">
                      Cloudflare edge architecture enables industry-leading economics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600">Local AI Latency</span>
                      <span className="font-semibold text-green-600">&lt;100ms</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full w-[15%] bg-green-500"></div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600">Edge AI Latency</span>
                      <span className="font-semibold text-blue-600">&lt;500ms</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full w-[40%] bg-blue-500"></div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600">Privacy Score</span>
                      <span className="font-semibold text-purple-600">100%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full w-full bg-purple-500"></div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600">Gross Margin</span>
                      <span className="font-semibold text-orange-600">98%+</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full w-[98%] bg-orange-500"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-700 py-20 lg:py-32">
        <div className="container mx-auto px-6 text-center lg:px-8">
          <h2 className="mb-6 text-4xl font-bold text-white lg:text-5xl">
            Ready to Build Intelligent UIs?
          </h2>
          <p className="mb-10 text-xl text-brand-100">
            Join developers building the future of AI-native applications
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white/10">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
