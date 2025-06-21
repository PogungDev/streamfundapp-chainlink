"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Brain, Shield, Zap, DollarSign, Search, Calculator, Video, Coins } from "lucide-react"

interface EngineMappingProps {
  page: "creator" | "marketplace" | "dashboard" | "home" | "engines"
}

const engineMappings = {
  creator: [
    { name: "ForecastEngine", icon: Brain, description: "AI revenue forecasting", status: "active" },
    { name: "RiskEngine", icon: Shield, description: "Channel risk analysis", status: "active" },
    { name: "VaultConfigurator", icon: Calculator, description: "Vault parameter setup", status: "idle" },
    { name: "MintController", icon: Coins, description: "NFT token minting", status: "idle" },
  ],
  marketplace: [
    { name: "AIIntentEngine", icon: Search, description: "Natural language search", status: "active" },
    { name: "VaultIndexer", icon: Zap, description: "Vault database indexing", status: "active" },
    { name: "AutoSwapAdapter", icon: DollarSign, description: "Cross-chain USDC routing", status: "idle" },
    { name: "AIMatchEngine", icon: Brain, description: "Relevance scoring", status: "active" },
  ],
  dashboard: [
    { name: "YieldDistributor", icon: Zap, description: "Automated yield payouts", status: "active" },
    { name: "APRTracker", icon: Calculator, description: "Performance monitoring", status: "active" },
    { name: "RevenueOracle", icon: Video, description: "AdSense data verification", status: "active" },
    { name: "VaultStats", icon: Shield, description: "Portfolio analytics", status: "active" },
  ],
  home: [
    { name: "AIIntentEngine", icon: Search, description: "Intent-based search", status: "active" },
    { name: "ForecastEngine", icon: Brain, description: "Revenue prediction", status: "active" },
    { name: "AutoSwapAdapter", icon: DollarSign, description: "Cross-chain bridge", status: "active" },
  ],
  engines: [
    { name: "ForecastEngine", icon: Brain, description: "AI revenue forecasting", status: "active" },
    { name: "RiskEngine", icon: Shield, description: "Channel risk analysis", status: "active" },
    { name: "VaultConfigurator", icon: Calculator, description: "Vault parameter setup", status: "active" },
    { name: "MintController", icon: Coins, description: "NFT token minting", status: "active" },
    { name: "AIIntentEngine", icon: Search, description: "Natural language search", status: "active" },
    { name: "VaultIndexer", icon: Zap, description: "Vault database indexing", status: "active" },
  ],
}

export function EngineMappingBadges({ page }: EngineMappingProps) {
  const engines = engineMappings[page] || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "🟢"
      case "processing":
        return "🟡"
      case "idle":
        return "⚪"
      default:
        return "⚪"
    }
  }

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "idle":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
      <TooltipProvider>
        {engines.map((engine) => {
          const IconComponent = engine.icon
          return (
            <Tooltip key={engine.name}>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`${getBadgeColor(engine.status)} cursor-help transition-all hover:scale-105`}
                >
                  <IconComponent className="w-3 h-3 mr-1" />
                  <span className="font-mono text-xs">{engine.name}.sol</span>
                  <span className="ml-1">{getStatusColor(engine.status)}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-1">
                  <div className="font-mono font-semibold">{engine.name}.sol</div>
                  <div className="text-xs">{engine.description}</div>
                  <div className="text-xs text-zinc-400">
                    Status:{" "}
                    <span
                      className={
                        engine.status === "active"
                          ? "text-green-400"
                          : engine.status === "processing"
                            ? "text-yellow-400"
                            : "text-gray-400"
                      }
                    >
                      {engine.status}
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </TooltipProvider>
    </div>
  )
}
