"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain } from "lucide-react"

interface AISearchSummaryProps {
  result: {
    query: string
    response: string
    vaultCount: number
    avgAPR: string
    category: string
  } | null
  isVisible: boolean
}

export function AISearchSummary({ result, isVisible }: AISearchSummaryProps) {
  if (!isVisible || !result) return null

  return (
    <Card className="glass rounded-2xl border-blue-500/20 mb-6 animate-in fade-in-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="h-4 w-4 text-blue-400" />
          <span className="font-mono text-sm text-blue-400">🤖 AI Search Summary</span>
        </div>

        <p className="text-sm font-mono text-blue-300 mb-4 bg-zinc-900/50 p-3 rounded-lg">{result.response}</p>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-emerald-500/10 rounded-lg">
            <div className="font-mono text-lg font-bold text-emerald-400">{result.vaultCount}</div>
            <div className="text-xs text-zinc-400">Vaults Found</div>
          </div>
          <div className="text-center p-2 bg-pink-500/10 rounded-lg">
            <div className="font-mono text-lg font-bold text-pink-400">{result.avgAPR}</div>
            <div className="text-xs text-zinc-400">Avg APR</div>
          </div>
          <div className="text-center p-2 bg-purple-500/10 rounded-lg">
            <Badge className="bg-purple-500/20 text-purple-400 text-xs">{result.category}</Badge>
            <div className="text-xs text-zinc-400 mt-1">Category</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
