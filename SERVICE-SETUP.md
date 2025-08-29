# Google Workspace MCP Service Setup

This document explains how to set up the Google Workspace MCP server as a persistent background service that auto-starts when desktop clients connect to Rube MCP.

## Architecture

```
Desktop Client → Rube MCP → Google Workspace Service (PM2) → Custom Tools (83) + Auth (Composio)
```

- **Desktop clients** connect to Rube MCP (no client secrets needed)
- **Rube MCP** handles OAuth through Composio centrally
- **Google Workspace Service** runs as background service with 84 tools ready
- **Custom tools** execute locally but auth is managed by Composio

## Quick Setup

### 1. Install and Start Service

```bash
# Build and start the service
npm run build
pm2 start dist/service.js --name google-workspace-tools

# Save PM2 configuration
pm2 save

# Configure auto-start on boot (run the sudo command it shows)
pm2 startup
```

### 2. Verify Service is Running

```bash
# Check service status
pm2 status google-workspace-tools

# Test health endpoint
curl http://localhost:8080/health

# View service logs
pm2 logs google-workspace-tools
```

### 3. Service Management Commands

```bash
# Start service
npm run service:start        # Uses startup script
pm2 start google-workspace-tools

# Stop service  
npm run service:stop
pm2 stop google-workspace-tools

# Restart service
npm run service:restart
pm2 restart google-workspace-tools

# View logs
npm run service:logs
pm2 logs google-workspace-tools

# Check status
npm run service:status
pm2 status google-workspace-tools
```

## Service Configuration

The service runs with these endpoints:

- **Health Check**: `http://localhost:8080/health`
- **Status**: `http://localhost:8080/status`
- **Graceful Shutdown**: `http://localhost:8080/shutdown`

## Auto-Startup Configuration

After running `pm2 startup`, the service will:

✅ **Start automatically on boot**
✅ **Restart automatically if it crashes**  
✅ **Be always available for Rube MCP connections**
✅ **No client secrets needed on desktop computers**

## Desktop Client Integration

Desktop computers only need:

1. **Rube MCP** configured to connect to Composio
2. **Authentication** handled centrally through Composio OAuth
3. **No Google client secrets** required locally

The Google Workspace service runs persistently in the background, ready to serve all 84 tools whenever Rube MCP needs them.

## Monitoring

- PM2 automatically monitors the service health
- Built-in health endpoints for external monitoring
- Automatic restart on crashes or memory limits
- Detailed logging for troubleshooting

## Tools Available

**83 Custom Tools + 1 Auth (Composio) = 84 Total**

- Gmail: 11 tools
- Docs: 14 + 4 comments = 18 tools
- Sheets: 6 + 4 comments = 10 tools  
- Calendar: 5 tools
- Drive: 6 tools
- Tasks: 12 tools
- Forms: 5 tools
- Slides: 5 + 4 comments = 9 tools
- Chat: 4 tools
- Search: 3 tools

All tools are loaded in-memory and ready for immediate use through Rube MCP integration.