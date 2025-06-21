"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Zap, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConnectWalletModal } from "@/components/connect-wallet-modal"

export function Navigation() {
  const pathname = usePathname()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/creator", label: "Creator" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/about", label: "About" },
    { href: "/docs", label: "Docs" },
  ]

  const handleWalletConnect = (wallet: any) => {
    setConnectedWallet(wallet)
    setIsWalletModalOpen(false)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-emerald-400" />
              <span className="font-orbitron text-xl font-bold neon-text">Stream Fund</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-emerald-400",
                    pathname === item.href ? "text-emerald-400" : "text-zinc-400",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Wallet Button */}
            <div className="hidden md:block">
              {connectedWallet ? (
                <div className="flex items-center space-x-3">
                  <Badge className="bg-green-500/20 text-green-400 px-3 py-1">🟢 Connected</Badge>
                  <div className="text-right">
                    <div className="font-mono text-xs text-emerald-400">{connectedWallet.balance}</div>
                    <div className="font-mono text-xs text-zinc-400">
                      {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-pink-500 hover:from-emerald-600 hover:to-pink-600 font-orbitron"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-zinc-800">
              <div className="flex flex-col space-y-3 mt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-emerald-400 px-2 py-1",
                      pathname === item.href ? "text-emerald-400" : "text-zinc-400",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="pt-3 border-t border-zinc-800">
                  {connectedWallet ? (
                    <div className="px-2">
                      <Badge className="bg-green-500/20 text-green-400 mb-2">🟢 Connected</Badge>
                      <div className="text-xs text-zinc-400">
                        {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setIsWalletModalOpen(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-pink-500 hover:from-emerald-600 hover:to-pink-600 font-orbitron"
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <ConnectWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />
    </>
  )
}
