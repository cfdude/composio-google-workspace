import { Composio } from '@composio/core'
import { AnthropicProvider } from '@composio/anthropic'
import Anthropic from '@anthropic-ai/sdk'
import { config } from 'dotenv'

// Load environment variables
config()

// Composio Project Configuration
const COMPOSIO_PROJECT_ID = 'pr_0gbTWo9BfjM8'
const USER_ID = process.env.USER_GOOGLE_EMAIL || 'rsherman@velocityinteractive.com'

/**
 * Google Workspace MCP Server integration with Composio.dev
 * Migrated from existing MCP server implementation
 */
export class GoogleWorkspaceMCP {
  private composio: Composio
  private anthropic: Anthropic
  private userId: string

  constructor(userId: string = USER_ID) {
    this.userId = userId
    
    // Initialize Anthropic
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    // Initialize Composio with AnthropicProvider
    this.composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
      provider: new AnthropicProvider(),
    })
  }

  /**
   * Initialize authentication for Google Workspace services
   * This creates a connection that can be used by all Google Workspace tools
   */
  async initializeAuthentication(authConfigId: string): Promise<void> {
    try {
      console.log(`🔐 Initializing authentication for user: ${this.userId}`)
      
      const connectionRequest = await this.composio.connectedAccounts.initiate(
        authConfigId,
        this.userId
      )

      if (connectionRequest.redirectUrl) {
        console.log(`🔗 Please authorize the app by visiting: ${connectionRequest.redirectUrl}`)
        
        // Wait for connection to be established
        const connectedAccount = await connectionRequest.waitForConnection()
        console.log(`✅ Connection established! Connected account id: ${connectedAccount.id}`)
        
        return connectedAccount
      }
    } catch (error) {
      console.error('❌ Authentication failed:', error)
      throw error
    }
  }

  /**
   * Get available Google Workspace tools
   * Maps to the existing MCP server's tool registry
   */
  async getGoogleWorkspaceTools(): Promise<any[]> {
    try {
      console.log('📦 Fetching Google Workspace tools...')
      
      const tools = await this.composio.tools.get(this.userId, {
        tools: [
          // Gmail tools (mapped from existing MCP server)
          "GMAIL_SEND_EMAIL",
          "GMAIL_GET_MESSAGE", 
          "GMAIL_SEARCH_MESSAGES",
          "GMAIL_GET_THREAD",
          "GMAIL_MODIFY_LABELS",
          "GMAIL_LIST_LABELS",
          
          // Calendar tools
          "GOOGLECALENDAR_CREATE_EVENT",
          "GOOGLECALENDAR_LIST_EVENTS", 
          "GOOGLECALENDAR_UPDATE_EVENT",
          "GOOGLECALENDAR_DELETE_EVENT",
          
          // Drive tools
          "GOOGLEDRIVE_UPLOAD_FILE",
          "GOOGLEDRIVE_SEARCH_FILES",
          "GOOGLEDRIVE_GET_FILE",
          "GOOGLEDRIVE_DELETE_FILE",
          
          // Docs tools  
          "GOOGLEDOCS_CREATE_DOCUMENT",
          "GOOGLEDOCS_GET_DOCUMENT",
          "GOOGLEDOCS_UPDATE_DOCUMENT",
          
          // Sheets tools
          "GOOGLESHEETS_CREATE_SPREADSHEET",
          "GOOGLESHEETS_READ_VALUES",
          "GOOGLESHEETS_UPDATE_VALUES"
        ],
      })

      console.log(`✅ Found ${tools.length} Google Workspace tools`)
      return tools
    } catch (error) {
      console.error('❌ Failed to fetch tools:', error)
      throw error
    }
  }

  /**
   * Send email using Gmail (equivalent to existing MCP tool)
   */
  async sendEmail(to: string, subject: string, body: string): Promise<any> {
    try {
      console.log(`📧 Sending email to ${to}: "${subject}"`)
      
      const tools = await this.composio.tools.get(this.userId, {
        tools: ["GMAIL_SEND_EMAIL"],
      })

      const msg = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        messages: [
          {
            role: "user",
            content: `Send an email to ${to} with the subject '${subject}' and the body '${body}'`,
          },
        ],
        tools: tools,
        max_tokens: 1000,
      })

      const result = await this.composio.provider.handleToolCalls(this.userId, msg)
      console.log("✅ Email sent successfully!")
      
      return result
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      throw error
    }
  }

  /**
   * Search Gmail messages (equivalent to existing MCP tool)
   */
  async searchGmailMessages(query: string, maxResults: number = 10): Promise<any> {
    try {
      console.log(`🔍 Searching Gmail messages: "${query}"`)
      
      const tools = await this.composio.tools.get(this.userId, {
        tools: ["GMAIL_SEARCH_MESSAGES"],
      })

      const msg = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620", 
        messages: [
          {
            role: "user",
            content: `Search Gmail for messages matching "${query}" and return the first ${maxResults} results`,
          },
        ],
        tools: tools,
        max_tokens: 1000,
      })

      const result = await this.composio.provider.handleToolCalls(this.userId, msg)
      console.log(`✅ Found Gmail messages for query: ${query}`)
      
      return result
    } catch (error) {
      console.error('❌ Failed to search Gmail messages:', error)
      throw error
    }
  }

  /**
   * Create calendar event (equivalent to existing MCP tool)  
   */
  async createCalendarEvent(event: {
    summary: string
    start: string
    end: string  
    description?: string
    attendees?: string[]
    location?: string
  }): Promise<any> {
    try {
      console.log(`📅 Creating calendar event: "${event.summary}"`)
      
      const tools = await this.composio.tools.get(this.userId, {
        tools: ["GOOGLECALENDAR_CREATE_EVENT"],
      })

      const eventDescription = `Create a calendar event with the following details:
        - Title: ${event.summary}
        - Start: ${event.start}
        - End: ${event.end}
        - Description: ${event.description || ''}
        - Location: ${event.location || ''}
        - Attendees: ${event.attendees?.join(', ') || 'None'}`

      const msg = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        messages: [
          {
            role: "user", 
            content: eventDescription,
          },
        ],
        tools: tools,
        max_tokens: 1000,
      })

      const result = await this.composio.provider.handleToolCalls(this.userId, msg)
      console.log("✅ Calendar event created successfully!")
      
      return result
    } catch (error) {
      console.error('❌ Failed to create calendar event:', error)
      throw error
    }
  }

  /**
   * Setup Gmail trigger for new messages (equivalent to existing MCP trigger)
   */
  async setupGmailTrigger(connectedAccountId: string): Promise<any> {
    try {
      console.log('🔔 Setting up Gmail trigger for new messages...')
      
      const trigger = await this.composio.triggers.create(
        this.userId,
        "GMAIL_NEW_GMAIL_MESSAGE",
        {
          connectedAccountId: connectedAccountId,
          triggerConfig: {
            labelIds: "INBOX",
            userId: "me", 
            interval: 1
          },
        }
      )
      
      console.log(`✅ Trigger created successfully. Trigger Id: ${trigger.triggerId}`)
      
      // Subscribe to trigger events
      this.composio.triggers.subscribe(
        (data) => {
          console.log(`⚡️ Trigger event received for ${data.triggerSlug}`, JSON.stringify(data, null, 2))
        },
        { triggerId: trigger.triggerId }
      )
      
      return trigger
    } catch (error) {
      console.error('❌ Failed to setup Gmail trigger:', error)
      throw error
    }
  }
}

/**
 * Main application entry point
 * Demonstrates the migrated Google Workspace MCP functionality
 */
async function main() {
  try {
    console.log('🚀 Google Workspace MCP Server (Composio.dev Integration)')
    console.log('=' .repeat(60))
    console.log(`📋 Project ID: ${COMPOSIO_PROJECT_ID}`)
    console.log(`👤 User ID: ${USER_ID}`)
    console.log('')
    
    // Validate environment
    if (!process.env.COMPOSIO_API_KEY) {
      throw new Error('COMPOSIO_API_KEY environment variable is required')
    }
    
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required')  
    }
    
    // Initialize the MCP server
    const mcpServer = new GoogleWorkspaceMCP(USER_ID)
    
    // Example 1: Get available tools
    console.log('📦 Example 1: Listing Google Workspace tools')
    const tools = await mcpServer.getGoogleWorkspaceTools()
    console.log(`Found ${tools.length} tools available through Composio`)
    console.log('')
    
    // Example 2: Authentication setup (commented for demo)
    console.log('🔐 Example 2: Authentication Setup')
    console.log('To set up authentication, you would call:')
    console.log('  await mcpServer.initializeAuthentication("<authConfigId>")')
    console.log('')
    
    // Example 3: Tool usage (commented for demo)
    console.log('📧 Example 3: Tool Usage Examples') 
    console.log('Once authenticated, you can use tools like:')
    console.log('  await mcpServer.sendEmail("user@example.com", "Hello", "Test message")')
    console.log('  await mcpServer.searchGmailMessages("from:me", 5)')
    console.log('  await mcpServer.createCalendarEvent({...eventDetails})')
    console.log('')
    
    console.log('✅ Google Workspace MCP Server initialized successfully!')
    console.log('📚 Next steps:')
    console.log('  1. Set up Google OAuth credentials in Composio.dev')  
    console.log('  2. Create auth config and get authConfigId')
    console.log('  3. Call initializeAuthentication() with your authConfigId')
    console.log('  4. Use the available Google Workspace tools')
    
  } catch (error) {
    console.error('❌ Application failed:', error)
    process.exit(1)
  }
}

// GoogleWorkspaceMCP is already exported as part of the class declaration

// Run main function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}