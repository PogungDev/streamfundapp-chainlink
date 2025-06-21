"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Coins, ArrowRight, Zap } from "lucide-react"

interface InvestmentSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  investment: {
    amount: string
    fromChain: string
    vault: any
    nftId: number
  }
}

export function InvestmentSuccessModal({ isOpen, onClose, investment }: InvestmentSuccessModalProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setStep(0)
      const timer1 = setTimeout(() => setStep(1), 1000)
      const timer2 = setTimeout(() => setStep(2), 2500)
      const timer3 = setTimeout(() => setStep(3), 4000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isOpen])

  const steps = [
    { text: "🔄 Swapping USDC cross-chain...", icon: Zap },
    { text: "⚡ Routing to vault...", icon: ArrowRight },
    { text: "🪙 Minting yield NFT...", icon: Coins },
    { text: "✅ Investment successful!", icon: CheckCircle },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass max-w-md border-emerald-500/20">
        <DialogHeader>
          <DialogTitle className="font-mono text-center">💰 USDC Investment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="space-y-3">
            {steps.map((stepItem, index) => {
              const IconComponent = stepItem.icon
              const isActive = step >= index
              const isCompleted = step > index

              return (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                    isActive ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-zinc-800/30"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      isCompleted ? "bg-green-500/20" : isActive ? "bg-emerald-500/20" : "bg-zinc-700"
                    }`}
                  >
                    <IconComponent
                      className={`h-4 w-4 ${
                        isCompleted ? "text-green-400" : isActive ? "text-emerald-400 animate-spin" : "text-zinc-400"
                      }`}
                    />
                  </div>
                  <span className={`font-mono text-sm ${isActive ? "text-emerald-400" : "text-zinc-400"}`}>
                    {stepItem.text}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Success Details */}
          {step >= 3 && (
            <Card className="glass border-green-500/20 animate-in fade-in-50">
              <CardContent className="p-4 space-y-4">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <h3 className="font-mono text-lg font-bold text-green-400">Investment Complete!</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Amount:</span>
                    <span className="font-mono text-emerald-400">{investment.amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">From:</span>
                    <span className="font-mono text-pink-400">{investment.fromChain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Vault:</span>
                    <span className="font-mono text-purple-400">{investment.vault?.creator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">NFT ID:</span>
                    <span className="font-mono text-blue-400">#{investment.nftId}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <p className="text-xs text-emerald-400 font-mono text-center">
                    🎉 Swap dari {investment.amount} USDC ({investment.fromChain}) ke Vault {investment.vault?.creator}{" "}
                    (Metis) sukses!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step >= 3 && (
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-emerald-500 to-pink-500 hover:from-emerald-600 hover:to-pink-600 font-mono"
            >
              View in Dashboard
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
