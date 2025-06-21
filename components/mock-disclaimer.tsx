"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Zap } from "lucide-react"

export function MockDisclaimer() {
  return (
    <Card className="glass rounded-2xl border-yellow-500/20 mb-8">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge className="bg-yellow-500/20 text-yellow-400">
                <Zap className="w-3 h-3 mr-1" />
                Live Simulation
              </Badge>
              <span className="font-mono text-sm text-yellow-400">AdSense Revenue Tokenization Demo</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Stream Fund simulates YouTube AdSense funding scenarios using public channel data. All values are dummy
              but represent real flows in YouTube revenue tokenization. This demonstrates the complete AI-powered
              creator economy protocol.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
