"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { User, Mail, Calendar, Award, Leaf, Trash2, TrendingUp, LogOut, Edit, Save, X, AlertTriangle, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { auth } from "@/lib/firebase"

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [showHederaDialog, setShowHederaDialog] = useState(false)
  const [hederaAccountId, setHederaAccountId] = useState("")
  const [evmAddress, setEvmAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // Check if Hedera account is complete
  const isHederaComplete = user?.hederaAccountId && user?.evmAddress

  const handleSave = async () => {
    if (displayName.trim()) {
      await updateUser({ displayName: displayName.trim() })
      setIsEditing(false)
    }
  }

  const handleHederaSubmit = async () => {
    if (!hederaAccountId.trim() || !evmAddress.trim()) {
      setSubmitError("Please fill in both Hedera Account ID and EVM Address")
      return
    }

    // Basic validation for Hedera Account ID format (0.0.xxxxx)
    if (!/^0\.0\.\d+$/.test(hederaAccountId.trim())) {
      setSubmitError("Invalid Hedera Account ID format. Should be like 0.0.123456")
      return
    }

    // Basic validation for EVM address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(evmAddress.trim())) {
      setSubmitError("Invalid EVM Address format. Should be a 42-character hexadecimal string starting with 0x")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Get Firebase ID token
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      const idToken = await currentUser.getIdToken()

      // Call the API endpoint
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          displayName: user?.displayName,
          hederaAccountId: hederaAccountId.trim(),
          evmAddress: evmAddress.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update Hedera account')
      }

      const updatedUser = await response.json()
      console.log('Hedera account linked successfully:', updatedUser)

      // Update local user state
      await updateUser({
        hederaAccountId: updatedUser.hederaAccountId,
        evmAddress: updatedUser.evmAddress,
        did: updatedUser.did,
      })

      setShowHederaDialog(false)
      setHederaAccountId("")
      setEvmAddress("")

    } catch (error: any) {
      console.error('Hedera account update failed:', error)
      setSubmitError(error.message || 'Failed to update Hedera account')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const joinedDate = user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "N/A"

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold font-heading mb-2">My Profile</h1>
              <p className="text-muted-foreground">Manage your account and view your achievements</p>
            </div>

            {/* Hedera Account Warning */}
            {!isHederaComplete && (
              <Alert className="mb-6 border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Your Hedera account setup is incomplete.{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-orange-800 underline"
                    onClick={() => setShowHederaDialog(true)}
                  >
                    Tap to complete.
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Profile Card */}
              <Card className="lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
                      <AvatarImage src={user?.photoURL || "/placeholder.svg"} alt={user?.displayName} />
                      <AvatarFallback className="text-2xl">{user?.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>

                    {isEditing ? (
                      <div className="w-full space-y-3 mb-4">
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Display Name"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSave} className="flex-1">
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false)
                              setDisplayName(user?.displayName || "")
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold mb-1">{user?.displayName}</h2>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="mb-4">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Name
                        </Button>
                      </>
                    )}

                    <Badge className="mb-4">
                      <Award className="mr-1 h-3 w-3" />
                      Level {user?.level}
                    </Badge>

                    <div className="w-full space-y-3 text-left">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{user?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Joined {joinedDate}</span>
                      </div>
                    </div>

                    <Button variant="destructive" className="w-full mt-6" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats & Achievements */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Impact Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-sm font-medium">Eco Tokens</p>
                        </div>
                        <p className="text-2xl font-bold text-primary">{user?.ecoTokens.toLocaleString()}</p>
                      </div>

                      <div className="p-4 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Award className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-sm font-medium">Level</p>
                        </div>
                        <p className="text-2xl font-bold">{user?.level}</p>
                      </div>

                      <div className="p-4 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Leaf className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-sm font-medium">Trees Planted</p>
                        </div>
                        <p className="text-2xl font-bold">{user?.totalImpact.trees}</p>
                      </div>

                      <div className="p-4 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Trash2 className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-sm font-medium">Waste Collected</p>
                        </div>
                        <p className="text-2xl font-bold">{user?.totalImpact.wasteCollected.toFixed(1)}kg</p>
                      </div>

                      <div className="p-4 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-sm font-medium">Total Events</p>
                        </div>
                        <p className="text-2xl font-bold">{user?.totalImpact.cleanups}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {/* First Event */}
                      <div className="p-4 rounded-lg border border-border text-center bg-primary/5">
                        <div className="text-3xl mb-2">🎯</div>
                        <p className="font-semibold text-sm">First Event</p>
                        <p className="text-xs text-muted-foreground">Upload your first event</p>
                      </div>

                      {/* Tree Planter */}
                      {(user?.totalImpact.trees || 0) >= 10 && (
                        <div className="p-4 rounded-lg border border-border text-center bg-primary/5">
                          <div className="text-3xl mb-2">🌳</div>
                          <p className="font-semibold text-sm">Tree Planter</p>
                          <p className="text-xs text-muted-foreground">Plant 10+ trees</p>
                        </div>
                      )}

                      {/* Cleanup Hero */}
                      {(user?.totalImpact.wasteCollected || 0) >= 50 && (
                        <div className="p-4 rounded-lg border border-border text-center bg-primary/5">
                          <div className="text-3xl mb-2">♻️</div>
                          <p className="font-semibold text-sm">Cleanup Hero</p>
                          <p className="text-xs text-muted-foreground">Collect 50kg+ waste</p>
                        </div>
                      )}

                      {/* Token Collector */}
                      {(user?.ecoTokens || 0) >= 1000 && (
                        <div className="p-4 rounded-lg border border-border text-center bg-primary/5">
                          <div className="text-3xl mb-2">💰</div>
                          <p className="font-semibold text-sm">Token Collector</p>
                          <p className="text-xs text-muted-foreground">Earn 1000+ tokens</p>
                        </div>
                      )}

                      {/* Level Up */}
                      {(user?.level || 0) >= 5 && (
                        <div className="p-4 rounded-lg border border-border text-center bg-primary/5">
                          <div className="text-3xl mb-2">⭐</div>
                          <p className="font-semibold text-sm">Rising Star</p>
                          <p className="text-xs text-muted-foreground">Reach Level 5</p>
                        </div>
                      )}

                      {/* Locked Achievement */}
                      <div className="p-4 rounded-lg border border-dashed border-border text-center opacity-50">
                        <div className="text-3xl mb-2">🔒</div>
                        <p className="font-semibold text-sm">More to come</p>
                        <p className="text-xs text-muted-foreground">Keep contributing!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Hedera Account Completion Dialog */}
      <Dialog open={showHederaDialog} onOpenChange={setShowHederaDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Your Hedera Account</DialogTitle>
            <DialogDescription>
              Link your Hedera account to enable decentralized features and earn rewards.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="hedera-account">Hedera Account ID</Label>
              <Input
                id="hedera-account"
                placeholder="0.0.123456"
                value={hederaAccountId}
                onChange={(e) => setHederaAccountId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your Hedera account ID in the format 0.0.xxxxx
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="evm-address">EVM Address</Label>
              <Input
                id="evm-address"
                placeholder="0x1234567890abcdef1234567890abcdef12345678"
                value={evmAddress}
                onChange={(e) => setEvmAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your EVM-compatible address for smart contract interactions
              </p>
            </div>
            {submitError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {submitError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowHederaDialog(false)
                setHederaAccountId("")
                setEvmAddress("")
                setSubmitError("")
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleHederaSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Linking..." : "Link Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
