import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight, Leaf, Users, Award, TrendingUp, Upload, CheckCircle2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
              <Leaf className="h-4 w-4" />
              Track Your Environmental Impact
            </div>
            <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Make a difference. Get rewarded.
            </h1>
            <p className="text-pretty text-lg text-muted-foreground md:text-xl leading-relaxed">
              Join thousands of community members tracking cleanups, planting trees, and earning eco-tokens for making
              our planet greener.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
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

          {/* Hero Visual */}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent to-primary/10 p-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-full w-full">
                  <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-primary/30 blur-3xl" />
                  <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-accent-green/40 blur-3xl" />
                  <div className="relative flex h-full flex-col items-center justify-center gap-6 text-center">
                    <Leaf className="h-24 w-24 text-primary" strokeWidth={1.5} />
                    <div className="space-y-2">
                      <p className="text-4xl font-bold text-foreground">50K+</p>
                      <p className="text-sm font-medium text-muted-foreground">Trees Planted</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary md:text-5xl">10K+</p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">Active Members</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary md:text-5xl">50K+</p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">Trees Planted</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary md:text-5xl">2.5M</p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">Tokens Earned</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary md:text-5xl">100T</p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">Waste Collected (kg)</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">How ShebaGreen Works</h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Three simple steps to start making an impact and earning rewards
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="border-2 transition-all hover:border-primary hover:shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">1. Upload Your Event</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Share photos and details of your cleanup or tree planting event. Include location, date, and impact
                metrics.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 transition-all hover:border-primary hover:shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">2. Get Verified</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Our community reviews your submission to ensure authenticity. Verification typically takes 24-48 hours.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 transition-all hover:border-primary hover:shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Award className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">3. Earn Rewards</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Receive eco-tokens based on your impact. Use tokens to unlock badges, climb leaderboards, and redeem
                rewards.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Everything you need to track impact
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Powerful features to help you document, verify, and celebrate environmental action
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Community Feed</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                See real-time updates from community members making a difference around the world.
              </p>
            </div>

            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Impact Dashboard</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Track your personal environmental impact with detailed charts and statistics.
              </p>
            </div>

            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Leaderboards</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Compete with others and climb the ranks as you make more environmental impact.
              </p>
            </div>

            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Eco-Tokens</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Earn tokens for verified events and use them to unlock exclusive rewards and badges.
              </p>
            </div>

            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Verification System</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Community-driven verification ensures all events are authentic and impactful.
              </p>
            </div>

            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Easy Upload</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                Simple, intuitive interface to upload photos and details of your environmental events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Ready to make a difference?</h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Join our community today and start tracking your environmental impact
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
      </section>

      <Footer />
    </div>
  )
}
