"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Cpu,
  Database,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Bot,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const SMART_CONTRACTS = [
  // Creator Side (8 contracts)
  {
    name: "AIIntentRouter",
    category: "Creator",
    description: "AI-powered intent parsing and vault matching system",
    status: "Active",
    address: "0x1234567890123456789012345678901234567890",
    gasUsed: "2.1M",
    transactions: 1247,
    icon: Bot,
    color: "bg-purple-500",
    functions: ["parseIntent", "matchVaults", "addVaultMatch"],
  },
  {
    name: "ForecastVault",
    category: "Creator",
    description: "Revenue forecasting engine for content creators",
    status: "Active",
    address: "0x2345678901234567890123456789012345678901",
    gasUsed: "1.8M",
    transactions: 892,
    icon: TrendingUp,
    color: "bg-green-500",
    functions: ["generateForecast", "updateForecast", "getForecast"],
  },
  {
    name: "BondNFT",
    category: "Creator",
    description: "ERC721A yield bonds for creator funding",
    status: "Active",
    address: "0x3456789012345678901234567890123456789012",
    gasUsed: "3.2M",
    transactions: 2156,
    icon: Shield,
    color: "bg-blue-500",
    functions: ["mintBond", "getBondMetadata", "getCreatorTokens"],
  },
  {
    name: "VaultRegistry",
    category: "Creator",
    description: "Central registry for all creator vaults",
    status: "Active",
    address: "0x4567890123456789012345678901234567890123",
    gasUsed: "1.5M",
    transactions: 1834,
    icon: Database,
    color: "bg-indigo-500",
    functions: ["registerVault", "fundVault", "getAllActiveVaults"],
  },
  {
    name: "APRScorer",
    category: "Creator",
    description: "AI-powered APR calculation and scoring",
    status: "Active",
    address: "0x5678901234567890123456789012345678901234",
    gasUsed: "1.2M",
    transactions: 967,
    icon: Cpu,
    color: "bg-orange-500",
    functions: ["calculateAPR", "getAPRScore", "updateCategoryMultiplier"],
  },
  {
    name: "DurationLogic",
    category: "Creator",
    description: "Vault duration and maturity management",
    status: "Active",
    address: "0x6789012345678901234567890123456789012345",
    gasUsed: "0.9M",
    transactions: 543,
    icon: Clock,
    color: "bg-yellow-500",
    functions: ["setVaultDuration", "checkVaultExpiry", "extendVaultDuration"],
  },
  {
    name: "CreatorSBT",
    category: "Creator",
    description: "Soulbound tokens for creator identity",
    status: "Active",
    address: "0x7890123456789012345678901234567890123456",
    gasUsed: "2.8M",
    transactions: 1456,
    icon: Users,
    color: "bg-pink-500",
    functions: ["mintCreatorSBT", "verifyCreator", "getCreatorProfile"],
  },
  {
    name: "ReputationVerifier",
    category: "Creator",
    description: "Creator reputation and verification system",
    status: "Active",
    address: "0x8901234567890123456789012345678901234567",
    gasUsed: "1.7M",
    transactions: 789,
    icon: CheckCircle,
    color: "bg-emerald-500",
    functions: ["initializeCreatorReputation", "updatePerformanceMetrics", "isCreatorVerified"],
  },

  // Investor Side (8 contracts)
  {
    name: "YieldTracker",
    category: "Investor",
    description: "Real-time yield tracking and calculation",
    status: "Active",
    address: "0x9012345678901234567890123456789012345678",
    gasUsed: "2.3M",
    transactions: 3421,
    icon: TrendingUp,
    color: "bg-green-600",
    functions: ["trackInvestment", "simulateYield", "getYieldData"],
  },
  {
    name: "PayoutSimulator",
    category: "Investor",
    description: "Automated payout scheduling and execution",
    status: "Active",
    address: "0xa123456789012345678901234567890123456789",
    gasUsed: "1.9M",
    transactions: 2187,
    icon: Zap,
    color: "bg-blue-600",
    functions: ["schedulePayouts", "simulateAutoPayout", "executePayout"],
  },
  {
    name: "ZapRouter",
    category: "Investor",
    description: "One-click investment routing and swapping",
    status: "Active",
    address: "0xb234567890123456789012345678901234567890",
    gasUsed: "3.1M",
    transactions: 1876,
    icon: Zap,
    color: "bg-purple-600",
    functions: ["initiateZap", "completeZap", "getZapTransaction"],
  },
  {
    name: "MockLIFIAdapter",
    category: "Investor",
    description: "Cross-chain bridge and swap adapter",
    status: "Active",
    address: "0xc345678901234567890123456789012345678901",
    gasUsed: "2.7M",
    transactions: 1234,
    icon: Settings,
    color: "bg-cyan-600",
    functions: ["estimateSwap", "initiateSwap", "completeSwap"],
  },
  {
    name: "InvestorBadge",
    category: "Investor",
    description: "ERC721 achievement badges for investors",
    status: "Active",
    address: "0xd456789012345678901234567890123456789012",
    gasUsed: "2.4M",
    transactions: 987,
    icon: Shield,
    color: "bg-amber-600",
    functions: ["updateInvestorStats", "calculateBadgeType", "getInvestorBadge"],
  },
  {
    name: "AutoCompounder",
    category: "Investor",
    description: "Automatic yield compounding system",
    status: "Active",
    address: "0xe567890123456789012345678901234567890123",
    gasUsed: "1.6M",
    transactions: 654,
    icon: TrendingUp,
    color: "bg-teal-600",
    functions: ["enableAutoCompounding", "executeCompounding", "simulateCompounding"],
  },
  {
    name: "VaultMetadata",
    category: "Investor",
    description: "Comprehensive vault metadata management",
    status: "Active",
    address: "0xf678901234567890123456789012345678901234",
    gasUsed: "1.3M",
    transactions: 432,
    icon: Database,
    color: "bg-slate-600",
    functions: ["setVaultMetadata", "updateVaultStats", "getVaultMetadata"],
  },
  {
    name: "Terminator",
    category: "Investor",
    description: "Vault termination and liquidation engine",
    status: "Active",
    address: "0x1789012345678901234567890123456789012345",
    gasUsed: "2.0M",
    transactions: 321,
    icon: AlertCircle,
    color: "bg-red-600",
    functions: ["scheduleTermination", "executeTermination", "emergencyTermination"],
  },

  // AI & Utility (4 contracts)
  {
    name: "RiskClassifier",
    category: "AI",
    description: "AI-powered risk assessment and classification",
    status: "Active",
    address: "0x2890123456789012345678901234567890123456",
    gasUsed: "1.4M",
    transactions: 876,
    icon: Bot,
    color: "bg-red-500",
    functions: ["assessRisk", "calculateRiskLevel", "getRiskAssessment"],
  },
  {
    name: "Leaderboard",
    category: "Utility",
    description: "Global leaderboards and rankings",
    status: "Active",
    address: "0x3901234567890123456789012345678901234567",
    gasUsed: "1.1M",
    transactions: 543,
    icon: TrendingUp,
    color: "bg-yellow-600",
    functions: ["updateVaultRanking", "updateCreatorRanking", "getTopVaultsByFunding"],
  },
  {
    name: "AuditLogger",
    category: "Utility",
    description: "Comprehensive audit trail and logging",
    status: "Active",
    address: "0x4012345678901234567890123456789012345678",
    gasUsed: "0.8M",
    transactions: 2341,
    icon: Database,
    color: "bg-gray-600",
    functions: ["logEvent", "getVaultAuditTrail", "verifyEventIntegrity"],
  },
  {
    name: "ProofEngine",
    category: "Utility",
    description: "Cryptographic proof verification system",
    status: "Active",
    address: "0x5123456789012345678901234567890123456789",
    gasUsed: "1.8M",
    transactions: 765,
    icon: Shield,
    color: "bg-indigo-600",
    functions: ["submitProof", "verifyProof", "isProofValid"],
  },
]

export default function EnginesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const { toast } = useToast()

  const categories = ["All", "Creator", "Investor", "AI", "Utility"]

  const filteredContracts =
    selectedCategory === "All"
      ? SMART_CONTRACTS
      : SMART_CONTRACTS.filter((contract) => contract.category === selectedCategory)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Contract address copied to clipboard",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500"
      case "Pending":
        return "bg-yellow-500"
      case "Error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const totalContracts = SMART_CONTRACTS.length
  const activeContracts = SMART_CONTRACTS.filter((c) => c.status === "Active").length
  const totalTransactions = SMART_CONTRACTS.reduce((sum, c) => sum + c.transactions, 0)

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Smart Contract Engines
          </h1>
          <p className="text-gray-400 text-lg">
            Complete Solidity architecture powering Stream Fund's decentralized yield platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Contracts</p>
                  <p className="text-3xl font-bold text-white">{totalContracts}</p>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Engines</p>
                  <p className="text-3xl font-bold text-green-500">{activeContracts}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Transactions</p>
                  <p className="text-3xl font-bold text-purple-500">{totalTransactions.toLocaleString()}</p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Network</p>
                  <p className="text-3xl font-bold text-orange-500">Metis</p>
                </div>
                <Settings className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="bg-gray-900 border-gray-800">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                {category}
                {category !== "All" && (
                  <Badge variant="secondary" className="ml-2">
                    {SMART_CONTRACTS.filter((c) => c.category === category).length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContracts.map((contract, index) => {
                const IconComponent = contract.icon
                return (
                  <Card key={index} className="bg-gray-900 border-gray-800 hover:border-green-500 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${contract.color}`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white">{contract.name}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {contract.category}
                            </Badge>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(contract.status)}`} />
                      </div>
                    </CardHeader>

                    <CardContent>
                      <CardDescription className="text-gray-400 mb-4">{contract.description}</CardDescription>

                      {/* Contract Address */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Contract Address</p>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-gray-800 px-2 py-1 rounded text-green-400 flex-1 truncate">
                            {contract.address}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(contract.address)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Gas Used</p>
                          <p className="text-sm font-semibold text-white">{contract.gasUsed}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Transactions</p>
                          <p className="text-sm font-semibold text-white">{contract.transactions.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Functions */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Key Functions</p>
                        <div className="flex flex-wrap gap-1">
                          {contract.functions.slice(0, 3).map((func, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {func}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Explorer
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Database className="h-3 w-3 mr-1" />
                          ABI
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Deployment Status */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Deployment Status</CardTitle>
            <CardDescription>All 20 smart contracts successfully deployed to Metis network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Deployment Progress</span>
                <span className="text-sm text-green-500">100% Complete</span>
              </div>
              <Progress value={100} className="h-2" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">8</p>
                  <p className="text-xs text-gray-400">Creator Engines</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">8</p>
                  <p className="text-xs text-gray-400">Investor Engines</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-500">2</p>
                  <p className="text-xs text-gray-400">AI Engines</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">2</p>
                  <p className="text-xs text-gray-400">Utility Engines</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
