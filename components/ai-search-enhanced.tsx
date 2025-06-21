"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Brain, Zap } from "lucide-react"

interface SearchResult {
  query: string
  response: string
  vaultCount: number
  avgAPR: string
  category: string
}

const searchResponses: { [key: string]: SearchResult } = {
  gaming: {
    query: "gaming",
    response: "Found 2 vaults with APR 11.8% and 14.2% from gaming category channels.",
    vaultCount: 2,
    avgAPR: "13.0%",
    category: "Gaming",
  },
  "12%": {
    query: "12% APR",
    response: "Found 3 vaults with 11.8%, 12.1%, and 14.2% APR matching your criteria.",
    vaultCount: 3,
    avgAPR: "12.7%",
    category: "Mixed",
  },
  music: {
    query: "music",
    response: "Found 1 vault with 11.8% APR from established music creator.",
    vaultCount: 1,
    avgAPR: "11.8%",
    category: "Music",
  },
  "low risk": {
    query: "low risk",
    response: "Found 2 low-risk vaults with 9.5% and 11.8% APR from verified creators.",
    vaultCount: 2,
    avgAPR: "10.7%",
    category: "Low Risk",
  },
}

interface AISearchEnhancedProps {
  onSearchResult: (result: SearchResult | null) => void
}

export function AISearchEnhanced({ onSearchResult }: AISearchEnhancedProps) {
  const [query, setQuery] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentResult, setCurrentResult] = useState<SearchResult | null>(null)

  // MANUAL search trigger only
  const handleSearch = () => {
    if (!query.trim()) {
      setCurrentResult(null)
      onSearchResult(null)
      return
    }

    setIsProcessing(true)

    setTimeout(() => {
      // Find matching response
      const matchKey = Object.keys(searchResponses).find((key) => query.toLowerCase().includes(key))

      const result = matchKey
        ? searchResponses[matchKey]
        : {
            query: query,
            response: `Found 2 vaults matching "${query}" with average 12.3% APR.`,
            vaultCount: 2,
            avgAPR: "12.3%",
            category: "Mixed",
          }

      setCurrentResult(result)
      onSearchResult(result)
      setIsProcessing(false)
    }, 1500)
  }

  const handleQuickSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    // Don't auto-search, let user click search button
  }

  return (
    <Card className="glass rounded-2xl border-emerald-500/20">
      <CardHeader>
        <CardTitle className="font-mono text-sm flex items-center">
          <Brain className="mr-2 h-4 w-4 text-emerald-400" />🤖 AI Intent Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Cari yield 12% dari channel gaming"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="glass border-emerald-500/30 focus:border-emerald-400 font-mono text-sm"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={isProcessing || !query.trim()}
            size="sm"
            className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
          >
            {isProcessing ? <Zap className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Quick Search Buttons */}
        <div className="space-y-2">
          {[
            { text: "🎮 12% APR Gaming", query: "12% gaming" },
            { text: "🎵 Low Risk Music", query: "low risk music" },
            { text: "📚 Education Vaults", query: "education" },
          ].map((item) => (
            <button
              key={item.query}
              onClick={() => handleQuickSearch(item.query)}
              className="w-full text-xs bg-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg hover:bg-emerald-500/30 transition-colors text-left"
            >
              {item.text}
            </button>
          ))}
        </div>

        {/* AI Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center space-x-2 p-3 bg-blue-500/10 rounded-lg">
            <Zap className="h-4 w-4 text-blue-400 animate-spin" />
            <span className="font-mono text-xs text-blue-400">🧠 AIIntentEngine processing...</span>
          </div>
        )}

        {/* AI Response */}
        {currentResult && !isProcessing && (
          <Card className="glass border-blue-500/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-500/20 text-blue-400">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Analysis
                </Badge>
              </div>

              <p className="text-sm font-mono text-blue-400 bg-zinc-900/50 p-3 rounded-lg">{currentResult.response}</p>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-emerald-500/10 rounded">
                  <div className="font-mono text-emerald-400">{currentResult.vaultCount}</div>
                  <div className="text-zinc-400">Vaults</div>
                </div>
                <div className="text-center p-2 bg-pink-500/10 rounded">
                  <div className="font-mono text-pink-400">{currentResult.avgAPR}</div>
                  <div className="text-zinc-400">Avg APR</div>
                </div>
                <div className="text-center p-2 bg-purple-500/10 rounded">
                  <div className="font-mono text-purple-400">{currentResult.category}</div>
                  <div className="text-zinc-400">Category</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
