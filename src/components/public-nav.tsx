"use client"

import { useState } from "react"
import Link from "next/link"
import { ShieldCheck, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/updates", label: "Updates" },
]

export function PublicHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-brand-teal" />
          <span className="text-lg font-bold text-brand-navy">Cyber Trust Nest</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-600 hover:text-brand-navy transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started free</Button>
          </Link>
        </div>
        <button
          className="md:hidden p-2 text-brand-navy"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <div className={cn("md:hidden border-t border-border bg-white", open ? "block" : "hidden")}>
        <div className="px-4 py-3 space-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-2 py-2 text-sm font-medium text-gray-600 hover:text-brand-navy"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">Log in</Button>
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)} className="flex-1">
              <Button size="sm" className="w-full">Get started free</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border py-10 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-brand-teal" />
              <span className="text-sm font-semibold text-brand-navy">
                Cyber Trust Nest
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your virtual GRC officer for Nigerian SMBs. Practical guidance — confirm filings with licensed counsel or your DPCO.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-brand-navy mb-3 uppercase tracking-wide">Product</p>
            <div className="space-y-2 text-sm text-gray-500">
              <Link href="/services" className="block hover:text-brand-navy">Services</Link>
              <Link href="/signup" className="block hover:text-brand-navy">Get started</Link>
              <Link href="/login" className="block hover:text-brand-navy">Log in</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-brand-navy mb-3 uppercase tracking-wide">Company</p>
            <div className="space-y-2 text-sm text-gray-500">
              <Link href="/about" className="block hover:text-brand-navy">About</Link>
              <Link href="/team" className="block hover:text-brand-navy">Team</Link>
              <Link href="/blog" className="block hover:text-brand-navy">Blog</Link>
              <Link href="/updates" className="block hover:text-brand-navy">Updates</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-brand-navy mb-3 uppercase tracking-wide">Legal</p>
            <div className="space-y-2 text-sm text-gray-500">
              <Link href="/privacy" className="block hover:text-brand-navy">Privacy</Link>
              <Link href="/terms" className="block hover:text-brand-navy">Terms</Link>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center border-t border-border pt-6">
          Practical compliance guidance — confirm filings with licensed counsel or your DPCO.
        </p>
      </div>
    </footer>
  )
}
