#!/bin/bash

# Deriv Sentinel - API Server Startup Script

echo "🚨 Starting Deriv Sentinel API Server..."
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Warning: Ollama is not running at http://localhost:11434"
    echo "   Some features may not work without Ollama."
    echo ""
fi

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "📦 Installing dependencies..."
source venv/bin/activate
pip install -q -r requirements.txt

echo ""
echo "🔥 Starting API Server..."
echo "📡 REST API: http://localhost:8000/api"
echo "🔌 WebSocket: ws://localhost:8000/ws/attacks"
echo "📊 API Docs: http://localhost:8000/docs"
echo ""

python3 api_server.py
