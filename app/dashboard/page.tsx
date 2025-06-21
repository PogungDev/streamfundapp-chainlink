"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, DollarSign, Clock, ArrowUpRight, Gamepad2, Music, BookOpen, Wrench, Search } from "lucide-react"
import { LiveYieldSimulator } from "@/components/live-yield-simulator"
import { EngineMappingBadges } from "@/components/engine-mapping-badges"
import { USDCInjectModal } from "@/components/usdc-inject-modal"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const portfolioData = [
  {
    id: 1,
    creator: "TechGaming Pro",
    category: "Gaming",
    icon: Gamepad2,
    invested: "$2,500",
    currentValue: "$2,687",
    apr: "14.2%",
    nextPayout: "2024-02-15",
    status: "Active",
    monthlyYield: "$29.75",
  },
  {
    id: 2,
    creator: "MusicMaven",
    category: "Music",
    icon: Music,
    invested: "$1,000",
    currentValue: "$1,098",
    apr: "11.8%",
    nextPayout: "2024-02-20",
    status: "Active",
    monthlyYield: "$9.83",
  },
  {
    id: 3,
    creator: "EduTech Academy",
    category: "Education",
    icon: BookOpen,
    invested: "$5,000",
    currentValue: "$5,198",
    apr: "9.5%",
    nextPayout: "2024-02-18",
    status: "Active",
    monthlyYield: "$39.58",
  },
  {
    id: 4,
    creator: "DIY Workshop",
    category: "DIY & Crafts",
    icon: Wrench,
    invested: "$750",
    currentValue: "$821",
    apr: "13.7%",
    nextPayout: "2024-02-12",
    status: "Pending",
    monthlyYield: "$8.56",
  },
]

export default function DashboardPage() {
  const [isInjectModalOpen, setIsInjectModalOpen] = useState(false)
  const [selectedVault, setSelectedVault] = useState<any>(null)
  const { toast } = useToast()

  const totalInvested = portfolioData.reduce(
    (sum, item) => sum + Number.parseFloat(item.invested.replace("$", "").replace(",", "")),
    0,
  )
  const totalCurrentValue = portfolioData.reduce(
    (sum, item) => sum + Number.parseFloat(item.currentValue.replace("$", "").replace(",", "")),
    0,
  )
  const totalMonthlyYield = portfolioData.reduce(
    (sum, item) => sum + Number.parseFloat(item.monthlyYield.replace("$", "")),
    0,
  )
  const totalReturn = totalCurrentValue - totalInvested
  const returnPercentage = ((totalReturn / totalInvested) * 100).toFixed(2)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-400"
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400"
      case "Completed":
        return "bg-blue-500/20 text-blue-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const handleInjectUSDC = () => {
    // Use first vault as default for injection
    setSelectedVault(portfolioData[0])
    setIsInjectModalOpen(true)
  }

  const handleAIAnalytics = () => {
    toast({
      title: "🧠 AI Analytics Dashboard",
      description:
        "Advanced yield analytics and performance insights coming soon! This will include predictive modeling and risk assessment.",
    })
  }

  const handleFindMoreVaults = () => {
    window.location.href = "/marketplace"
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Portfolio Summary */}
          <div className="text-center mb-12">
            <h1 className="font-mono text-4xl font-bold mb-4 neon-text">📊 Investor Vault Dashboard</h1>
            <p className="text-xl text-zinc-400 mb-6">Track real yield from creator AdSense revenue</p>

            <EngineMappingBadges page="dashboard" />

            {/* Dashboard Status Indicator */}
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="font-mono font-semibold">Live Yield Tracking Active</span>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="glass rounded-2xl border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm text-zinc-400">💰 Total USDC Invested</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-emerald-400 mr-2" />
                  <span className="font-mono text-2xl font-bold text-emerald-400">
                    ${totalInvested.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">Across {portfolioData.length} creator vaults</div>
              </CardContent>
            </Card>

            <Card className="glass rounded-2xl border-pink-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm text-zinc-400">📈 Current Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-pink-400 mr-2" />
                  <span className="font-mono text-2xl font-bold text-pink-400">
                    ${totalCurrentValue.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">Real-time AdSense backed</div>
              </CardContent>
            </Card>

            <Card className="glass rounded-2xl border-purple-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm text-zinc-400">🚀 Total Yield Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ArrowUpRight className="h-5 w-5 text-purple-400 mr-2" />
                  <div>
                    <span className="font-mono text-2xl font-bold text-purple-400">${totalReturn.toFixed(2)}</span>
                    <div className="text-sm text-emerald-400">+{returnPercentage}% ROI</div>
                  </div>
                </div>
                <div className="text-xs text-zinc-500 mt-1">From creator revenue share</div>
              </CardContent>
            </Card>

            <Card className="glass rounded-2xl border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono text-sm text-zinc-400">💸 Next Month Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="font-mono text-2xl font-bold text-blue-400">${totalMonthlyYield.toFixed(2)}</span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">Based on AI forecasts</div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-12">
            <LiveYieldSimulator />
          </div>

          {/* Portfolio Table */}
          <Card className="glass rounded-2xl border-emerald-500/20">
            <CardHeader>
              <CardTitle className="font-mono">🪙 Active Yield NFT Positions</CardTitle>
              <p className="text-sm text-zinc-400">Real-time tracking of creator revenue distributions</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="font-orbitron text-zinc-400">Creator</TableHead>
                    <TableHead className="font-orbitron text-zinc-400">Invested</TableHead>
                    <TableHead className="font-orbitron text-zinc-400">Current Value</TableHead>
                    <TableHead className="font-orbitron text-zinc-400">APR</TableHead>
                    <TableHead className="font-orbitron text-zinc-400">Next Payout</TableHead>
                    <TableHead className="font-orbitron text-zinc-400">Monthly Yield</TableHead>
                    <TableHead className="font-orbitron text-zinc-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolioData.map((investment) => {
                    const IconComponent = investment.icon
                    return (
                      <TableRow key={investment.id} className="border-zinc-800">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-pink-500/20">
                              <IconComponent className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div>
                              <div className="font-orbitron font-medium">{investment.creator}</div>
                              <div className="text-sm text-zinc-400">{investment.category}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-orbitron">{investment.invested}</TableCell>
                        <TableCell className="font-orbitron text-emerald-400">{investment.currentValue}</TableCell>
                        <TableCell className="font-orbitron text-pink-400">{investment.apr}</TableCell>
                        <TableCell className="font-orbitron">{investment.nextPayout}</TableCell>
                        <TableCell className="font-orbitron text-purple-400">{investment.monthlyYield}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(investment.status)}>{investment.status}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleInjectUSDC}
              className="bg-gradient-to-r from-emerald-500 to-pink-500 hover:from-emerald-600 hover:to-pink-600 font-mono"
            >
              <DollarSign className="mr-2 h-4 w-4" />💰 Inject More USDC
            </Button>
            <Button
              onClick={handleAIAnalytics}
              variant="outline"
              className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 font-mono"
            >
              <TrendingUp className="mr-2 h-4 w-4" />📊 AI Yield Analytics
            </Button>
            <Button
              onClick={handleFindMoreVaults}
              variant="outline"
              className="border-pink-500 text-pink-400 hover:bg-pink-500/10 font-mono"
            >
              <Search className="mr-2 h-4 w-4" />🤖 Find More Vaults
            </Button>
          </div>
        </div>
      </div>

      <USDCInjectModal
        isOpen={isInjectModalOpen}
        onClose={() => setIsInjectModalOpen(false)}
        vault={selectedVault}
        onSuccess={(result) => {
          console.log("Investment successful:", result)
          setIsInjectModalOpen(false)
          toast({
            title: "🎉 USDC Injection Successful!",
            description: `Injected ${result.amount} USDC into ${result.vault?.creator} vault.`,
          })
        }}
      />
    </div>
  )
}
