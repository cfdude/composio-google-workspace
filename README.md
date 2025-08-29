# Google Workspace MCP Service

A production-ready Google Workspace MCP service providing 84 specialized tools for comprehensive Google Workspace automation. Designed to run as a persistent background service integrating with Rube MCP for centralized OAuth authentication.

## 🚀 Features

- **84 Custom Tools**: Complete Google Workspace API coverage (83 tools + 1 auth via Composio)
- **MCP Service**: Persistent background service with PM2 process management
- **Centralized Auth**: OAuth handled by Composio/Rube (no client secrets on desktops)
- **TypeScript**: Full type safety with modern ES2022 features
- **ES Modules**: Native ES module support throughout
- **Auto-startup**: Configurable boot-time service activation
- **Health Monitoring**: Built-in health endpoints for service monitoring
- **PKCE Compliant**: Solves security compliance for remote workforce

## 📋 Prerequisites

- Node.js 18+ with npm
- [Composio API Key](https://app.composio.dev/settings)
- [Anthropic API Key](https://console.anthropic.com/) (optional, for AI features)
- Google Workspace account for testing

## 🛠️ Quick Start

### 1. Installation

```bash
# Clone or download the project
git clone <repository-url>
cd composio-google-workspace

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
COMPOSIO_API_KEY=your_composio_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Development

```bash
# Run in development mode
npm run dev

# Or build and run
npm run build
npm start
```

## 🏗️ Project Structure

```
src/
├── agents/                    # AI agent implementations
│   └── google-workspace-agent.ts
├── tools/                     # Custom tool definitions
│   └── custom-tools.ts
├── composio-client.ts         # Composio SDK initialization
└── index.ts                   # Main application entry
```

## 🤖 Google Workspace Agent

The `GoogleWorkspaceAgent` class provides high-level methods for common workspace tasks:

```typescript
import { GoogleWorkspaceAgent } from './src/agents/google-workspace-agent.js'

const agent = new GoogleWorkspaceAgent('user-123')
await agent.initialize(['gmail', 'googlecalendar'])

// Send emails
await agent.sendEmail('colleague@company.com', 'Project Update', 'Here is the status...')

// Create calendar events  
await agent.createCalendarEvent({
  title: 'Team Standup',
  start: '2024-01-15T09:00:00Z',
  end: '2024-01-15T09:30:00Z',
  attendees: ['team@company.com']
})

// Complex workflows
await agent.scheduleMeetingWithInvites({
  title: 'Q1 Planning',
  start: '2024-01-20T14:00:00Z', 
  end: '2024-01-20T15:00:00Z',
  attendees: ['stakeholder1@company.com', 'stakeholder2@company.com'],
  agenda: 'Q1 objectives and resource allocation'
})
```

## 🔧 Custom Tools

Create specialized tools for your workspace needs:

```typescript
import { initializeCustomTools } from './src/tools/custom-tools.js'

// Initialize all custom tools
const tools = await initializeCustomTools()

// Available custom tools:
// - EMAIL_ANALYTICS: Analyze email patterns
// - MEETING_OPTIMIZER: Find optimal meeting times  
// - DOCUMENT_INTELLIGENCE: Extract insights from documents
// - WORKSPACE_WORKFLOW: Automate cross-app workflows
```

## 🔐 Authentication Flow

### Option 1: Interactive Setup

```typescript
import { setupAuthentication, waitForAuthentication } from './src/composio-client.js'

// Setup Gmail authentication
const connectionRequest = await setupAuthentication('user-123', 'gmail')
console.log('Visit this URL:', connectionRequest.redirectUrl)

// Wait for user to complete OAuth flow
const connectedAccount = await waitForAuthentication(connectionRequest.id)
console.log('Gmail connected:', connectedAccount.id)
```

### Option 2: Pre-configured Connections

Configure connections via the [Composio Dashboard](https://app.composio.dev) and reference them by ID.

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm start           # Run built application

# Code Quality
npm run typecheck   # TypeScript type checking
npm run lint        # ESLint code linting
npm run lint:fix    # Fix ESLint issues automatically
npm run format      # Format code with Prettier
npm run format:check # Check code formatting
```

## 🔗 Integration Examples

### Gmail Integration

```typescript
// Fetch recent emails
const emails = await agent.getRecentEmails(10, 'is:unread')

// Send email with attachments
await agent.sendEmail('client@company.com', 'Proposal', 'Please find attached...', {
  attachments: ['path/to/proposal.pdf']
})
```

### Calendar Integration

```typescript
// Get upcoming events
const events = await agent.getUpcomingEvents(5)

// Create recurring meeting
await agent.createCalendarEvent({
  title: 'Weekly Sync',
  start: '2024-01-15T10:00:00Z',
  end: '2024-01-15T10:30:00Z',
  recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=MO']
})
```

### Google Drive Integration

```typescript
// Upload documents
await agent.uploadToDrive('report.md', reportContent)

// Search files
const files = await agent.searchDriveFiles('type:document modified:2024')
```

## 🚀 Advanced Workflows

### Daily Summary Generation

```typescript
// Generate comprehensive daily summary
const summary = await agent.generateDailySummary('2024-01-15')
console.log(summary)
// Includes email activity, calendar events, and insights
```

### Meeting Orchestration

```typescript
// Complete meeting workflow: schedule + invites + follow-up
await agent.scheduleMeetingWithInvites({
  title: 'Product Review',
  start: '2024-01-20T15:00:00Z',
  end: '2024-01-20T16:00:00Z', 
  attendees: ['product@company.com', 'engineering@company.com'],
  agenda: 'Q1 product roadmap review and prioritization',
  location: 'Conference Room A'
})
```

## 🛡️ Error Handling

The project includes comprehensive error handling:

```typescript
try {
  await agent.sendEmail('invalid-email', 'Test', 'Body')
} catch (error) {
  console.error('Email failed:', error.message)
  // Handle specific error cases
}
```

## 📖 API Reference

### Composio Client

- `initializeComposio()` - Initialize SDK connection
- `getAvailableTools(toolkits, userId)` - List available tools
- `setupAuthentication(userId, toolkit)` - Start OAuth flow
- `waitForAuthentication(requestId)` - Wait for auth completion
- `executeTool(toolSlug, userId, arguments)` - Execute any tool

### Google Workspace Agent

- `initialize(services)` - Setup agent with required services
- `sendEmail()` - Send emails with attachments
- `getRecentEmails()` - Fetch and filter emails
- `createCalendarEvent()` - Create calendar events
- `getUpcomingEvents()` - List upcoming events
- `uploadToDrive()` - Upload files to Drive
- `searchDriveFiles()` - Search Drive content
- `generateDailySummary()` - Generate daily activity summary

## 🔧 Configuration

### TypeScript Configuration

The project uses modern TypeScript settings in `tsconfig.json`:

- Target: ES2022
- Module: ESNext
- Strict mode enabled
- Path aliases supported (`@/` → `src/`)

### Vite Configuration

Optimized for Node.js development:

- ES modules output
- Source maps enabled
- Proper external handling
- Path alias resolution

### Code Quality

- **ESLint**: TypeScript-aware linting with recommended rules
- **Prettier**: Consistent code formatting
- **Pre-commit hooks**: Automated formatting and linting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run quality checks: `npm run lint && npm run typecheck`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the ISC License. See the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Authentication Errors**
```bash
# Verify API keys are set
npm run dev
# Check console for authentication status
```

**TypeScript Errors**
```bash
# Run type checking
npm run typecheck

# Check for missing dependencies
npm install
```

**Build Issues**
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Getting Help

- [Composio Documentation](https://docs.composio.dev)
- [Composio Discord Community](https://discord.com/invite/composio)
- [GitHub Issues](https://github.com/composiohq/composio/issues)

## 🔮 What's Next?

- Add Anthropic Claude integration for AI-powered email responses
- Implement workflow scheduling and automation
- Add support for Google Sheets data processing
- Create dashboard for monitoring agent activities
- Add unit tests and CI/CD pipeline

---

Built with ❤️ using [Composio.dev](https://composio.dev) - The platform for AI agents to take actions in the real world.