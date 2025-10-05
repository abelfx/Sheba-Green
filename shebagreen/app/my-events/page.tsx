"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Leaf, Trash2, MapPin, Calendar, CheckCircle2, Clock, XCircle, Upload } from "lucide-react"
import type { Event } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    // Load events from localStorage
    const storedEvents = JSON.parse(localStorage.getItem("shebagreen_events") || "[]")
    setEvents(storedEvents)
  }, [])

  const getStatusBadge = (status: Event["status"]) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold font-heading mb-2">My Events</h1>
                <p className="text-muted-foreground">Track your submitted events and their verification status</p>
              </div>
              <Button asChild>
                <Link href="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New
                </Link>
              </Button>
            </div>

            {/* Events List */}
            {events.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    Start making an impact by uploading your first cleanup or tree planting event.
                  </p>
                  <Button asChild>
                    <Link href="/upload">Upload Your First Event</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Event Image */}
                        {event.images[0] && (
                          <div className="relative w-full md:w-48 h-48 flex-shrink-0">
                            <Image
                              src={event.images[0] || "/placeholder.svg"}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* Event Details */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`rounded-full p-2 ${
                                  event.type === "cleanup" ? "bg-primary/10" : "bg-accent/10"
                                }`}
                              >
                                {event.type === "cleanup" ? (
                                  <Trash2 className="h-5 w-5 text-primary" />
                                ) : (
                                  <Leaf className="h-5 w-5 text-accent" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{event.title}</h3>
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                              </div>
                            </div>
                            {getStatusBadge(event.status)}
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Impact Metrics */}
                          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
                            {event.impact.wasteCollected && (
                              <div className="flex items-center gap-2 text-sm">
                                <Trash2 className="h-4 w-4 text-primary" />
                                <span className="font-medium">{event.impact.wasteCollected}kg</span>
                                <span className="text-muted-foreground">waste collected</span>
                              </div>
                            )}
                            {event.impact.trees && (
                              <div className="flex items-center gap-2 text-sm">
                                <Leaf className="h-4 w-4 text-primary" />
                                <span className="font-medium">{event.impact.trees}</span>
                                <span className="text-muted-foreground">trees planted</span>
                              </div>
                            )}
                            {event.tokensEarned && event.status === "verified" && (
                              <div className="flex items-center gap-1 text-sm font-medium text-primary ml-auto">
                                <span className="text-lg">🪙</span>
                                <span>+{event.tokensEarned} tokens</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
