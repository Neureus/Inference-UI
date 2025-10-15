import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Shield, Zap, Globe, Code, TrendingUp, Lock, Cpu, BarChart3, Layers, Workflow, Sparkles } from "lucide-react"

export default function FeaturesPage() {
  const features = [
    { icon: Brain, title: "AI-Native Components", description: "Every component includes built-in AI capabilities for smart validation, autocomplete, and adaptive UX" },
    { icon: Shield, title: "Privacy-First", description: "Local AI processing by default with optional cloud enhancement. Your data stays on device" },
    { icon: Zap, title: "Blazing Fast", description: "<100ms local AI latency. Edge compute for advanced features with <500ms response time" },
    { icon: Globe, title: "Cross-Platform", description: "Unified components for React Native, React, Vue, and more. Write once, run everywhere" },
    { icon: Code, title: "Developer Experience", description: "TypeScript-first with excellent IntelliSense and comprehensive documentation" },
    { icon: TrendingUp, title: "Built-in Analytics", description: "Zero-configuration event intelligence with AI-powered insights" },
    { icon: Lock, title: "Local Processing", description: "TensorFlow Lite models run on-device for maximum privacy and speed" },
    { icon: Cpu, title: "Edge AI", description: "Cloudflare Workers AI at 180+ edge locations for advanced capabilities" },
    { icon: BarChart3, title: "Real-time Insights", description: "Analytics Engine for time-series data and real-time dashboards" },
    { icon: Layers, title: "Component Library", description: "25+ production-ready components with AI enhancements" },
    { icon: Workflow, title: "Flow Engine", description: "Declarative UX flows for multi-step experiences" },
    { icon: Sparkles, title: "AI Code Generation", description: "Generate components and flows using natural language" },
  ]

  return (
    <div className="container mx-auto px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl text-center mb-16">
        <h1 className="mb-6 text-5xl font-bold text-gray-900">Powerful Features</h1>
        <p className="text-xl text-gray-600">
          Everything you need to build intelligent, adaptive user interfaces
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="transition-all hover:scale-105 hover:shadow-xl">
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
        ))}
      </div>
    </div>
  )
}
