// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract AdvancedForecastEngine is Ownable {
    using SafeMath for uint256;
    
    struct ChannelMetrics {
        uint256 subscribers;
        uint256 avgViews;
        uint256 avgWatchTime; // in seconds
        uint256 ctr; // Click-through rate (basis points, 100 = 1%)
        uint256 engagementRate; // basis points
        uint256 channelAge; // in months
        string category; // "gaming", "tech", "finance", etc.
        string primaryGeo; // "US", "UK", "DE", etc.
    }
    
    struct RevenueFactors {
        uint256 baseCPM; // Base CPM in cents
        uint256 adImpressionRate; // % of views that show ads (basis points)
        uint256 revenueShare; // YouTube's revenue share (basis points, 6800 = 68%)
        uint256 seasonalMultiplier; // Current seasonal factor (basis points)
        uint256 geoMultiplier; // Geographic multiplier (basis points)
        uint256 categoryMultiplier; // Category multiplier (basis points)
    }
    
    mapping(string => uint256) public categoryMultipliers;
    mapping(string => uint256) public geoMultipliers;
    mapping(uint256 => uint256) public seasonalFactors; // month => multiplier
    
    event RevenueCalculated(
        address indexed creator,
        uint256 estimatedMonthlyRevenue,
        uint256 rpm,
        uint256 confidence
    );
    
    constructor() {
        // Initialize category multipliers (basis points, 10000 = 100%)
        categoryMultipliers["gaming"] = 8500;      // Gaming: 85% of base
        categoryMultipliers["tech"] = 12000;       // Tech: 120% of base
        categoryMultipliers["finance"] = 15000;    // Finance: 150% of base
        categoryMultipliers["lifestyle"] = 7000;   // Lifestyle: 70% of base
        categoryMultipliers["education"] = 9000;   // Education: 90% of base
        categoryMultipliers["entertainment"] = 8000; // Entertainment: 80% of base
        
        // Initialize geo multipliers (basis points)
        geoMultipliers["US"] = 15000;  // US: 150% of base
        geoMultipliers["UK"] = 12000;  // UK: 120% of base
        geoMultipliers["DE"] = 11000;  // Germany: 110% of base
        geoMultipliers["CA"] = 13000;  // Canada: 130% of base
        geoMultipliers["AU"] = 11500;  // Australia: 115% of base
        geoMultipliers["IN"] = 3000;   // India: 30% of base
        geoMultipliers["ID"] = 2500;   // Indonesia: 25% of base
        geoMultipliers["BR"] = 4000;   // Brazil: 40% of base
        
        // Initialize seasonal factors (basis points)
        seasonalFactors[1] = 9000;   // January: 90%
        seasonalFactors[2] = 8500;   // February: 85%
        seasonalFactors[3] = 9500;   // March: 95%
        seasonalFactors[4] = 10000;  // April: 100%
        seasonalFactors[5] = 10500;  // May: 105%
        seasonalFactors[6] = 9500;   // June: 95%
        seasonalFactors[7] = 9000;   // July: 90%
        seasonalFactors[8] = 9500;   // August: 95%
        seasonalFactors[9] = 10500;  // September: 105%
        seasonalFactors[10] = 11500; // October: 115%
        seasonalFactors[11] = 13000; // November: 130% (Black Friday)
        seasonalFactors[12] = 14000; // December: 140% (Holiday season)
    }
    
    function calculateAdvancedRevenue(
        ChannelMetrics memory metrics,
        uint256 currentMonth
    ) public view returns (
        uint256 monthlyRevenue,
        uint256 rpm,
        uint256 confidence,
        RevenueFactors memory factors
    ) {
        // Base CPM calculation based on category and geo
        uint256 baseCPM = calculateBaseCPM(metrics.category, metrics.primaryGeo);
        
        // Calculate ad impression rate based on content type and engagement
        uint256 adImpressionRate = calculateAdImpressionRate(metrics);
        
        // Get seasonal multiplier
        uint256 seasonalMultiplier = seasonalFactors[currentMonth];
        if (seasonalMultiplier == 0) seasonalMultiplier = 10000; // Default 100%
        
        // Calculate effective CPM
        uint256 effectiveCPM = baseCPM
            .mul(categoryMultipliers[metrics.category]).div(10000)
            .mul(geoMultipliers[metrics.primaryGeo]).div(10000)
            .mul(seasonalMultiplier).div(10000);
        
        // Calculate RPM (Revenue Per Mille)
        // RPM = CPM × Ad Impression Rate × Revenue Share
        rpm = effectiveCPM
            .mul(adImpressionRate).div(10000)  // Apply ad impression rate
            .mul(6800).div(10000);             // Apply YouTube's 68% revenue share
        
        // Calculate monthly revenue
        // Monthly Revenue = (Monthly Views × RPM) / 1000
        uint256 monthlyViews = estimateMonthlyViews(metrics);
        monthlyRevenue = monthlyViews.mul(rpm).div(1000);
        
        // Calculate confidence score
        confidence = calculateConfidenceScore(metrics);
        
        factors = RevenueFactors({
            baseCPM: baseCPM,
            adImpressionRate: adImpressionRate,
            revenueShare: 6800,
            seasonalMultiplier: seasonalMultiplier,
            geoMultiplier: geoMultipliers[metrics.primaryGeo],
            categoryMultiplier: categoryMultipliers[metrics.category]
        });
        
        emit RevenueCalculated(msg.sender, monthlyRevenue, rpm, confidence);
    }
    
    function calculateBaseCPM(
        string memory category,
        string memory geo
    ) internal pure returns (uint256) {
        // Base CPM in cents (e.g., 250 = $2.50)
        // This would typically come from external oracle in production
        return 250; // $2.50 base CPM
    }
    
    function calculateAdImpressionRate(
        ChannelMetrics memory metrics
    ) internal pure returns (uint256) {
        // Ad impression rate based on engagement and watch time
        // Higher engagement = more ads shown
        uint256 baseRate = 8500; // 85% base rate
        
        // Bonus for high engagement (up to +10%)
        if (metrics.engagementRate > 500) { // > 5% engagement
            baseRate = baseRate.add(1000); // +10%
        } else if (metrics.engagementRate > 300) { // > 3% engagement
            baseRate = baseRate.add(500);  // +5%
        }
        
        // Bonus for good watch time (up to +5%)
        if (metrics.avgWatchTime > 300) { // > 5 minutes
            baseRate = baseRate.add(500); // +5%
        } else if (metrics.avgWatchTime > 180) { // > 3 minutes
            baseRate = baseRate.add(250); // +2.5%
        }
        
        return baseRate;
    }
    
    function estimateMonthlyViews(
        ChannelMetrics memory metrics
    ) internal pure returns (uint256) {
        // Estimate monthly views based on current performance
        // Assumes consistent upload schedule
        uint256 baseMonthlyViews = metrics.avgViews.mul(30); // Daily avg * 30
        
        // Adjust based on subscriber engagement
        uint256 subEngagement = metrics.avgViews.mul(10000).div(metrics.subscribers);
        
        if (subEngagement > 1000) { // > 10% of subs watch each video
            baseMonthlyViews = baseMonthlyViews.mul(11000).div(10000); // +10%
        } else if (subEngagement < 200) { // < 2% of subs watch
            baseMonthlyViews = baseMonthlyViews.mul(9000).div(10000); // -10%
        }
        
        return baseMonthlyViews;
    }
    
    function calculateConfidenceScore(
        ChannelMetrics memory metrics
    ) internal pure returns (uint256) {
        uint256 confidence = 5000; // Start with 50%
        
        // Channel age factor
        if (metrics.channelAge > 24) confidence = confidence.add(2000); // +20%
        else if (metrics.channelAge > 12) confidence = confidence.add(1000); // +10%
        
        // Subscriber count factor
        if (metrics.subscribers > 1000000) confidence = confidence.add(2000); // +20%
        else if (metrics.subscribers > 100000) confidence = confidence.add(1500); // +15%
        else if (metrics.subscribers > 10000) confidence = confidence.add(1000); // +10%
        
        // Engagement factor
        if (metrics.engagementRate > 500) confidence = confidence.add(1000); // +10%
        else if (metrics.engagementRate > 300) confidence = confidence.add(500); // +5%
        
        // View consistency (simplified)
        if (metrics.avgViews > metrics.subscribers.div(10)) {
            confidence = confidence.add(500); // +5% for good view ratio
        }
        
        return confidence > 9500 ? 9500 : confidence; // Cap at 95%
    }
    
    // Admin functions to update multipliers
    function updateCategoryMultiplier(
        string memory category,
        uint256 multiplier
    ) external onlyOwner {
        categoryMultipliers[category] = multiplier;
    }
    
    function updateGeoMultiplier(
        string memory geo,
        uint256 multiplier
    ) external onlyOwner {
        geoMultipliers[geo] = multiplier;
    }
    
    function updateSeasonalFactor(
        uint256 month,
        uint256 factor
    ) external onlyOwner {
        require(month >= 1 && month <= 12, "Invalid month");
        seasonalFactors[month] = factor;
    }
}
