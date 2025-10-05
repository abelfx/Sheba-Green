"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Leaf, Trash2, Upload, Loader2, CheckCircle2, ImageIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { Event } from "@/lib/types"

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form state
  const [eventType, setEventType] = useState<"cleanup" | "reforestation">("cleanup")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [wasteCollected, setWasteCollected] = useState("")
  const [treesPlanted, setTreesPlanted] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Calculate tokens based on impact
    let tokensEarned = 0
    if (eventType === "cleanup") {
      tokensEarned = Math.round(Number.parseFloat(wasteCollected) * 10)
    } else {
      tokensEarned = Math.round(Number.parseInt(treesPlanted) * 50)
    }

    // Create event object
    const newEvent: Event = {
      id: `event_${Date.now()}`,
      userId: user?.id || "",
      userName: user?.displayName || "",
      userPhoto: user?.photoURL,
      type: eventType,
      title,
      description,
      location,
      date: new Date().toISOString(),
      images: imagePreview ? [imagePreview] : [],
      status: "verified", // Auto-verify for demo
      impact:
        eventType === "cleanup"
          ? { wasteCollected: Number.parseFloat(wasteCollected) }
          : { trees: Number.parseInt(treesPlanted) },
      tokensEarned,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    // Store in localStorage
    const events = JSON.parse(localStorage.getItem("shebagreen_events") || "[]")
    events.unshift(newEvent)
    localStorage.setItem("shebagreen_events", JSON.stringify(events))

    // Update user tokens and impact
    if (user) {
      const updatedUser = {
        ...user,
        ecoTokens: user.ecoTokens + tokensEarned,
        totalImpact: {
          ...user.totalImpact,
          cleanups: eventType === "cleanup" ? user.totalImpact.cleanups + 1 : user.totalImpact.cleanups,
          trees:
            eventType === "reforestation"
              ? user.totalImpact.trees + Number.parseInt(treesPlanted)
              : user.totalImpact.trees,
          wasteCollected:
            eventType === "cleanup"
              ? user.totalImpact.wasteCollected + Number.parseFloat(wasteCollected)
              : user.totalImpact.wasteCollected,
        },
      }

      // Update user in auth context
      const users = JSON.parse(localStorage.getItem("shebagreen_users") || "{}")
      users[user.email] = updatedUser
      localStorage.setItem("shebagreen_users", JSON.stringify(users))
      localStorage.setItem("shebagreen_current_user", JSON.stringify(updatedUser))
    }

    setLoading(false)
    setSuccess(true)

    // Redirect after success
    setTimeout(() => {
      router.push("/my-events")
    }, 2000)
  }

  if (success) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-muted/30">
          <Navbar />
          <main className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-primary/10 p-6">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold font-heading mb-4">Event Submitted!</h1>
              <p className="text-muted-foreground mb-6">
                Your event has been verified and tokens have been added to your wallet.
              </p>
              <Button onClick={() => router.push("/my-events")}>View My Events</Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold font-heading mb-2">Upload Event</h1>
              <p className="text-muted-foreground">Share your environmental impact with the community</p>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Fill in the details of your cleanup or tree planting event</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Event Type */}
                  <div className="space-y-3">
                    <Label>Event Type</Label>
                    <RadioGroup value={eventType} onValueChange={(value) => setEventType(value as any)}>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="cleanup" id="cleanup" />
                        <Label htmlFor="cleanup" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Trash2 className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Cleanup Event</p>
                            <p className="text-xs text-muted-foreground">Beach, park, or community cleanup</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="reforestation" id="reforestation" />
                        <Label htmlFor="reforestation" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Leaf className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Tree Planting</p>
                            <p className="text-xs text-muted-foreground">Reforestation or urban greening</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Beach cleanup at Marina Bay"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your event..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={4}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Marina Bay, Singapore"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>

                  {/* Impact Metrics */}
                  {eventType === "cleanup" ? (
                    <div className="space-y-2">
                      <Label htmlFor="waste">Waste Collected (kg)</Label>
                      <Input
                        id="waste"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 15.5"
                        value={wasteCollected}
                        onChange={(e) => setWasteCollected(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">You'll earn 10 tokens per kg collected</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="trees">Trees Planted</Label>
                      <Input
                        id="trees"
                        type="number"
                        placeholder="e.g., 10"
                        value={treesPlanted}
                        onChange={(e) => setTreesPlanted(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">You'll earn 50 tokens per tree planted</p>
                    </div>
                  )}

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="image">Event Photo</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        required
                      />
                      <label htmlFor="image" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="space-y-2">
                            <img
                              src={imagePreview || "/placeholder.svg"}
                              alt="Preview"
                              className="max-h-48 mx-auto rounded-lg"
                            />
                            <p className="text-sm text-muted-foreground">Click to change image</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="text-sm font-medium">Click to upload image</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Submit Event
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
