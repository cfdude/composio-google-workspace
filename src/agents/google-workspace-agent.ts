import { composio as _composio, executeTool, getAvailableTools } from '../composio-client.js'

/**
 * AI Agent for Google Workspace automation
 * Provides high-level methods for common workspace tasks
 */
export class GoogleWorkspaceAgent {
  private userId: string
  private connectedServices: Set<string> = new Set()

  constructor(userId: string = 'default') {
    this.userId = userId
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): string[] {
    return [
      'Email Management',
      'Calendar Operations',
      'Document Processing',
      'Drive File Management',
      'Meeting Scheduling',
      'Task Automation',
    ]
  }

  /**
   * Initialize agent with required services
   */
  async initialize(services: string[] = ['gmail', 'googlecalendar', 'googledrive']): Promise<void> {
    try {
      console.log(`🤖 Initializing Google Workspace Agent for user: ${this.userId}`)

      // Check available tools for each service
      for (const service of services) {
        const tools = await getAvailableTools([service], this.userId)
        if (tools.length > 0) {
          this.connectedServices.add(service)
          console.log(`✅ ${service} ready (${tools.length} tools available)`)
        } else {
          console.log(`⚠️  ${service} not connected - authentication required`)
        }
      }

      console.log(`🚀 Agent initialized with ${this.connectedServices.size} connected services`)
    } catch (error) {
      console.error('❌ Failed to initialize agent:', error)
      throw error
    }
  }

  /**
   * Send an email using Gmail
   */
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    options?: {
      cc?: string
      bcc?: string
      attachments?: string[]
    }
  ): Promise<any> {
    if (!this.connectedServices.has('gmail')) {
      throw new Error('Gmail not connected. Please authenticate first.')
    }

    const emailData = {
      to,
      subject,
      body,
      ...options,
    }

    console.log(`📧 Sending email to ${to}: "${subject}"`)
    return await executeTool('GMAIL_SEND_EMAIL', this.userId, emailData)
  }

  /**
   * Fetch recent emails
   */
  async getRecentEmails(maxResults: number = 10, query?: string): Promise<any> {
    if (!this.connectedServices.has('gmail')) {
      throw new Error('Gmail not connected. Please authenticate first.')
    }

    const searchParams = {
      maxResults,
      query: query || 'in:inbox',
      userId: 'me',
    }

    console.log(`📬 Fetching ${maxResults} recent emails`)
    return await executeTool('GMAIL_FETCH_EMAILS', this.userId, searchParams)
  }

  /**
   * Create a calendar event
   */
  async createCalendarEvent(event: {
    title: string
    start: string
    end: string
    description?: string
    attendees?: string[]
    location?: string
  }): Promise<any> {
    if (!this.connectedServices.has('googlecalendar')) {
      throw new Error('Google Calendar not connected. Please authenticate first.')
    }

    console.log(`📅 Creating calendar event: "${event.title}"`)
    return await executeTool('GOOGLECALENDAR_CREATE_EVENT', this.userId, {
      summary: event.title,
      start: { dateTime: event.start },
      end: { dateTime: event.end },
      description: event.description,
      attendees: event.attendees?.map(email => ({ email })),
      location: event.location,
    })
  }

  /**
   * List upcoming calendar events
   */
  async getUpcomingEvents(maxResults: number = 10, timeMin?: string): Promise<any> {
    if (!this.connectedServices.has('googlecalendar')) {
      throw new Error('Google Calendar not connected. Please authenticate first.')
    }

    const params = {
      maxResults,
      timeMin: timeMin || new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    }

    console.log(`📅 Fetching ${maxResults} upcoming events`)
    return await executeTool('GOOGLECALENDAR_LIST_EVENTS', this.userId, params)
  }

  /**
   * Upload file to Google Drive
   */
  async uploadToDrive(filename: string, content: string, parentFolderId?: string): Promise<any> {
    if (!this.connectedServices.has('googledrive')) {
      throw new Error('Google Drive not connected. Please authenticate first.')
    }

    const uploadParams = {
      name: filename,
      content,
      parents: parentFolderId ? [parentFolderId] : undefined,
    }

    console.log(`📁 Uploading file to Drive: "${filename}"`)
    return await executeTool('GOOGLEDRIVE_UPLOAD_FILE', this.userId, uploadParams)
  }

  /**
   * Search files in Google Drive
   */
  async searchDriveFiles(query: string, maxResults: number = 10): Promise<any> {
    if (!this.connectedServices.has('googledrive')) {
      throw new Error('Google Drive not connected. Please authenticate first.')
    }

    const searchParams = {
      q: query,
      pageSize: maxResults,
    }

    console.log(`🔍 Searching Drive files: "${query}"`)
    return await executeTool('GOOGLEDRIVE_SEARCH_FILES', this.userId, searchParams)
  }

  /**
   * Workflow: Schedule meeting and send invites
   */
  async scheduleMeetingWithInvites(meeting: {
    title: string
    start: string
    end: string
    attendees: string[]
    agenda?: string
    location?: string
  }): Promise<{ event: any; emailsSent: any[] }> {
    console.log(`🤝 Orchestrating meeting workflow: "${meeting.title}"`)

    // Create calendar event
    const event = await this.createCalendarEvent(meeting)

    // Send email invites with agenda
    const emailPromises = meeting.attendees.map(async attendee => {
      const emailBody = `
Hi,

You're invited to "${meeting.title}"

📅 When: ${new Date(meeting.start).toLocaleString()} - ${new Date(meeting.end).toLocaleString()}
📍 Where: ${meeting.location || 'Online'}

${meeting.agenda ? `📋 Agenda:\n${meeting.agenda}` : ''}

Please confirm your attendance.

Best regards
      `.trim()

      return await this.sendEmail(attendee, `Meeting Invite: ${meeting.title}`, emailBody)
    })

    const emailsSent = await Promise.all(emailPromises)

    console.log(`✅ Meeting workflow completed: Event created, ${emailsSent.length} invites sent`)

    return { event, emailsSent }
  }

  /**
   * Workflow: Email summary with calendar integration
   */
  async generateDailySummary(date?: string): Promise<string> {
    const targetDate = date || new Date().toISOString().split('T')[0]
    console.log(`📊 Generating daily summary for ${targetDate}`)

    try {
      // Get emails from today
      const emailQuery = `after:${targetDate} before:${targetDate}`
      const emails = await this.getRecentEmails(50, emailQuery)

      // Get calendar events for today
      const dayStart = `${targetDate}T00:00:00Z`
      const _dayEnd = `${targetDate}T23:59:59Z`
      const events = await this.getUpcomingEvents(20, dayStart)

      // Generate summary
      const summary = `
📅 Daily Summary for ${targetDate}

📧 EMAIL ACTIVITY:
- Total emails: ${emails?.messages?.length || 0}
- Important emails: ${emails?.messages?.filter((e: any) => e.labelIds?.includes('IMPORTANT'))?.length || 0}

📅 CALENDAR EVENTS:
- Total events: ${events?.items?.length || 0}
- Meetings: ${events?.items?.filter((e: any) => e.attendees?.length > 1)?.length || 0}

⚡ QUICK STATS:
- Most active time: Based on email timestamps
- Meeting load: ${events?.items?.length > 5 ? 'Heavy' : 'Moderate'}
- Action items: Email follow-ups needed

Generated at ${new Date().toLocaleString()}
      `.trim()

      console.log('✅ Daily summary generated')
      return summary
    } catch (error) {
      console.error('❌ Failed to generate daily summary:', error)
      return `Failed to generate summary: ${error}`
    }
  }

  /**
   * Get agent status and connected services
   */
  getStatus() {
    return {
      userId: this.userId,
      connectedServices: Array.from(this.connectedServices),
      capabilities: this.getCapabilities(),
      ready: this.connectedServices.size > 0,
    }
  }
}
