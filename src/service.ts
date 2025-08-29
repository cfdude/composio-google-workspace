import express from 'express'
import { GoogleWorkspaceMCP } from './index.js'
import { config } from 'dotenv'

// Load environment variables
config()

const PORT = process.env.PORT || 8080
const USER_ID = process.env.USER_GOOGLE_EMAIL || 'rsherman@velocityinteractive.com'

/**
 * Service wrapper for Google Workspace MCP Server
 * Runs as a persistent background service with health monitoring
 */
class GoogleWorkspaceService {
  private app: express.Application
  private mcpServer: GoogleWorkspaceMCP
  private isReady: boolean = false

  constructor() {
    this.app = express()
    this.mcpServer = new GoogleWorkspaceMCP(USER_ID)
    this.setupRoutes()
  }

  private setupRoutes(): void {
    // Health check endpoint for PM2 monitoring
    this.app.get('/health', (req, res) => {
      res.json({
        status: this.isReady ? 'ready' : 'initializing',
        service: 'google-workspace-tools',
        tools_count: 84,
        user_id: USER_ID,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
      })
    })

    // Status endpoint
    this.app.get('/status', (req, res) => {
      res.json({
        initialized: this.isReady,
        tools_ready: this.isReady,
        user_id: USER_ID,
        composio_project: process.env.COMPOSIO_PROJECT_ID,
        start_time: new Date().toISOString()
      })
    })

    // Graceful shutdown
    this.app.get('/shutdown', (req, res) => {
      res.json({ message: 'Shutting down gracefully...' })
      setTimeout(() => process.exit(0), 1000)
    })
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Google Workspace Service Starting...')
      console.log(`👤 User: ${USER_ID}`)
      console.log(`🔧 Initializing 84 custom tools...`)
      
      // Initialize all custom tools
      await this.mcpServer.initializeCustomTools()
      
      this.isReady = true
      console.log('✅ Google Workspace Service Ready!')
      console.log(`🌐 Health endpoint: http://localhost:${PORT}/health`)
      console.log(`📊 Status endpoint: http://localhost:${PORT}/status`)
    } catch (error) {
      console.error('❌ Service initialization failed:', error)
      throw error
    }
  }

  async start(): Promise<void> {
    // Initialize tools first
    await this.initialize()

    // Start HTTP server for health monitoring
    this.app.listen(PORT, () => {
      console.log(`🌐 Service listening on port ${PORT}`)
      console.log('🔧 Ready to serve Google Workspace tools via Composio/Rube')
    })
  }

  // Expose MCP server instance for external access if needed
  getMCPServer(): GoogleWorkspaceMCP {
    return this.mcpServer
  }
}

// Main service entry point
async function startService() {
  try {
    const service = new GoogleWorkspaceService()
    await service.start()
    
    // Keep service running
    process.on('SIGINT', () => {
      console.log('\n👋 Service shutdown requested')
      process.exit(0)
    })
    
  } catch (error) {
    console.error('💥 Service failed to start:', error)
    process.exit(1)
  }
}

// Auto-start if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startService().catch(console.error)
}

export { GoogleWorkspaceService }