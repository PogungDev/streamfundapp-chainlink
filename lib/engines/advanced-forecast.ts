// 🧠 ADVANCED FORECAST ENGINE - TypeScript Implementation

export interface ChannelMetrics {
  subscribers: number
  avgViews: number
  avgWatchTime: number // seconds
  ctr: number // basis points (100 = 1%)
  engagementRate: number // basis points
  channelAge: number // months
  category: string
  primaryGeo: string
}

export interface RevenueFactors {
  baseCPM: number
  adImpressionRate: number
  revenueShare: number
  seasonalMultiplier: number
  geoMultiplier: number
  categoryMultiplier: number
}

export class AdvancedForecastEngine {
  private static categoryMultipliers: Record<string, number> = {
    gaming: 8500, // 85%
    tech: 12000, // 120%
    finance: 15000, // 150%
    lifestyle: 7000, // 70%
    education: 9000, // 90%
    entertainment: 8000, // 80%
  }

  private static geoMultipliers: Record<string, number> = {
    US: 15000, // 150%
    UK: 12000, // 120%
    DE: 11000, // 110%
    CA: 13000, // 130%
    AU: 11500, // 115%
    IN: 3000, // 30%
    ID: 2500, // 25%
    BR: 4000, // 40%
  }

  private static seasonalFactors: Record<number, number> = {
    1: 9000, // Jan: 90%
    2: 8500, // Feb: 85%
    3: 9500, // Mar: 95%
    4: 10000, // Apr: 100%
    5: 10500, // May: 105%
    6: 9500, // Jun: 95%
    7: 9000, // Jul: 90%
    8: 9500, // Aug: 95%
    9: 10500, // Sep: 105%
    10: 11500, // Oct: 115%
    11: 13000, // Nov: 130%
    12: 14000, // Dec: 140%
  }

  static calculateAdvancedRevenue(metrics: ChannelMetrics, currentMonth: number) {
    // Base CPM calculation
    const baseCPM = this.calculateBaseCPM(metrics.category, metrics.primaryGeo)

    // Ad impression rate
    const adImpressionRate = this.calculateAdImpressionRate(metrics)

    // Seasonal multiplier
    const seasonalMultiplier = this.seasonalFactors[currentMonth] || 10000

    // Effective CPM
    const effectiveCPM =
      baseCPM *
      (this.categoryMultipliers[metrics.category] / 10000) *
      (this.geoMultipliers[metrics.primaryGeo] / 10000) *
      (seasonalMultiplier / 10000)

    // RPM calculation
    const rpm = effectiveCPM * (adImpressionRate / 10000) * 0.68 // YouTube's 68% share

    // Monthly revenue
    const monthlyViews = this.estimateMonthlyViews(metrics)
    const monthlyRevenue = (monthlyViews * rpm) / 1000

    // Confidence score
    const confidence = this.calculateConfidenceScore(metrics)

    const factors: RevenueFactors = {
      baseCPM,
      adImpressionRate,
      revenueShare: 6800,
      seasonalMultiplier,
      geoMultiplier: this.geoMultipliers[metrics.primaryGeo],
      categoryMultiplier: this.categoryMultipliers[metrics.category],
    }

    return {
      monthlyRevenue: Math.round(monthlyRevenue),
      rpm: Math.round(rpm * 100) / 100,
      confidence: Math.round(confidence / 100),
      factors,
      breakdown: {
        monthlyViews,
        effectiveCPM: Math.round(effectiveCPM * 100) / 100,
        adRevenue: monthlyRevenue,
        youtubeShare: Math.round(monthlyRevenue * 0.32), // YouTube's 32%
        creatorShare: Math.round(monthlyRevenue * 0.68), // Creator's 68%
      },
    }
  }

  private static calculateBaseCPM(category: string, geo: string): number {
    // Base CPM varies by category and geo
    let baseCPM = 2.5 // $2.50 default

    // Category adjustments
    if (category === "finance") baseCPM = 4.0
    else if (category === "tech") baseCPM = 3.5
    else if (category === "gaming") baseCPM = 2.0

    return baseCPM
  }

  private static calculateAdImpressionRate(metrics: ChannelMetrics): number {
    let baseRate = 8500 // 85%

    // Engagement bonus
    if (metrics.engagementRate > 500)
      baseRate += 1000 // +10%
    else if (metrics.engagementRate > 300) baseRate += 500 // +5%

    // Watch time bonus
    if (metrics.avgWatchTime > 300)
      baseRate += 500 // +5%
    else if (metrics.avgWatchTime > 180) baseRate += 250 // +2.5%

    return Math.min(baseRate, 9500) // Cap at 95%
  }

  private static estimateMonthlyViews(metrics: ChannelMetrics): number {
    let monthlyViews = metrics.avgViews * 30

    // Subscriber engagement adjustment
    const subEngagement = (metrics.avgViews / metrics.subscribers) * 100

    if (subEngagement > 10)
      monthlyViews *= 1.1 // +10%
    else if (subEngagement < 2) monthlyViews *= 0.9 // -10%

    return Math.round(monthlyViews)
  }

  private static calculateConfidenceScore(metrics: ChannelMetrics): number {
    let confidence = 5000 // 50%

    // Channel age
    if (metrics.channelAge > 24) confidence += 2000
    else if (metrics.channelAge > 12) confidence += 1000

    // Subscriber count
    if (metrics.subscribers > 1000000) confidence += 2000
    else if (metrics.subscribers > 100000) confidence += 1500
    else if (metrics.subscribers > 10000) confidence += 1000

    // Engagement
    if (metrics.engagementRate > 500) confidence += 1000
    else if (metrics.engagementRate > 300) confidence += 500

    return Math.min(confidence, 9500) // Cap at 95%
  }
}
