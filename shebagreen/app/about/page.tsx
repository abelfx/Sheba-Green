import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Leaf, Target, Eye, Heart, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
            <Leaf className="h-4 w-4" />
            About ShebaGreen
          </div>
          <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl">
            Empowering communities to create a greener future
          </h1>
          <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl leading-relaxed">
            ShebaGreen is a platform that connects environmentally conscious individuals and communities, making it easy
            to track, verify, and celebrate environmental impact.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <Card className="border-2">
              <CardContent className="p-8 md:p-12">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mb-4 text-3xl font-bold">Our Mission</h2>
                <p className="text-pretty leading-relaxed text-muted-foreground">
                  To create a transparent, rewarding ecosystem where every environmental action is documented, verified,
                  and celebrated. We believe that by making impact visible and rewarding positive behavior, we can
                  inspire more people to take action for our planet.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-8 md:p-12">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Eye className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mb-4 text-3xl font-bold">Our Vision</h2>
                <p className="text-pretty leading-relaxed text-muted-foreground">
                  A world where environmental stewardship is the norm, not the exception. Where communities are
                  connected, motivated, and empowered to make measurable positive impact on our planet through
                  collective action and transparent tracking.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - Detailed */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">How ShebaGreen Works</h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            A transparent, community-driven approach to environmental action
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              1
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Document Your Impact</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Whether you're organizing a beach cleanup, planting trees in your neighborhood, or leading a community
                reforestation project, start by documenting your event. Upload photos, add location details, and specify
                the impact metrics like waste collected or trees planted.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              2
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Community Verification</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Your submission enters our community verification process. Other members review the evidence to ensure
                authenticity. This peer-review system maintains the integrity of our platform while keeping the process
                transparent and fair.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              3
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Earn Eco-Tokens</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Once verified, you earn eco-tokens based on the scale and impact of your event. These tokens represent
                your contribution to environmental stewardship and can be used to unlock badges, climb leaderboards, and
                access exclusive rewards.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              4
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Track & Celebrate</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                View your personal impact dashboard to see your cumulative contribution over time. Compare your efforts
                with the community, celebrate milestones, and inspire others to join the movement for a greener planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Our Core Values</h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">The principles that guide everything we do</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center space-y-4">
              <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Community First</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                We believe in the power of collective action. Every feature is designed to strengthen community bonds
                and amplify impact.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Transparency</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                All events are verified by the community. We maintain open, honest tracking of environmental impact with
                no hidden metrics.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Sustainability</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                We're committed to long-term environmental stewardship, not quick fixes. Every action counts toward
                lasting change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Join the movement</h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Be part of a global community making measurable environmental impact
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-base" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base bg-transparent" asChild>
              <Link href="/impact">View Community Impact</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
