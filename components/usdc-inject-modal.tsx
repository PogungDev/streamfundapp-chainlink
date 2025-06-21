"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CheckCircle, Coins, DollarSign, Zap } from "lucide-react"

interface USDCInjectModalProps {
  isOpen: boolean
  onClose: () => void
  vault: any
  onSuccess: (result: any) => void
}

type Step = "input" | "swap" | "success"

export function USDCInjectModal({ isOpen, onClose, vault, onSuccess }: USDCInjectModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("input")
  const [amount, setAmount] = useState("")
  const [fromChain, setFromChain] = useState("Ethereum")
  const [swapResult, setSwapResult] = useState<any>(null)
  const [investmentResult, setInvestmentResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const chains = ["Ethereum", "Polygon", "Arbitrum", "Optimism", "Base"]

  const handleInputSubmit = () => {
    if (!amount || Number.parseFloat(amount) < 100) return
    setCurrentStep("swap")
  }

  const handleSwapConfirm = async () => {
    setIsProcessing(true)

    // Simulate swap process - NO AUTO TOASTS
    setTimeout(() => {
      const mockSwapResult = {
        outputAmount: Number.parseFloat(amount),
        transactionHash: "0xabcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      }
      setSwapResult(mockSwapResult)

      // Simulate investment tracking - NO AUTO TOASTS
      const mockInvestment = {
        investedAmount: amount,
        shares: Math.floor(Number.parseFloat(amount) / 10),
        nftTokenId: Math.floor(Math.random() * 10000) + 1000,
        sharePrice: "10.00",
      }

      setInvestmentResult(mockInvestment)
      setIsProcessing(false)
      setCurrentStep("success")

      // Call success callback - ONLY manual trigger
      onSuccess({
        amount: amount,
        vault,
        investment: mockInvestment,
      })
    }, 3000)
  }

  const handleClose = () => {
    setCurrentStep("input")
    setAmount("")
    setSwapResult(null)
    setInvestmentResult(null)
    setIsProcessing(false)
    onClose()
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-6">
      <div className={`flex items-center space-x-2 ${currentStep === "input" ? "text-emerald-400" : "text-zinc-400"}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "input" ? "bg-emerald-500/20 border-emerald-400" : "bg-zinc-800"} border`}
        >
          1
        </div>
        <span className="font-mono text-sm">Input</span>
      </div>
      <ArrowRight className="h-4 w-4 text-zinc-600" />
      <div className={`flex items-center space-x-2 ${currentStep === "swap" ? "text-pink-400" : "text-zinc-400"}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "swap" ? "bg-pink-500/20 border-pink-400" : "bg-zinc-800"} border`}
        >
          2
        </div>
        <span className="font-mono text-sm">Swap</span>
      </div>
      <ArrowRight className="h-4 w-4 text-zinc-600" />
      <div className={`flex items-center space-x-2 ${currentStep === "success" ? "text-purple-400" : "text-zinc-400"}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "success" ? "bg-purple-500/20 border-purple-400" : "bg-zinc-800"} border`}
        >
          3
        </div>
        <span className="font-mono text-sm">Success</span>
      </div>
    </div>
  )

  const renderInputStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="font-mono text-xl font-bold mb-2">💰 Inject USDC</h3>
        <p className="text-zinc-400">Enter amount and select source chain</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="amount" className="font-mono">
            Investment Amount (USDC)
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="glass border-emerald-500/30 focus:border-emerald-400 font-mono text-lg"
            min="100"
          />
          <p className="text-xs text-zinc-500 mt-1">Minimum: $100 USDC</p>
        </div>

        <div>
          <Label className="font-mono">Source Chain</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {chains.map((chain) => (
              <button
                key={chain}
                onClick={() => setFromChain(chain)}
                className={`p-3 rounded-lg border text-sm font-mono transition-colors ${
                  fromChain === chain
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-400"
                    : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {chain}
              </button>
            ))}
          </div>
        </div>

        <Card className="glass border-pink-500/20">
          <CardContent className="p-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Target Vault:</span>
              <span className="font-mono text-pink-400">{vault?.creator}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Target APR:</span>
              <span className="font-mono text-emerald-400">{vault?.apr}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Duration:</span>
              <span className="font-mono text-purple-400">{vault?.term}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={handleInputSubmit}
        disabled={!amount || Number.parseFloat(amount) < 100}
        className="w-full bg-gradient-to-r from-emerald-500 to-pink-500 hover:from-emerald-600 hover:to-pink-600 font-mono py-6"
      >
        <ArrowRight className="mr-2 h-4 w-4" />
        Continue to Swap
      </Button>
    </div>
  )

  const renderSwapStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="font-mono text-xl font-bold mb-2">🔄 Cross-Chain Swap</h3>
        <p className="text-zinc-400">Review swap details and confirm</p>
      </div>

      {!swapResult && (
        <Card className="glass border-blue-500/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-zinc-400">From:</span>
                <span className="font-mono">
                  {amount} USDC on {fromChain}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">To:</span>
                <span className="font-mono">USDC on Metis</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Estimated Fee:</span>
                <span className="font-mono text-yellow-400">~$8.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Estimated Time:</span>
                <span className="font-mono text-blue-400">2-5 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <div className="text-center py-8">
          <Zap className="h-12 w-12 text-emerald-400 mx-auto mb-4 animate-spin" />
          <p className="font-mono text-emerald-400">Processing cross-chain swap...</p>
          <p className="text-sm text-zinc-400 mt-2">This may take a few minutes</p>
        </div>
      )}

      <Button
        onClick={handleSwapConfirm}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 font-mono py-6"
      >
        {isProcessing ? (
          <>
            <Zap className="mr-2 h-4 w-4 animate-spin" />
            Processing Swap...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirm Swap
          </>
        )}
      </Button>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h3 className="font-mono text-xl font-bold mb-2 text-green-400">🎉 Investment Successful!</h3>
        <p className="text-zinc-400">Your yield NFT has been minted</p>
      </div>

      {investmentResult && (
        <Card className="glass border-green-500/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                <Coins className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <div className="font-mono text-lg font-bold text-purple-400">NFT #{investmentResult.nftTokenId}</div>
                <div className="text-sm text-zinc-400">STREAM-{vault.creator.replace(/\s+/g, "").toUpperCase()}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Invested:</span>
                  <span className="font-mono text-emerald-400">${investmentResult.investedAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Shares:</span>
                  <span className="font-mono text-pink-400">{investmentResult.shares}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Share Price:</span>
                  <span className="font-mono text-purple-400">${investmentResult.sharePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Target APR:</span>
                  <span className="font-mono text-blue-400">{vault.apr}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <p className="text-xs text-emerald-400 font-mono">
                  📅 First payout expected: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleClose}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 font-mono py-6"
      >
        <DollarSign className="mr-2 h-4 w-4" />
        View in Dashboard
      </Button>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass max-w-2xl border-emerald-500/20">
        <DialogHeader>
          <DialogTitle className="font-mono text-center">Cross-Chain USDC Investment</DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="min-h-[400px]">
          {currentStep === "input" && renderInputStep()}
          {currentStep === "swap" && renderSwapStep()}
          {currentStep === "success" && renderSuccessStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
