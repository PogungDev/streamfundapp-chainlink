#!/bin/bash

# Stream Fund Deployment Script
echo "🚀 Stream Fund - Deployment Script"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Stream Fund App"
    echo "✅ Git repository initialized"
else
    echo "📝 Adding changes to git..."
    git add .
    git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Check if remote origin exists
if ! git remote | grep -q origin; then
    echo ""
    echo "🔗 Setup GitHub Repository:"
    echo "1. Create a new repository on GitHub"
    echo "2. Copy the repository URL"
    echo "3. Run: git remote add origin <repository-url>"
    echo "4. Run: git push -u origin main"
    echo ""
    read -p "Enter your GitHub repository URL: " repo_url
    if [ ! -empty "$repo_url" ]; then
        git remote add origin $repo_url
        git branch -M main
        git push -u origin main
        echo "✅ Pushed to GitHub"
    fi
else
    echo "📤 Pushing to GitHub..."
    git push
    echo "✅ Pushed to GitHub"
fi

# Deploy to Vercel
echo ""
echo "🌐 Deploying to Vercel..."
echo "Options:"
echo "1. Deploy via Vercel CLI (install with: npm i -g vercel)"
echo "2. Deploy via Vercel Dashboard (vercel.com)"
echo ""
read -p "Deploy via CLI? (y/n): " deploy_cli

if [ "$deploy_cli" = "y" ]; then
    if command -v vercel &> /dev/null; then
        vercel --prod
    else
        echo "❌ Vercel CLI not found"
        echo "Install with: npm install -g vercel"
        echo "Then run: vercel --prod"
    fi
else
    echo "🌐 Manual deployment steps:"
    echo "1. Go to https://vercel.com"
    echo "2. Click 'New Project'"
    echo "3. Import from GitHub"
    echo "4. Select your repository"
    echo "5. Configure environment variables"
    echo "6. Deploy!"
fi

echo ""
echo "✅ Deployment process completed!" 