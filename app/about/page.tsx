import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Shield, Zap, Globe, TrendingUp, Users, Code, Coins, AlertTriangle, Info } from "lucide-react"
import { EngineStatusDashboard } from "@/components/engine-status-dashboard"

export default function AboutPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-orbitron text-4xl font-bold mb-4 neon-text">About Stream Fund</h1>
            <p className="text-xl text-zinc-400">The future of creator economy meets decentralized finance</p>
          </div>

          {/* IMPORTANT: Mock Disclaimer */}
          <Card className="glass rounded-2xl border-yellow-500/20 mb-12">
            <CardHeader>
              <CardTitle className="font-mono flex items-center text-yellow-400">
                <AlertTriangle className="mr-2 h-5 w-5" />🧪 SIMULATION DISCLAIMER
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <p className="text-yellow-400 font-mono text-sm leading-relaxed">
                  <strong>⚠️ IMPORTANT:</strong> Stream Fund is a comprehensive simulation demonstrating YouTube AdSense
                  revenue tokenization. All data, yields, and transactions are MOCK/DUMMY but represent real-world
                  scenarios in creator economy DeFi.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-mono font-semibold text-emerald-400 mb-2">✅ What's Real:</h4>
                  <ul className="space-y-1 text-zinc-400">
                    <li>• Complete AI-powered creator onboarding flow</li>
                    <li>• 20 modular smart contract architecture</li>
                    <li>• Cross-chain USDC injection simulation</li>
                    <li>• Real-time yield tracking algorithms</li>
                    <li>• Natural language investment discovery</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-mono font-semibold text-pink-400 mb-2">🧪 What's Simulated:</h4>
                  <ul className="space-y-1 text-zinc-400">
                    <li>• YouTube channel data & revenue figures</li>
                    <li>• USDC transactions & wallet connections</li>
                    <li>• NFT minting & smart contract deployment</li>
                    <li>• Yield distributions & APR calculations</li>
                    <li>• Cross-chain bridge operations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engine Status Dashboard */}
          <div className="mb-12">
            <h2 className="font-orbitron text-3xl font-bold text-center mb-8 neon-text">
              Complete Engine Architecture
            </h2>
            <EngineStatusDashboard />
          </div>

          {/* Mission Statement */}
          <Card className="glass rounded-2xl border-emerald-500/20 mb-12">
            <CardContent className="p-8">
              <p className="text-lg text-zinc-300 leading-relaxed">
                Stream Fund revolutionizes creator monetization by bridging traditional YouTube revenue with Web3 yield
                farming. Our AI-powered platform enables creators to tokenize future earnings while providing investors
                with transparent, cross-chain yield opportunities backed by real content performance data.
              </p>
            </CardContent>
          </Card>

          {/* How It Works */}
          <div className="mb-12">
            <h2 className="font-orbitron text-3xl font-bold text-center mb-8 neon-text">How Stream Fund Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="glass rounded-2xl border-pink-500/20">
                <CardHeader>
                  <Brain className="h-12 w-12 text-pink-400 mb-4" />
                  <CardTitle className="font-orbitron">AI Revenue Forecasting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">
                    Our proprietary ForecastEngine analyzes channel metrics, audience engagement, market trends, and
                    seasonal patterns to predict future YouTube revenue with high accuracy. Machine learning models
                    continuously improve predictions based on real performance data.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass rounded-2xl border-emerald-500/20">
                <CardHeader>
                  <Coins className="h-12 w-12 text-emerald-400 mb-4" />
                  <CardTitle className="font-orbitron">NFT Yield Tokenization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">
                    Creators mint ERC721A yield tokens representing future revenue streams. Each token is backed by real
                    YouTube monetization data, channel analytics, and AI-generated forecasts. Smart contracts ensure
                    transparent yield distribution to token holders.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass rounded-2xl border-purple-500/20">
                <CardHeader>
                  <Globe className="h-12 w-12 text-purple-400 mb-4" />
                  <CardTitle className="font-orbitron">Cross-Chain Investment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400">
                    Investors use USDC across multiple chains to participate in yield vaults. Our AutoSwapAdapter
                    handles cross-chain transactions while YieldRouter optimizes returns. All investments are secured by
                    smart contracts and backed by real revenue streams.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-12">
            <h2 className="font-orbitron text-3xl font-bold text-center mb-8 neon-text">Platform Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-emerald-400 mt-1" />
                  <div>
                    <h3 className="font-orbitron font-semibold text-emerald-400">Transparent Yield Tracking</h3>
                    <p className="text-zinc-400 text-sm">Real-time revenue monitoring with on-chain verification</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-6 w-6 text-pink-400 mt-1" />
                  <div>
                    <h3 className="font-orbitron font-semibold text-pink-400">AI-Powered Risk Assessment</h3>
                    <p className="text-zinc-400 text-sm">Dynamic risk scoring based on channel performance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="font-orbitron font-semibold text-purple-400">Creator-Investor Matching</h3>
                    <p className="text-zinc-400 text-sm">Smart algorithms connect creators with suitable investors</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Globe className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="font-orbitron font-semibold text-blue-400">Multi-Chain Support</h3>
                    <p className="text-zinc-400 text-sm">Ethereum, Polygon, Arbitrum, Optimism, and Base</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="h-6 w-6 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="font-orbitron font-semibold text-yellow-400">Automated Yield Distribution</h3>
                    <p className="text-zinc-400 text-sm">Smart contracts handle all yield payments automatically</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Code className="h-6 w-6 text-indigo-400 mt-1" />
                  <div>
                    <h3 className="font-orbitron font-semibold text-indigo-400">Open Source Protocol</h3>
                    <p className="text-zinc-400 text-sm">Fully audited and community-governed infrastructure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Competition Info */}
          <Card className="glass rounded-2xl border-purple-500/20 mb-8">
            <CardHeader>
              <CardTitle className="font-orbitron text-center flex items-center justify-center">
                <Info className="mr-2 h-5 w-5 text-purple-400" />🏆 Built for HyperHack (Metis) 2024
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-zinc-400">
                Stream Fund represents the convergence of AI, creator economy, and DeFi - built specifically for the
                Metis ecosystem. This comprehensive simulation demonstrates how blockchain technology can revolutionize
                creator monetization.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Badge className="bg-emerald-500/20 text-emerald-400 px-4 py-2">🤖 AI-Native DeFi</Badge>
                <Badge className="bg-pink-500/20 text-pink-400 px-4 py-2">🎥 Creator Economy</Badge>
                <Badge className="bg-purple-500/20 text-purple-400 px-4 py-2">⚡ Metis Chain</Badge>
                <Badge className="bg-blue-500/20 text-blue-400 px-4 py-2">🔗 Cross-Chain</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Supported Chains */}
          <Card className="glass rounded-2xl border-emerald-500/20">
            <CardHeader>
              <CardTitle className="font-orbitron text-center">Supported Blockchain Networks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge className="bg-blue-500/20 text-blue-400 px-4 py-2">Ethereum</Badge>
                <Badge className="bg-purple-500/20 text-purple-400 px-4 py-2">Polygon</Badge>
                <Badge className="bg-blue-600/20 text-blue-300 px-4 py-2">Arbitrum</Badge>
                <Badge className="bg-red-500/20 text-red-400 px-4 py-2">Optimism</Badge>
                <Badge className="bg-indigo-500/20 text-indigo-400 px-4 py-2">Base</Badge>
                <Badge className="bg-emerald-500/20 text-emerald-400 px-4 py-2 font-bold">⚡ Metis (Primary)</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
