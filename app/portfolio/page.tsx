"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Coins, TrendingUp, Shield, ExternalLink, Copy, ArrowLeft, Wallet, BarChart3 } from "lucide-react"
import Link from "next/link"

interface NFTData {
  tokenId: string
  contractAddress: string
  name: string
  symbol: string
  fundingReceived: string
  targetAPR: string
  duration: string
  monthlyPayout: string
  riskLevel: string
  deploymentDate: string
  nextPayoutDate: string
  totalYieldEarned: string
  progress: number
  transactionHash: string
  chainId: string
  status: "active" | "completed" | "pending"
}

export default function PortfolioPage() {
  const [nftData, setNftData] = useState<NFTData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate loading NFT data from localStorage or API
    const loadNFTData = () => {
      // Check if there's deployed NFT data
      const deployedNFT = localStorage.getItem("deployedNFT")
      if (deployedNFT) {
        const data = JSON.parse(deployedNFT)
        setNftData({
          tokenId: "#SF001",
          contractAddress: "0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
          name: "STREAM-TECHGAMINGPRO",
          symbol: "SFNFT",
          fundingReceived: data.maxFunding || "$12,947,200",
          targetAPR: data.apr || "14.7%",
          duration: data.term || "12 months",
          monthlyPayout: data.monthlyPayout || "$98,758",
          riskLevel: data.riskScore || "Low",
          deploymentDate: new Date().toLocaleDateString(),
          nextPayoutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          totalYieldEarned: "$0",
          progress: 8, // 1 month out of 12
          transactionHash: "0xabcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
          chainId: "1088", // Metis
          status: "active",
        })
      }
      setIsLoading(false)
    }

    setTimeout(loadNFTData, 1000)
  }, [])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "📋 Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const handleClaimYield = () => {
    // Claim yield functionality (notification disabled to prevent spam)
    console.log("Monthly yield of $98,758 USDC transferred to your wallet")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading your NFT portfolio...</p>
        </div>
      </div>
    )
  }

  if (!nftData) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <Coins className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">No NFTs Found</h1>
            <p className="text-zinc-400 mb-6">You haven't deployed any yield NFTs yet.</p>
            <Link href="/creator">
              <Button className="bg-gradient-to-r from-emerald-500 to-pink-500">Create Your First NFT</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/creator">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Creator
                </Button>
              </Link>
              <div>
                <h1 className="font-mono text-3xl font-bold neon-text">🪙 My NFT Portfolio</h1>
                <p className="text-zinc-400">Manage your deployed yield NFTs</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - NFT Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* NFT Overview Card */}
              <Card className="glass rounded-2xl border-purple-500/20 neon-glow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-mono flex items-center">
                      <Coins className="mr-2 h-5 w-5 text-purple-400" />
                      {nftData.name}
                    </CardTitle>
                    <Badge
                      className={`${
                        nftData.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : nftData.status === "completed"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {nftData.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Funding Received */}
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-500/20 to-pink-500/20 rounded-xl border border-emerald-500/30">
                    <div className="font-mono text-3xl font-bold text-emerald-400 mb-2">{nftData.fundingReceived}</div>
                    <div className="text-sm text-zinc-400">💰 Total Funding Received</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Vault Progress</span>
                      <span className="text-emerald-400">{nftData.progress}% Complete</span>
                    </div>
                    <Progress value={nftData.progress} className="h-2" />
                    <div className="text-xs text-zinc-500 text-center">1 month of {nftData.duration} completed</div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl">
                      <div className="font-mono text-xl font-bold text-pink-400">{nftData.targetAPR}</div>
                      <div className="text-xs text-zinc-400">Target APR</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl">
                      <div className="font-mono text-xl font-bold text-purple-400">{nftData.monthlyPayout}</div>
                      <div className="text-xs text-zinc-400">Monthly Payout</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-xl">
                      <div className="font-mono text-xl font-bold text-blue-400">{nftData.totalYieldEarned}</div>
                      <div className="text-xs text-zinc-400">Total Yield Earned</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-pink-500/10 rounded-xl">
                      <Badge className="bg-green-500/20 text-green-400">
                        <Shield className="mr-1 h-3 w-3" />
                        {nftData.riskLevel}
                      </Badge>
                      <div className="text-xs text-zinc-400 mt-1">Risk Level</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contract Details */}
              <Card className="glass rounded-2xl border-blue-500/20">
                <CardHeader>
                  <CardTitle className="font-mono text-lg">📋 Contract Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg">
                      <span className="text-zinc-400">Token ID:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-emerald-400">{nftData.tokenId}</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(nftData.tokenId, "Token ID")}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg">
                      <span className="text-zinc-400">Contract:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-pink-400">
                          {nftData.contractAddress.slice(0, 10)}...{nftData.contractAddress.slice(-8)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(nftData.contractAddress, "Contract Address")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg">
                      <span className="text-zinc-400">Transaction:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-purple-400">
                          {nftData.transactionHash.slice(0, 10)}...{nftData.transactionHash.slice(-8)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(nftData.transactionHash, "Transaction Hash")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg">
                      <span className="text-zinc-400">Network:</span>
                      <Badge className="bg-green-500/20 text-green-400">Metis Mainnet</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Actions & Timeline */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="glass rounded-2xl border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="font-mono text-lg">⚡ Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleClaimYield}
                    className="w-full bg-gradient-to-r from-emerald-500 to-pink-500 hover:from-emerald-600 hover:to-pink-600"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Claim Monthly Yield
                  </Button>

                  <Link href="/dashboard" className="block">
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                  </Link>

                  <Link href="/marketplace" className="block">
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Trade NFT
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="glass rounded-2xl border-pink-500/20">
                <CardHeader>
                  <CardTitle className="font-mono text-lg">📅 Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-400">NFT Deployed</div>
                        <div className="text-xs text-zinc-400">{nftData.deploymentDate}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-yellow-400">Next Payout</div>
                        <div className="text-xs text-zinc-400">{nftData.nextPayoutDate}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/20">
                      <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-zinc-400">Vault Maturity</div>
                        <div className="text-xs text-zinc-500">
                          {new Date(Date.now() + 11 * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Summary */}
              <Card className="glass rounded-2xl border-purple-500/20">
                <CardHeader>
                  <CardTitle className="font-mono text-lg">📊 Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Days Active:</span>
                    <span className="font-mono text-emerald-400">30 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Payouts Received:</span>
                    <span className="font-mono text-pink-400">0 / 12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Performance:</span>
                    <Badge className="bg-green-500/20 text-green-400">On Track</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
