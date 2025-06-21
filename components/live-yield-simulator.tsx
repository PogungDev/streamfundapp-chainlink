"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUp, Zap, Play, Pause } from "lucide-react"

interface YieldData {
  creator: string
  currentAPR: number
  baseAPR: number
  yieldAccrued: number
  lastUpdate: number
}

const initialYieldData: YieldData[] = [
  { creator: "TechGaming Pro", currentAPR: 14.2, baseAPR: 14.2, yieldAccrued: 29.75, lastUpdate: Date.now() },
  { creator: "MusicMaven", currentAPR: 11.8, baseAPR: 11.8, yieldAccrued: 9.83, lastUpdate: Date.now() },
  { creator: "EduTech Academy", currentAPR: 9.5, baseAPR: 9.5, yieldAccrued: 39.58, lastUpdate: Date.now() },
  { creator: "DIY Workshop", currentAPR: 13.7, baseAPR: 13.7, yieldAccrued: 8.56, lastUpdate: Date.now() },
]

export function LiveYieldSimulator() {
  const [yieldData, setYieldData] = useState<YieldData[]>(initialYieldData)
  const [isActive, setIsActive] = useState(false) // MANUAL START ONLY
  const [updateCount, setUpdateCount] = useState(0)

  // MANUAL simulation trigger - NO AUTO START
  const runSimulation = () => {
    if (!isActive) return

    setYieldData((prev) =>
      prev.map((vault) => {
        // Random yield increase between 0.1% and 0.3%
        const increase = Math.random() * 0.2 + 0.1
        const newAPR = vault.currentAPR + increase

        // Random yield accrual increase
        const yieldIncrease = Math.random() * 2 + 0.5
        const newYieldAccrued = vault.yieldAccrued + yieldIncrease

        return {
          ...vault,
          currentAPR: newAPR,
          yieldAccrued: newYieldAccrued,
          lastUpdate: Date.now(),
        }
      }),
    )

    setUpdateCount((prev) => prev + 1)
  }

  // MANUAL trigger only
  const handleToggleSimulation = () => {
    setIsActive(!isActive)
    if (!isActive) {
      // Start simulation
      const interval = setInterval(() => {
        runSimulation()
      }, 5000) // Every 5 seconds when active

      // Store interval ID to clear later
      ;(window as any).yieldSimulationInterval = interval
    } else {
      // Stop simulation
      if ((window as any).yieldSimulationInterval) {
        clearInterval((window as any).yieldSimulationInterval)
        delete (window as any).yieldSimulationInterval
      }
    }
  }

  const getTotalYieldIncrease = () => {
    return yieldData.reduce((total, vault) => {
      return total + (vault.currentAPR - vault.baseAPR)
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* Simulator Controls */}
      <Card className="glass rounded-2xl border-emerald-500/20">
        <CardHeader>
          <CardTitle className="font-mono flex items-center">
            <Zap className="mr-2 h-5 w-5 text-emerald-400" />🧪 Live Yield Simulator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
              <span className="font-mono text-sm">{isActive ? "🟢 Simulation Running" : "⚪ Simulation Stopped"}</span>
              {updateCount > 0 && <Badge className="bg-blue-500/20 text-blue-400">{updateCount} updates</Badge>}
            </div>
            <Button
              onClick={handleToggleSimulation}
              variant="outline"
              size="sm"
              className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 font-mono text-xs"
            >
              {isActive ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Stop Simulation
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Simulation
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-emerald-500/10 to-pink-500/10 rounded-lg">
            <div className="text-center">
              <div className="font-mono text-2xl font-bold text-emerald-400">
                +{getTotalYieldIncrease().toFixed(2)}%
              </div>
              <div className="text-sm text-zinc-400">Total APR Increase Since Start</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Yield Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {yieldData.map((vault) => (
          <Card key={vault.creator} className="glass rounded-2xl border-pink-500/20 relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-lg">{vault.creator}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Current APR:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xl font-bold text-emerald-400">{vault.currentAPR.toFixed(2)}%</span>
                    {vault.currentAPR > vault.baseAPR && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        <ArrowUp className="w-3 h-3 mr-1" />+{(vault.currentAPR - vault.baseAPR).toFixed(2)}%
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Yield Accrued:</span>
                  <span className="font-mono text-pink-400">${vault.yieldAccrued.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Last Update:</span>
                  <span className="font-mono text-xs text-zinc-500">
                    {new Date(vault.lastUpdate).toLocaleTimeString()}
                  </span>
                </div>

                {/* Revenue Accrual Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Revenue Accrual</span>
                    <span className="text-emerald-400">{((vault.currentAPR / vault.baseAPR) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((vault.currentAPR / vault.baseAPR) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isActive && (
        <div className="text-center py-8">
          <p className="text-zinc-500 font-mono">Click "Start Simulation" to see live yield updates</p>
        </div>
      )}
    </div>
  )
}
