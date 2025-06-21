"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Brain,
  Shield,
  Zap,
  DollarSign,
  Search,
  Calculator,
  Video,
  Coins,
  Globe,
  Award,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react"

interface EngineStatus {
  name: string
  contract: string
  status: "active" | "processing" | "idle" | "error"
  progress: number
  lastExecution: string
  icon: any
  category: "creator" | "investor" | "ai" | "utility"
}

const engineData: EngineStatus[] = [
  // Creator Engines (8)
  {
    name: "AIIntentParser",
    contract: "AIIntentRouter.sol",
    status: "active",
    progress: 95,
    lastExecution: "2s ago",
    icon: Brain,
    category: "ai",
  },
  {
    name: "ForecastEngine",
    contract: "ForecastVault.sol",
    status: "active",
    progress: 100,
    lastExecution: "5s ago",
    icon: Calculator,
    category: "creator",
  },
  {
    name: "BondNFTMinter",
    contract: "BondNFT.sol",
    status: "processing",
    progress: 78,
    lastExecution: "1m ago",
    icon: Coins,
    category: "creator",
  },
  {
    name: "VaultRegistry",
    contract: "VaultRegistry.sol",
    status: "active",
    progress: 100,
    lastExecution: "3s ago",
    icon: Shield,
    category: "creator",
  },
  {
    name: "YieldSimulator",
    contract: "YieldTracker.sol",
    status: "active",
    progress: 92,
    lastExecution: "1s ago",
    icon: Zap,
    category: "investor",
  },
  {
    name: "AutoYieldDistributor",
    contract: "PayoutSimulator.sol",
    status: "processing",
    progress: 65,
    lastExecution: "30s ago",
    icon: DollarSign,
    category: "investor",
  },
  {
    name: "USDCZapRouter",
    contract: "ZapRouter.sol",
    status: "active",
    progress: 88,
    lastExecution: "10s ago",
    icon: Globe,
    category: "investor",
  },
  {
    name: "APRScorer",
    contract: "APRScorer.sol",
    status: "active",
    progress: 100,
    lastExecution: "2s ago",
    icon: Calculator,
    category: "ai",
  },

  // Additional Engines (12)
  {
    name: "VaultDurationController",
    contract: "DurationLogic.sol",
    status: "active",
    progress: 100,
    lastExecution: "5m ago",
    icon: Video,
    category: "utility",
  },
  {
    name: "CrossChainAdapter",
    contract: "MockLIFIAdapter.sol",
    status: "processing",
    progress: 45,
    lastExecution: "2m ago",
    icon: Globe,
    category: "investor",
  },
  {
    name: "InvestorBadgeEngine",
    contract: "InvestorBadge.sol",
    status: "idle",
    progress: 0,
    lastExecution: "Never",
    icon: Award,
    category: "utility",
  },
  {
    name: "CreatorScoreVerifier",
    contract: "ReputationVerifier.sol",
    status: "active",
    progress: 85,
    lastExecution: "1m ago",
    icon: CheckCircle,
    category: "creator",
  },
  {
    name: "RiskEngine",
    contract: "RiskClassifier.sol",
    status: "active",
    progress: 90,
    lastExecution: "30s ago",
    icon: Shield,
    category: "ai",
  },
  {
    name: "AutoCompounder",
    contract: "AutoCompounder.sol",
    status: "processing",
    progress: 55,
    lastExecution: "45s ago",
    icon: Zap,
    category: "investor",
  },
  {
    name: "VaultMetadataFeed",
    contract: "VaultMetadata.sol",
    status: "active",
    progress: 100,
    lastExecution: "1s ago",
    icon: Video,
    category: "utility",
  },
  {
    name: "CreatorProofNFT",
    contract: "CreatorSBT.sol",
    status: "idle",
    progress: 0,
    lastExecution: "Never",
    icon: Coins,
    category: "creator",
  },
  {
    name: "VaultTerminator",
    contract: "Terminator.sol",
    status: "active",
    progress: 100,
    lastExecution: "1h ago",
    icon: AlertTriangle,
    category: "utility",
  },
  {
    name: "YieldLeaderboard",
    contract: "Leaderboard.sol",
    status: "processing",
    progress: 70,
    lastExecution: "5m ago",
    icon: Award,
    category: "utility",
  },
  {
    name: "AuditLogEngine",
    contract: "AuditLogger.sol",
    status: "active",
    progress: 100,
    lastExecution: "1s ago",
    icon: Search,
    category: "utility",
  },
  {
    name: "MockProofOfForecast",
    contract: "ProofEngine.sol",
    status: "active",
    progress: 100,
    lastExecution: "10s ago",
    icon: CheckCircle,
    category: "ai",
  },
]

export function EngineStatusDashboard() {
  const [engines, setEngines] = useState<EngineStatus[]>(engineData)
  const [isRunning, setIsRunning] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setEngines((prev) =>
        prev.map((engine) => {
          // Simulate engine activity
          const progressChange = Math.random() * 10 - 5 // -5 to +5
          const newProgress = Math.max(0, Math.min(100, engine.progress + progressChange))

          // Randomly change status
          let newStatus = engine.status
          if (Math.random() < 0.1) {
            // 10% chance to change status
            const statuses: ("active" | "processing" | "idle")[] = ["active", "processing", "idle"]
            newStatus = statuses[Math.floor(Math.random() * statuses.length)]
          }

          return {
            ...engine,
            progress: newProgress,
            status: newStatus,
            lastExecution: newStatus === "active" ? `${Math.floor(Math.random() * 60)}s ago` : engine.lastExecution,
          }
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [isRunning])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400"
      case "processing":
        return "bg-yellow-500/20 text-yellow-400"
      case "idle":
        return "bg-gray-500/20 text-gray-400"
      case "error":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "creator":
        return "bg-pink-500/20 text-pink-400"
      case "investor":
        return "bg-emerald-500/20 text-emerald-400"
      case "ai":
        return "bg-blue-500/20 text-blue-400"
      case "utility":
        return "bg-purple-500/20 text-purple-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const filteredEngines =
    selectedCategory === "all" ? engines : engines.filter((engine) => engine.category === selectedCategory)

  const activeEngines = engines.filter((e) => e.status === "active").length
  const processingEngines = engines.filter((e) => e.status === "processing").length
  const idleEngines = engines.filter((e) => e.status === "idle").length

  const handleEngineAction = (engineName: string, action: string) => {
    toast({
      title: `🔧 Engine ${action}`,
      description: `${engineName} has been ${action.toLowerCase()}ed successfully`,
    })
  }

  return (
    <Card className="glass rounded-2xl border-emerald-500/20">
      <CardHeader>
        <CardTitle className="font-mono flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="mr-2 h-5 w-5 text-emerald-400" />🔧 Engine Status Dashboard (20 Smart Contracts)
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
            <Button
              onClick={() => setIsRunning(!isRunning)}
              size="sm"
              variant="outline"
              className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 font-mono text-xs"
            >
              {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {isRunning ? "Pause" : "Resume"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <div className="font-mono text-xl font-bold text-green-400">{activeEngines}</div>
            <div className="text-xs text-zinc-400">Active</div>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
            <div className="font-mono text-xl font-bold text-yellow-400">{processingEngines}</div>
            <div className="text-xs text-zinc-400">Processing</div>
          </div>
          <div className="text-center p-3 bg-gray-500/10 rounded-lg">
            <div className="font-mono text-xl font-bold text-gray-400">{idleEngines}</div>
            <div className="text-xs text-zinc-400">Idle</div>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded-lg">
            <div className="font-mono text-xl font-bold text-blue-400">{engines.length}</div>
            <div className="text-xs text-zinc-400">Total</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {["all", "creator", "investor", "ai", "utility"].map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              size="sm"
              variant={selectedCategory === category ? "default" : "outline"}
              className={`font-mono text-xs ${
                selectedCategory === category
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "border-zinc-700 text-zinc-400 hover:border-emerald-500/50"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>

        {/* Engine Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredEngines.map((engine) => {
            const IconComponent = engine.icon
            return (
              <div
                key={engine.name}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  engine.status === "active"
                    ? "border-green-500/30 bg-green-500/5"
                    : engine.status === "processing"
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : "border-zinc-700 bg-zinc-800/30"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-emerald-400" />
                    <span className="font-mono text-sm font-semibold">{engine.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(engine.category)} variant="outline">
                      {engine.category}
                    </Badge>
                    <Badge className={getStatusColor(engine.status)} variant="outline">
                      {engine.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Contract:</span>
                    <span className="font-mono text-blue-400">{engine.contract}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Progress:</span>
                      <span className="font-mono text-emerald-400">{engine.progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={engine.progress} className="h-1" />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Last: {engine.lastExecution}</span>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-emerald-400 hover:bg-emerald-500/20"
                        onClick={() => handleEngineAction(engine.name, "Restart")}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-zinc-500 font-mono border-t border-zinc-800 pt-4">
          🔄 Real-time engine monitoring • 📊 20 Smart Contracts • 🤖 AI-powered automation
        </div>
      </CardContent>
    </Card>
  )
}
