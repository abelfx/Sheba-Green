"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Leaf, Menu, X } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl">
          <Leaf className="h-6 w-6 text-primary" />
          <span>ShebaGreen</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/home"
                className={`text-sm font-medium hover:text-primary transition-colors ${
                  pathname === "/home" ? "text-primary" : ""
                }`}
              >
                Home
              </Link>
              <Link
                href="/my-events"
                className={`text-sm font-medium hover:text-primary transition-colors ${
                  pathname === "/my-events" ? "text-primary" : ""
                }`}
              >
                My Events
              </Link>
              <Link
                href="/leaderboard"
                className={`text-sm font-medium hover:text-primary transition-colors ${
                  pathname === "/leaderboard" ? "text-primary" : ""
                }`}
              >
                Leaderboard
              </Link>
              <Link
                href="/wallet"
                className={`text-sm font-medium hover:text-primary transition-colors ${
                  pathname === "/wallet" ? "text-primary" : ""
                }`}
              >
                Wallet
              </Link>
              <Link
                href="/profile"
                className={`text-sm font-medium hover:text-primary transition-colors ${
                  pathname === "/profile" ? "text-primary" : ""
                }`}
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/impact" className="text-sm font-medium hover:text-primary transition-colors">
                Impact
              </Link>
            </>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button asChild>
              <Link href="/upload">Upload Event</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {user ? (
              <>
                <Link
                  href="/home"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/my-events"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Events
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leaderboard
                </Link>
                <Link
                  href="/wallet"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wallet
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <div className="pt-2 border-t border-border">
                  <Button className="w-full" asChild>
                    <Link href="/upload" onClick={() => setMobileMenuOpen(false)}>
                      Upload Event
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/impact"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Impact
                </Link>
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <Button variant="ghost" asChild>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
