"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, X } from "lucide-react"

export default function PricingPage() {
  const tiers = [
    {
      name: "Open Source",
      price: "Free",
      description: "Perfect for getting started with AI-native components",
      features: [
        "Core library with basic AI features",
        "Local processing only",
        "Essential templates",
        "Community support",
        "MIT License",
        "Unlimited projects",
      ],
      notIncluded: [
        "Enhanced AI models",
        "Advanced code generation",
        "Premium integrations",
        "Priority support",
      ],
      cta: "Get Started",
      href: "https://docs.inferenceui.com",
      highlighted: false,
    },
    {
      name: "Developer",
      price: "$29",
      period: "/month",
      description: "Enhanced AI capabilities for professional developers",
      features: [
        "Everything in Open Source",
        "Enhanced AI models",
        "Advanced code generation",
        "Premium integrations",
        "Priority email support",
        "Early access to new features",
      ],
      notIncluded: [
        "Advanced analytics",
        "Real-time optimization",
        "SLA",
      ],
      cta: "Start Free Trial",
      href: "/contact?plan=developer",
      highlighted: true,
    },
    {
      name: "Business",
      price: "$199",
      period: "/month",
      description: "For teams building production applications",
      features: [
        "Everything in Developer",
        "Advanced analytics dashboard",
        "Real-time optimization",
        "Unlimited events",
        "99.9% SLA",
        "Phone & video support",
        "Custom integrations",
      ],
      notIncluded: [],
      cta: "Contact Sales",
      href: "/contact?plan=business",
      highlighted: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for large organizations",
      features: [
        "Everything in Business",
        "Private cloud deployment",
        "On-premises options",
        "Custom AI models",
        "Compliance features (SOC 2, HIPAA)",
        "Dedicated account manager",
        "Custom SLA",
        "Training & onboarding",
      ],
      notIncluded: [],
      cta: "Contact Sales",
      href: "/contact?plan=enterprise",
      highlighted: false,
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-gradient-to-br from-white via-brand-50 to-brand-100 py-20">
        <div className="container mx-auto px-6 text-center lg:px-8">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 lg:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Choose the plan that's right for you. All plans include access to our AI-native component library.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier, index) => (
              <Card
                key={index}
                className={`flex flex-col ${
                  tier.highlighted
                    ? "border-brand-500 shadow-2xl ring-2 ring-brand-500"
                    : ""
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-gray-600">{tier.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {tier.notIncluded.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3 opacity-40">
                        <X className="h-5 w-5 flex-shrink-0 text-gray-400" />
                        <span className="text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={tier.href} className="w-full">
                    <Button
                      className="w-full"
                      variant={tier.highlighted ? "default" : "outline"}
                      size="lg"
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Can I switch plans later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept all major credit cards (Visa, Mastercard, American Express) and offer annual billing with a 20% discount.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! All paid plans include a 14-day free trial. No credit card required to start.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
