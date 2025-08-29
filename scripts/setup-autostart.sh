#!/bin/bash

# Auto-start Setup Script for Google Workspace MCP Service
# Configures the service to start automatically on boot

set -e

echo "🔧 Setting up auto-start for Google Workspace MCP Service..."
echo "="

cd "$(dirname "$0")/.."

# First, start the service normally
echo "🚀 Starting service..."
./scripts/start-service.sh

# Configure PM2 startup (generates platform-specific startup script)
echo "⚙️ Configuring PM2 auto-startup..."
pm2 startup

echo ""
echo "📋 IMPORTANT: Copy and run the command shown above as sudo to complete auto-start setup"
echo ""
echo "After running that command, the service will:"
echo "  ✅ Start automatically on boot"
echo "  ✅ Restart automatically if it crashes"
echo "  ✅ Be available for Rube MCP connections"
echo ""
echo "🔍 Verify auto-start setup:"
echo "  pm2 startup        - Check startup configuration"
echo "  pm2 list           - List running services"
echo "  pm2 save           - Save current process list"