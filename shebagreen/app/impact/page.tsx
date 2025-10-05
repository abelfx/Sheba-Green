import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Leaf, Users, TreePine, Trash2, Award, TrendingUp, ArrowRight } from "lucide-react"

export default function ImpactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
            <TrendingUp className="h-4 w-4" />
            Community Impact
          </div>
          <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl">
            Together, we're making a real difference
          </h1>
          <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl leading-relaxed">
            See the collective environmental impact our community has achieved through verified cleanups and
            reforestation events.
          </p>
        </div>
      </section>

      {/* Main Stats Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">10,234</div>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="text-primary font-medium">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Trees Planted</CardTitle>
                <TreePine className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">52,847</div>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="text-primary font-medium">+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Waste Collected</CardTitle>
                <Trash2 className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">103.5T</div>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="text-primary font-medium">+15%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tokens Distributed</CardTitle>
                <Award className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">2.5M</div>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="text-primary font-medium">+10%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Impact Breakdown */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Impact by Category</h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Breaking down our environmental contributions
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <TreePine className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Reforestation</CardTitle>
                    <p className="text-sm text-muted-foreground">Community tree planting events</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Events</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Trees Planted</span>
                    <span className="font-semibold">52,847</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Participants</span>
                    <span className="font-semibold">8,432</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tokens Earned</span>
                    <span className="font-semibold">1.2M</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Trash2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Cleanup Events</CardTitle>
                    <p className="text-sm text-muted-foreground">Community waste collection</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Events</span>
                    <span className="font-semibold">2,891</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Waste Collected</span>
                    <span className="font-semibold">103.5 Tons</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Participants</span>
                    <span className="font-semibold">9,876</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tokens Earned</span>
                    <span className="font-semibold">1.3M</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Top Contributors */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Top Contributors</h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Celebrating our most active community members
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Card className="border-2">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {[
                  { rank: 1, name: "Sarah Johnson", tokens: 12450, events: 47 },
                  { rank: 2, name: "Michael Chen", tokens: 11230, events: 42 },
                  { rank: 3, name: "Emma Williams", tokens: 10890, events: 39 },
                  { rank: 4, name: "David Martinez", tokens: 9870, events: 36 },
                  { rank: 5, name: "Lisa Anderson", tokens: 9340, events: 34 },
                ].map((contributor) => (
                  <div key={contributor.rank} className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        {contributor.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{contributor.name}</p>
                        <p className="text-sm text-muted-foreground">{contributor.events} events completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{contributor.tokens.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">tokens</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Leaf className="mx-auto h-16 w-16 text-primary mb-6" />
            <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Start tracking your impact today
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Join thousands of community members making a measurable difference
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="text-base" asChild>
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base bg-transparent" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
