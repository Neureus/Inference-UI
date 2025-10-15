import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, Calendar } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center mb-12">
        <h1 className="mb-6 text-5xl font-bold text-gray-900">Get in Touch</h1>
        <p className="text-xl text-gray-600">
          Ready to build intelligent UIs? Let's talk about how Inference UI can help your team.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-12">
        <Card>
          <CardHeader>
            <Mail className="h-8 w-8 text-brand-600 mb-2" />
            <CardTitle>Email Us</CardTitle>
            <CardDescription>
              General inquiries and support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="mailto:hello@inferenceui.com" className="text-brand-600 hover:underline">
              hello@inferenceui.com
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MessageSquare className="h-8 w-8 text-brand-600 mb-2" />
            <CardTitle>Join Discord</CardTitle>
            <CardDescription>
              Community support and discussions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="https://discord.gg/inferenceui" className="text-brand-600 hover:underline">
              Join our Discord
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Calendar className="h-8 w-8 text-brand-600 mb-2" />
            <CardTitle>Schedule Demo</CardTitle>
            <CardDescription>
              Book a personalized walkthrough
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="https://cal.com/inferenceui" className="text-brand-600 hover:underline">
              Book a meeting
            </a>
          </CardContent>
        </Card>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
          <CardDescription>
            Fill out the form below and we'll get back to you within 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
