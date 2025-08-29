#!/bin/bash

# Google Workspace MCP Service Startup Script
# This script builds the application and starts it as a PM2 service

set -e

echo "🚀 Starting Google Workspace MCP Service..."
echo "=" 

cd "$(dirname "$0")/.."

# Build the application
echo "🔧 Building TypeScript application..."
npm run build

# Create logs directory
mkdir -p logs

# Start with PM2
echo "🔄 Starting PM2 service..."
pm2 start ecosystem.config.js

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Show status
echo "📊 Service Status:"
pm2 status google-workspace-tools

echo ""
echo "✅ Google Workspace MCP Service started successfully!"
echo "🌐 Health check: http://localhost:8080/health"
echo "📊 Status endpoint: http://localhost:8080/status"
echo ""
echo "📝 Useful commands:"
echo "  pm2 status          - Check service status"
echo "  pm2 logs            - View service logs"  
echo "  pm2 restart all     - Restart service"
echo "  pm2 stop all        - Stop service"
echo "  pm2 delete all      - Remove service"