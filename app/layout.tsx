import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"
import { EngineNotifications } from "@/components/engine-notifications"

export const metadata: Metadata = {
  title: "Stream Fund - Monetize YouTube Revenue Onchain",
  description: "AI-native Web3 protocol for YouTube creator yield tokens and cross-chain investment vaults",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-mono bg-black text-white antialiased">
        <Navigation />
        <main className="relative">
          {children}
          <Footer />
        </main>
        <Toaster />
        <EngineNotifications />
      </body>
    </html>
  )
}
