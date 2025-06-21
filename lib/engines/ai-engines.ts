// 🤖 AI SEARCH + FRONT ENGINE (4)

export class AIIntentEngine {
  static parseIntent(query: string) {
    const intent = {
      type: "search",
      filters: {},
      confidence: 0,
    }

    // Parse APR requirements
    const aprMatch = query.match(/(\d+(?:\.\d+)?)\s*%?\s*(apr|yield|return)/i)
    if (aprMatch) {
      intent.filters.minAPR = Number.parseFloat(aprMatch[1])
      intent.confidence += 0.3
    }

    // Parse category
    const categories = ["gaming", "music", "education", "tech", "diy", "lifestyle"]
    const categoryMatch = categories.find((cat) => query.toLowerCase().includes(cat))
    if (categoryMatch) {
      intent.filters.category = categoryMatch
      intent.confidence += 0.3
    }

    // Parse risk level
    const riskMatch = query.match(/(low|medium|high)\s*risk/i)
    if (riskMatch) {
      intent.filters.riskLevel = riskMatch[1].toLowerCase()
      intent.confidence += 0.2
    }

    // Parse investment amount
    const amountMatch = query.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i)
    if (amountMatch) {
      intent.filters.maxInvestment = Number.parseFloat(amountMatch[1].replace(/,/g, ""))
      intent.confidence += 0.2
    }

    return intent
  }

  static generateSearchQuery(intent: any) {
    const conditions = []

    if (intent.filters.minAPR) {
      conditions.push(`APR >= ${intent.filters.minAPR}%`)
    }
    if (intent.filters.category) {
      conditions.push(`category = "${intent.filters.category}"`)
    }
    if (intent.filters.riskLevel) {
      conditions.push(`risk = "${intent.filters.riskLevel}"`)
    }
    if (intent.filters.maxInvestment) {
      conditions.push(`minInvestment <= $${intent.filters.maxInvestment}`)
    }

    return conditions.join(" AND ")
  }
}

export class VaultIndexer {
  static indexVault(vault: any) {
    return {
      id: vault.id,
      creator: vault.creator.toLowerCase(),
      category: vault.category.toLowerCase(),
      apr: Number.parseFloat(vault.apr.replace("%", "")),
      riskLevel: vault.riskScore.toLowerCase(),
      minInvestment: Number.parseFloat(vault.minInvestment.replace(/[$,]/g, "")),
      maxFunding: Number.parseFloat(vault.maxFunding.replace(/[$,]/g, "")),
      subscribers: this.parseNumber(vault.subscribers),
      monthlyViews: this.parseNumber(vault.monthlyViews),
      tags: this.generateTags(vault),
      searchText: `${vault.creator} ${vault.category} ${vault.apr} ${vault.riskScore}`.toLowerCase(),
    }
  }

  static parseNumber(str: string): number {
    const multipliers = { K: 1000, M: 1000000, B: 1000000000 }
    const match = str.match(/([\d.]+)([KMB])?/)
    if (!match) return 0

    const num = Number.parseFloat(match[1])
    const multiplier = multipliers[match[2] as keyof typeof multipliers] || 1
    return num * multiplier
  }

  static generateTags(vault: any): string[] {
    const tags = [vault.category.toLowerCase()]

    // Add APR-based tags
    const apr = Number.parseFloat(vault.apr.replace("%", ""))
    if (apr >= 15) tags.push("high-yield")
    if (apr >= 10 && apr < 15) tags.push("medium-yield")
    if (apr < 10) tags.push("stable-yield")

    // Add size-based tags
    const subs = this.parseNumber(vault.subscribers)
    if (subs >= 1000000) tags.push("mega-creator")
    if (subs >= 100000 && subs < 1000000) tags.push("established-creator")
    if (subs < 100000) tags.push("emerging-creator")

    return tags
  }
}

export class AIMatchEngine {
  static scoreMatch(vault: any, intent: any): number {
    let score = 0

    // APR matching
    if (intent.filters.minAPR) {
      const vaultAPR = Number.parseFloat(vault.apr.replace("%", ""))
      if (vaultAPR >= intent.filters.minAPR) {
        score += 0.4
        // Bonus for close match
        const diff = Math.abs(vaultAPR - intent.filters.minAPR)
        score += Math.max(0, 0.2 - diff / 20)
      }
    }

    // Category matching
    if (intent.filters.category) {
      if (vault.category.toLowerCase().includes(intent.filters.category)) {
        score += 0.3
      }
    }

    // Risk matching
    if (intent.filters.riskLevel) {
      if (vault.riskScore.toLowerCase() === intent.filters.riskLevel) {
        score += 0.2
      }
    }

    // Investment amount matching
    if (intent.filters.maxInvestment) {
      const minInv = Number.parseFloat(vault.minInvestment.replace(/[$,]/g, ""))
      if (minInv <= intent.filters.maxInvestment) {
        score += 0.1
      }
    }

    return Math.min(score, 1.0)
  }

  static rankVaults(vaults: any[], intent: any) {
    return vaults
      .map((vault) => ({
        ...vault,
        matchScore: this.scoreMatch(vault, intent),
      }))
      .filter((vault) => vault.matchScore > 0.3)
      .sort((a, b) => b.matchScore - a.matchScore)
  }

  static generateRecommendations(userHistory: any[], availableVaults: any[]) {
    // Based on risk, duration, tag preferences
    const userPreferences = this.analyzeUserPreferences(userHistory)

    return availableVaults.filter((vault) => this.matchesPreferences(vault, userPreferences)).slice(0, 5)
  }

  static analyzeUserPreferences(history: any[]) {
    if (history.length === 0) return { riskTolerance: "medium", preferredCategories: [] }

    const avgRisk =
      history.reduce((sum, inv) => {
        const risk = inv.riskLevel === "Low" ? 1 : inv.riskLevel === "Medium" ? 2 : 3
        return sum + risk
      }, 0) / history.length

    const categories = history.map((inv) => inv.category)
    const preferredCategories = [...new Set(categories)]

    return {
      riskTolerance: avgRisk < 1.5 ? "low" : avgRisk < 2.5 ? "medium" : "high",
      preferredCategories,
    }
  }

  static matchesPreferences(vault: any, preferences: any): boolean {
    // Risk tolerance check
    const vaultRisk = vault.riskScore.toLowerCase()
    const riskMatch =
      (preferences.riskTolerance === "low" && vaultRisk === "low") ||
      (preferences.riskTolerance === "medium" && ["low", "medium"].includes(vaultRisk)) ||
      preferences.riskTolerance === "high"

    // Category preference check
    const categoryMatch =
      preferences.preferredCategories.length === 0 || preferences.preferredCategories.includes(vault.category)

    return riskMatch && categoryMatch
  }
}

export class NLPResponseGenerator {
  static generateSearchResponse(query: string, results: any[], intent: any) {
    const resultCount = results.length
    const avgAPR = results.reduce((sum, r) => sum + Number.parseFloat(r.apr.replace("%", "")), 0) / resultCount

    let response = `🤖 Found ${resultCount} vaults matching "${query}"\n\n`

    if (intent.filters.minAPR) {
      response += `📊 Average APR: ${avgAPR.toFixed(1)}% (target: ${intent.filters.minAPR}%)\n`
    }

    if (intent.filters.category) {
      const categoryCount = results.filter((r) => r.category.toLowerCase().includes(intent.filters.category)).length
      response += `🎯 ${categoryCount} ${intent.filters.category} creators found\n`
    }

    if (intent.filters.riskLevel) {
      const riskCount = results.filter((r) => r.riskScore.toLowerCase() === intent.filters.riskLevel).length
      response += `🛡️ ${riskCount} ${intent.filters.riskLevel} risk vaults available\n`
    }

    response += `\n💡 Top recommendation: ${results[0]?.creator} (${results[0]?.apr} APR)`

    return response
  }

  static generateInvestmentSummary(investment: any, vault: any) {
    return (
      `🚀 Investment Successful!\n\n` +
      `💰 Invested: ${investment.amount} USDC\n` +
      `🪙 NFT: STREAM-${vault.creator.replace(/\s+/g, "").toUpperCase()}\n` +
      `📊 Target APR: ${vault.apr}\n` +
      `⏰ Duration: ${vault.term}\n` +
      `📅 First payout: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
    )
  }
}
