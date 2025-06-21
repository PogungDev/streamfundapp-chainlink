"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface YieldData {
  creator: string
  currentAPR: number
  totalYield: number
  lastIncrease: number
  isIncreasing: boolean
}

const initialData: YieldData[] = [
  { creator: "TechGaming Pro", currentAPR: 12.1, totalYield: 0.21, lastIncrease: 0, isIncreasing: false },
  { creator: "MusicMaven", currentAPR: 11.8, totalYield: 0.15, lastIncrease: 0, isIncreasing: false },
  { creator: "EduTech Academy", currentAPR: 9.5, totalYield: 0.32, lastIncrease: 0, isIncreasing: false },
]

export function YieldTrackerLive() {
  const [yieldData, setYieldData] = useState<YieldData[]>(initialData)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setYieldData((prev) =>
        prev.map((vault) => {
          const increase = Math.random() * 0.02 + 0.01 // 0.01-0.03 USDC
          const aprIncrease = Math.random() * 0.1 + 0.05 // 0.05-0.15% APR

          return {
            ...vault,
            currentAPR: vault.currentAPR + aprIncrease,
            totalYield: vault.totalYield + increase,
            lastIncrease: increase,
            isIncreasing: true,
          }
        }),
      )

      // Reset animation after 2 seconds
      setTimeout(() => {
        setYieldData((prev) =>
          prev.map((vault) => ({
            ...vault,
            isIncreasing: false,
          })),
        )
      }, 2000)
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [isActive])

  const totalYield = yieldData.reduce((sum, vault) => sum + vault.totalYield, 0)

  return (
    <Card className="glass rounded-2xl border-emerald-500/20">
      <CardHeader>
        <CardTitle className="font-mono flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-emerald-400" />⏱ Live Yield Tracker
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
            <button
              onClick={() => setIsActive(!isActive)}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300"
            >
              {isActive ? "Pause" : "Resume"}
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Summary */}
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-pink-500/10 rounded-xl">
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-emerald-400">{totalYield.toFixed(3)} USDC</div>
            <div className="text-sm text-zinc-400">Total Yield Earned</div>
          </div>
        </div>

        {/* Individual Vaults */}
        <div className="space-y-3">
          {yieldData.map((vault) => (
            <div
              key={vault.creator}
              className={`p-3 rounded-lg border transition-all duration-500 ${
                vault.isIncreasing ? "border-emerald-400/50 bg-emerald-500/10" : "border-zinc-700 bg-zinc-800/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm font-semibold">{vault.creator}</div>
                  <div className="text-xs text-zinc-400">
                    APR: <span className="text-emerald-400">{vault.currentAPR.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-pink-400">{vault.totalYield.toFixed(3)} USDC</div>
                  {vault.isIncreasing && vault.lastIncrease > 0 && (
                    <Badge className="bg-green-500/20 text-green-400 text-xs animate-bounce">
                      📈 +{vault.lastIncrease.toFixed(3)} USDC
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Auto-update Info */}
        <div className="text-center text-xs text-zinc-500 font-mono">
          🔄 Auto-updating every 10 seconds • Simulated yield accrual
        </div>
      </CardContent>
    </Card>
  )
}
