import Link from "next/link"
import { Zap, Github, Twitter, DiscIcon as Discord, FileText, Code, Wrench } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-6 w-6 text-emerald-400" />
              <span className="font-orbitron text-lg font-bold neon-text">Stream Fund</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Democratizing creator economy investments through AI-powered yield farming on Metis blockchain.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Platform</h3>
            <div className="space-y-2">
              <Link href="/creator" className="block text-zinc-400 hover:text-emerald-400 text-sm transition-colors">
                Creator Hub
              </Link>
              <Link
                href="/marketplace"
                className="block text-zinc-400 hover:text-emerald-400 text-sm transition-colors"
              >
                Marketplace
              </Link>
              <Link href="/dashboard" className="block text-zinc-400 hover:text-emerald-400 text-sm transition-colors">
                Dashboard
              </Link>
              <Link
                href="/engines"
                className="block text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center"
              >
                <Wrench className="h-3 w-3 mr-1" />
                Engine Hub
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Resources</h3>
            <div className="space-y-2">
              <Link
                href="/docs"
                className="block text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center"
              >
                <FileText className="h-3 w-3 mr-1" />
                Documentation
              </Link>
              <Link href="/about" className="block text-zinc-400 hover:text-emerald-400 text-sm transition-colors">
                About
              </Link>
              <Link
                href="https://github.com/streamfund"
                className="block text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center"
              >
                <Code className="h-3 w-3 mr-1" />
                Smart Contracts
              </Link>
              <a href="#" className="block text-zinc-400 hover:text-emerald-400 text-sm transition-colors">
                Whitepaper
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Community</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center"
              >
                <Twitter className="h-3 w-3 mr-1" />
                Twitter
              </a>
              <a
                href="#"
                className="block text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center"
              >
                <Discord className="h-3 w-3 mr-1" />
                Discord
              </a>
              <a
                href="#"
                className="block text-zinc-400 hover:text-emerald-400 text-sm transition-colors flex items-center"
              >
                <Github className="h-3 w-3 mr-1" />
                GitHub
              </a>
              <a href="#" className="block text-zinc-400 hover:text-emerald-400 text-sm transition-colors">
                Telegram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-400 text-sm">© 2024 Stream Fund. Built on Metis blockchain.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-xs text-zinc-500">Powered by</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-pink-400 rounded-full"></div>
              <span className="text-xs font-mono text-emerald-400">Metis</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
