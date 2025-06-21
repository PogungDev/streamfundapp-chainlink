#!/bin/bash

# Stream Fund Development Script
echo "🌊 Stream Fund - Development Setup"
echo "================================="

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating .env.local from template..."
    cp .env.example .env.local
    echo "✅ Please edit .env.local with your configuration"
fi

# Start development server
echo "🚀 Starting development server..."
echo "   Local:    http://localhost:3000"
echo "   Network:  http://$(ipconfig getifaddr en0):3000"
echo ""
echo "Press Ctrl+C to stop"

pnpm dev 