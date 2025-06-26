// Chainlink Functions configuration for StreamFund AI
// This script fetches YouTube creator statistics for yield forecasting

const fs = require("fs");
const path = require("path");
const { SubscriptionManager, simulateScript, createGist } = require("@chainlink/functions-toolkit");

// Network configuration for Arbitrum Sepolia
const NETWORK_CONFIG = {
    chainId: 421614,
    name: "arbitrumSepolia",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    functionsRouter: "0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C",
    donId: "fun-arbitrum-sepolia-1",
    gatewayUrls: [
        "https://01.functions-gateway.testnet.chain.link/",
        "https://02.functions-gateway.testnet.chain.link/"
    ]
};

// JavaScript source code for Chainlink Functions
const SOURCE_CODE = `
// StreamFund AI - YouTube Creator Stats Fetcher
// Fetches RPM and yield forecast data for creator analysis

const channelId = args[0];
if (!channelId) {
    throw new Error("Channel ID is required");
}

console.log(\`Fetching data for channel: \${channelId}\`);

// In production, this would call YouTube Analytics API
// For demo, we'll use a mock API or hardcoded data
const mockApiUrl = \`https://api.streamfund.io/creator/\${channelId}/stats\`;

try {
    // Mock data for demo purposes
    const mockData = {
        channelId: channelId,
        subscriberCount: Math.floor(Math.random() * 1000000) + 10000,
        viewCount: Math.floor(Math.random() * 50000000) + 100000,
        estimatedRPM: Math.floor(Math.random() * 500) + 100, // $1-5 RPM
        monthlyViews: Math.floor(Math.random() * 5000000) + 50000,
        engagement: Math.random() * 0.1 + 0.02, // 2-12% engagement
        forecastedYield: 0
    };
    
    // Calculate forecasted yield based on views and RPM
    const monthlyRevenue = (mockData.monthlyViews * mockData.estimatedRPM) / 1000;
    const annualRevenue = monthlyRevenue * 12;
    
    // Conservative yield forecast (30% of annual revenue)
    mockData.forecastedYield = Math.floor(annualRevenue * 0.3);
    
    console.log(\`RPM: $\${mockData.estimatedRPM}\`);
    console.log(\`Monthly Views: \${mockData.monthlyViews.toLocaleString()}\`);
    console.log(\`Forecasted Annual Yield: $\${mockData.forecastedYield.toLocaleString()}\`);
    
    // Encode data for smart contract
    // RPM (in cents) + Forecast (in dollars) combined
    const rpmCents = mockData.estimatedRPM * 100;
    const forecastDollars = mockData.forecastedYield;
    const combinedData = rpmCents * 1000000 + forecastDollars;
    
    return Functions.encodeUint256(combinedData);
    
} catch (error) {
    console.error("Error fetching creator data:", error);
    throw new Error(\`Failed to fetch data: \${error.message}\`);
}
`;

// Function to create and register Chainlink Functions subscription
async function createSubscription() {
    console.log("🔗 Creating Chainlink Functions subscription...");
    
    const subscriptionManager = new SubscriptionManager({
        signer: undefined, // Will be set from environment
        linkTokenAddress: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E", // Arbitrum Sepolia LINK
        functionsRouterAddress: NETWORK_CONFIG.functionsRouter
    });
    
    try {
        const subscriptionId = await subscriptionManager.createSubscription();
        console.log("✅ Subscription created:", subscriptionId);
        
        // Fund subscription with LINK tokens
        const fundAmount = "2"; // 2 LINK tokens
        await subscriptionManager.fundSubscription({
            subscriptionId,
            amountInJuels: ethers.parseEther(fundAmount)
        });
        console.log(`✅ Subscription funded with ${fundAmount} LINK`);
        
        return subscriptionId;
    } catch (error) {
        console.error("❌ Failed to create subscription:", error);
        throw error;
    }
}

// Function to simulate Chainlink Functions locally
async function simulateFunction(channelId = "UCxample123") {
    console.log("🧪 Simulating Chainlink Functions locally...");
    
    const simulationConfig = {
        source: SOURCE_CODE,
        args: [channelId],
        bytesArgs: [],
        secrets: {},
        globalOffchainSecrets: {},
        numAllowedQueries: 5,
        maxQueryDurationMs: 10000,
        maxQueryUrlLength: 2048,
        maxQueryRequestBytes: 2048,
        maxQueryResponseBytes: 2048
    };
    
    try {
        const { responseBytesHexstring, capturedTerminalOutput, errorString } = await simulateScript(simulationConfig);
        
        console.log("📄 Terminal Output:");
        console.log(capturedTerminalOutput);
        
        if (errorString) {
            console.error("❌ Simulation Error:", errorString);
            return null;
        }
        
        console.log("✅ Response (hex):", responseBytesHexstring);
        
        // Decode response
        const responseBytes = responseBytesHexstring.slice(2); // Remove '0x'
        const responseInt = BigInt("0x" + responseBytes);
        
        const rpmCents = Number(responseInt / 1000000n);
        const forecastDollars = Number(responseInt % 1000000n);
        
        console.log("📊 Decoded Results:");
        console.log(`- RPM: $${rpmCents / 100}`);
        console.log(`- Forecasted Yield: $${forecastDollars.toLocaleString()}`);
        
        return {
            rpm: rpmCents / 100,
            forecast: forecastDollars,
            rawResponse: responseBytesHexstring
        };
        
    } catch (error) {
        console.error("❌ Simulation failed:", error);
        return null;
    }
}

// Function to create GitHub Gist for source code (for production)
async function createSourceGist() {
    console.log("📝 Creating GitHub Gist for source code...");
    
    try {
        const gistUrl = await createGist(
            process.env.GITHUB_API_TOKEN,
            {
                fileName: "streamfund-creator-stats.js",
                fileContent: SOURCE_CODE
            }
        );
        
        console.log("✅ Gist created:", gistUrl);
        return gistUrl;
    } catch (error) {
        console.error("❌ Failed to create Gist:", error);
        return null;
    }
}

// Main configuration object
const functionsConfig = {
    network: NETWORK_CONFIG,
    sourceCode: SOURCE_CODE,
    createSubscription,
    simulateFunction,
    createSourceGist
};

// Export for use in other scripts
module.exports = functionsConfig;

// CLI usage
if (require.main === module) {
    async function main() {
        const command = process.argv[2];
        const channelId = process.argv[3] || "UCxample123";
        
        switch (command) {
            case "simulate":
                await simulateFunction(channelId);
                break;
            case "create-subscription":
                await createSubscription();
                break;
            case "create-gist":
                await createSourceGist();
                break;
            default:
                console.log("Usage:");
                console.log("  node functions-config.js simulate [channelId]");
                console.log("  node functions-config.js create-subscription");
                console.log("  node functions-config.js create-gist");
        }
    }
    
    main().catch(console.error);
} 