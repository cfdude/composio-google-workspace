import { Composio } from '@composio/core'
import { config } from 'dotenv'

// Load environment variables
config()

/**
 * Composio client instance configured with API key
 * This provides access to 3000+ tools across popular applications
 */
export const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  baseURL: process.env.COMPOSIO_BASE_URL, // Optional: defaults to official API
  allowTracking: true, // Enable telemetry for better support
})

/**
 * Initialize and validate Composio connection
 */
export async function initializeComposio(): Promise<void> {
  try {
    console.log('🔄 Initializing Composio SDK...')
    
    // Verify API key is configured
    if (!process.env.COMPOSIO_API_KEY) {
      throw new Error('COMPOSIO_API_KEY environment variable is required')
    }

    // Test connection by fetching available actions
    const actions = await composio.actions.list({ limit: 1 })
    console.log(`✅ Composio SDK initialized successfully with ${actions.length > 0 ? 'access to tools' : 'API connection'}`)
    
    // Log available Google Workspace toolkits
    const googleToolkits = ['gmail', 'googlecalendar', 'googledrive', 'googlesheets']
    console.log('📊 Available Google Workspace toolkits:', googleToolkits.join(', '))
    
  } catch (error) {
    console.error('❌ Failed to initialize Composio SDK:', error)
    throw error
  }
}

/**
 * Get available tools for specific toolkits
 * @param toolkits Array of toolkit names (e.g., ['gmail', 'googlecalendar'])
 * @param userId User identifier for connected accounts
 * @returns Available tools
 */
export async function getAvailableTools(toolkits: string[], userId: string = 'default') {
  try {
    console.log(`🔍 Fetching tools for toolkits: ${toolkits.join(', ')}`)
    
    const tools = await composio.tools.get(userId, {
      toolkits,
      limit: 50
    })
    
    console.log(`📦 Found ${tools.length} available tools`)
    return tools
  } catch (error) {
    console.error('❌ Failed to fetch tools:', error)
    throw error
  }
}

/**
 * Setup authentication for a toolkit
 * @param userId User identifier
 * @param toolkit Toolkit name (e.g., 'gmail')
 * @returns Connection request with redirect URL
 */
export async function setupAuthentication(userId: string, toolkit: string) {
  try {
    console.log(`🔐 Setting up authentication for ${toolkit}...`)
    
    // Create connection request for OAuth flow
    const connectionRequest = await composio.toolkits.authorize(userId, toolkit)
    
    if (connectionRequest.redirectUrl) {
      console.log(`🔗 Please visit this URL to authorize ${toolkit}:`)
      console.log(connectionRequest.redirectUrl)
      console.log('📝 After authorization, the connection will be automatically established')
    }
    
    return connectionRequest
  } catch (error) {
    console.error(`❌ Failed to setup authentication for ${toolkit}:`, error)
    throw error
  }
}

/**
 * Wait for authentication to complete
 * @param connectionRequestId Connection request ID from setupAuthentication
 * @param timeoutMs Maximum wait time in milliseconds (default: 60 seconds)
 * @returns Connected account information
 */
export async function waitForAuthentication(
  connectionRequestId: string, 
  timeoutMs: number = 60000
) {
  try {
    console.log('⏳ Waiting for authentication to complete...')
    
    const connectedAccount = await composio.connectedAccounts.waitForConnection(
      connectionRequestId,
      timeoutMs
    )
    
    console.log(`✅ Authentication successful! Connected Account ID: ${connectedAccount.id}`)
    return connectedAccount
  } catch (error) {
    console.error('❌ Authentication failed or timed out:', error)
    throw error
  }
}

/**
 * Execute a tool with proper error handling
 * @param toolSlug Tool identifier (e.g., 'GMAIL_SEND_EMAIL')
 * @param userId User identifier
 * @param arguments Tool arguments
 * @returns Tool execution result
 */
export async function executeTool(
  toolSlug: string,
  userId: string,
  toolArguments: Record<string, any>
) {
  try {
    console.log(`🚀 Executing tool: ${toolSlug}`)
    
    const result = await composio.tools.execute(toolSlug, {
      userId,
      arguments: toolArguments
    })
    
    if (result.successful) {
      console.log('✅ Tool executed successfully')
      return result.data
    } else {
      console.error('❌ Tool execution failed:', result.error)
      throw new Error(result.error)
    }
  } catch (error) {
    console.error(`❌ Failed to execute tool ${toolSlug}:`, error)
    throw error
  }
}