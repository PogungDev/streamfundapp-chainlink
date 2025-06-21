"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Shield, DollarSign, Search, Calculator } from "lucide-react"

interface EngineBadgeProps {
  engine: string
  status: "active" | "processing" | "idle"
  description?: string
  className?: string
}

const engineConfig = {
  ForecastEngine: {
    icon: Brain,
    color: "emerald",
    description: "AI-powered revenue forecasting using machine learning models",
  },
  RiskEngine: {
    icon: Shield,
    color: "pink",
    description: "Volatility analysis and risk scoring for creator channels",
  },
  VaultConfigurator: {
    icon: Calculator,
    color: "purple",
    description: "Automated vault parameter configuration and optimization",
  },
  AutoSwapAdapter: {
    icon: DollarSign,
    color: "blue",
    description: "Cross-chain USDC swapping via LI.FI protocol integration",
  },
  AIIntentEngine: {
    icon: Search,
    color: "yellow",
    description: "Natural language processing for investment intent parsing",
  },
  YieldDistributor: {
    icon: Zap,
    color: "green",
    description: "Automated yield distribution and payout scheduling",
  },
}

export function EngineBadge({ engine, status, description, className }: EngineBadgeProps) {
  const config = engineConfig[engine as keyof typeof engineConfig]
  if (!config) return null

  const IconComponent = config.icon

  const getStatusColor = () => {
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

  const getStatusText = () => {
    switch (status) {
      case "active":
        return "Active"
      case "processing":
        return "Processing"
      case "idle":
        return "Idle"
      default:
        return "Unknown"
    }
  }

  const getBadgeColor = () => {
    const colors = {
      emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      green: "bg-green-500/20 text-green-400 border-green-500/30",
    }
    return colors[config.color as keyof typeof colors]
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`${getBadgeColor()} ${className} cursor-help transition-all hover:scale-105`}
          >
            <IconComponent className="w-3 h-3 mr-1" />
            <span className="font-mono text-xs">{engine}.sol</span>
            <span className="ml-1">{getStatusColor()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-mono font-semibold">{engine}.sol</div>
            <div className="text-xs">{description || config.description}</div>
            <div className="flex items-center space-x-2 text-xs">
              <span>Status:</span>
              <span
                className={`font-mono ${status === "active" ? "text-green-400" : status === "processing" ? "text-yellow-400" : "text-gray-400"}`}
              >
                {getStatusText()}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
