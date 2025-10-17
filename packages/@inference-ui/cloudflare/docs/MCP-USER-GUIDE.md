# Inference UI MCP Server - User Guide

> **Complete guide to using the Inference UI Model Context Protocol (MCP) server with AI assistants**

## Table of Contents

- [What is MCP?](#what-is-mcp)
- [Why Use the MCP Server?](#why-use-the-mcp-server)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Using with AI Assistants](#using-with-ai-assistants)
- [Available Tools](#available-tools)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## What is MCP?

**Model Context Protocol (MCP)** is an open standard created by Anthropic that enables AI assistants like Claude to interact with external tools and data sources. Think of it as a universal connector that lets AI assistants:

- Query databases and APIs
- Ingest and analyze data
- Control external services
- Access real-time information

The Inference UI MCP Server implements this protocol, giving AI assistants direct access to your Inference UI platform.

### How It Works

```
┌─────────────────┐
│  AI Assistant   │  (Claude, Cline, etc.)
│   (You chat)    │
└────────┬────────┘
         │ MCP Protocol
         │ (stdio)
         ▼
┌─────────────────┐
│   MCP Server    │  (Inference UI MCP)
│  (Translates)   │
└────────┬────────┘
         │ HTTPS
         │
         ▼
┌─────────────────┐
│ Inference UI    │  (Cloudflare Workers)
│      API        │
└─────────────────┘
```

When you ask Claude a question like "Show me the last 10 button clicks," the MCP server translates that into an API call to Inference UI and returns the results.

---

## Why Use the MCP Server?

### For Non-Technical Users

✅ **Natural Language Interface**: Just ask questions in plain English
- "How many users clicked the signup button today?"
- "Track when someone submits the contact form"
- "Generate a summary of user interactions this week"

✅ **No Coding Required**: AI assistants handle the technical details
- No need to write GraphQL queries
- No need to understand API endpoints
- No need to format JSON requests

✅ **Instant Insights**: Get answers in seconds
- Query analytics data instantly
- Track events in real-time
- Generate reports with AI assistance

### For Developers

🚀 **Rapid Development**: Build faster with AI assistance
- AI writes GraphQL queries for you
- Automatic event tracking code generation
- Instant API testing and debugging

🔧 **Debugging & Testing**: AI helps troubleshoot issues
- Query production data directly
- Test event ingestion pipelines
- Debug analytics queries

📊 **Data Analysis**: AI-powered analytics
- Natural language data queries
- Automated report generation
- Trend analysis and predictions

---

## Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **AI Assistant** with MCP support:
  - Claude Desktop (recommended)
  - Cline VS Code Extension
  - Or any MCP-compatible client

### Quick Installation

```bash
# Navigate to the MCP server directory
cd packages/@inference-ui/cloudflare/mcp-server

# Install dependencies
npm install

# Build the server
npm run build

# Test it works
npm start
```

You should see: `Inference UI MCP Server started`

Press `Ctrl+C` to stop the test.

---

## Installation

### Method 1: Local Development

**Step 1: Clone and Build**

```bash
git clone https://github.com/your-org/inference-ui.git
cd inference-ui/packages/@inference-ui/cloudflare/mcp-server
npm install
npm run build
```

**Step 2: Note the Path**

The server executable is at:
```
/absolute/path/to/inference-ui/packages/@inference-ui/cloudflare/mcp-server/dist/index.js
```

You'll need this path for configuration.

### Method 2: Global Installation (Coming Soon)

```bash
npm install -g @inference-ui/mcp-server
```

---

## Configuration

### For Claude Desktop

**Step 1: Find Configuration File**

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Step 2: Edit Configuration**

Open the file and add the Inference UI MCP server:

```json
{
  "mcpServers": {
    "inference-ui": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-server/dist/index.js"
      ],
      "env": {
        "INFERENCE_UI_API_URL": "https://inference-ui-api.finhub.workers.dev"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/` with your actual path!

**Step 3: Restart Claude Desktop**

Completely quit and restart Claude Desktop for changes to take effect.

**Step 4: Verify Installation**

In Claude Desktop, start a new conversation and ask:
```
What Inference UI tools do you have access to?
```

Claude should list 7 tools: `graphql_query`, `ingest_event`, `ingest_batch`, `stream_chat`, `stream_completion`, `stream_object`, and `health_check`.

### For Cline (VS Code Extension)

**Step 1: Open VS Code Settings**

1. Open VS Code
2. Go to Extensions → Cline → Extension Settings
3. Find "MCP Servers" section

**Step 2: Add Configuration**

Click "Edit in settings.json" and add:

```json
{
  "cline.mcpServers": {
    "inference-ui": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-server/dist/index.js"
      ],
      "env": {
        "INFERENCE_UI_API_URL": "https://inference-ui-api.finhub.workers.dev"
      }
    }
  }
}
```

**Step 3: Reload VS Code**

Run: `Developer: Reload Window`

### Environment Variables

The MCP server supports these environment variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `INFERENCE_UI_API_URL` | API endpoint URL | Yes | `https://inference-ui-api.finhub.workers.dev` |
| `INFERENCE_UI_API_KEY` | API authentication key | No | (none) |

**With API Key** (if authentication is enabled):

```json
{
  "mcpServers": {
    "inference-ui": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "INFERENCE_UI_API_URL": "https://your-custom-domain.com",
        "INFERENCE_UI_API_KEY": "your-secret-api-key-here"
      }
    }
  }
}
```

---

## Using with AI Assistants

### Natural Language Examples

Once configured, you can interact with Inference UI using natural language:

#### Analytics & Queries

```
You: Show me the last 10 button clicks for the "signup" button

Claude: [Uses graphql_query tool]
Here are the 10 most recent signup button clicks:
1. User user_123 clicked at 2:45 PM
2. User user_456 clicked at 2:42 PM
...
```

```
You: How many users visited the pricing page today?

Claude: [Uses graphql_query tool]
Today, 147 users visited the pricing page.
```

```
You: What are the most popular components this week?

Claude: [Uses graphql_query tool]
Top 5 components by interactions:
1. Navigation Menu - 2,341 interactions
2. CTA Button - 1,892 interactions
3. Search Bar - 1,234 interactions
...
```

#### Event Tracking

```
You: Track that user user_789 just clicked the "Get Started" button

Claude: [Uses ingest_event tool]
✓ Event tracked successfully:
  - Type: button_click
  - User: user_789
  - Component: "Get Started" button
  - Timestamp: 2:47:32 PM
```

```
You: Log these 3 events:
- User viewed the home page
- User clicked the features tab
- User submitted the contact form

Claude: [Uses ingest_batch tool]
✓ Successfully ingested 3 events:
  - page_view: /home
  - tab_click: features
  - form_submit: contact
```

#### AI-Powered Features

```
You: Generate a welcome message for new users signing up for our SaaS

Claude: [Uses stream_chat tool with Workers AI]
Welcome aboard! 🎉 We're thrilled to have you join our platform...
```

```
You: Create a JSON object for a user profile with name, email, and preferences

Claude: [Uses stream_object tool]
Generated user profile:
{
  "name": "Sarah Johnson",
  "email": "sarah.j@example.com",
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "language": "en"
  }
}
```

#### System Health

```
You: Is the Inference UI API healthy?

Claude: [Uses health_check tool]
✓ API Status: Healthy
  - Response time: 23ms
  - Timestamp: 2:48:15 PM
  - All systems operational
```

---

## Available Tools

### 1. graphql_query

**Purpose**: Execute GraphQL queries to retrieve data from Inference UI

**When to Use**:
- Query component analytics
- Retrieve user interaction data
- Analyze engagement metrics
- Export reports

**Example**:
```
"Show me all button clicks from the last 24 hours"
"Query user events for user ID user_123"
"Get the top 5 most-used components"
```

### 2. ingest_event

**Purpose**: Track a single user interaction event

**When to Use**:
- Log button clicks
- Track page views
- Record form submissions
- Capture custom events

**Example**:
```
"Track that someone clicked the signup button"
"Log a page view for /pricing"
"Record a form submission"
```

### 3. ingest_batch

**Purpose**: Track multiple events efficiently in one request

**When to Use**:
- Bulk event import
- Batch tracking from external systems
- Historical data migration
- High-volume event logging

**Example**:
```
"Log these 5 events: [list of events]"
"Import user interactions from this CSV"
"Track a complete user session"
```

### 4. stream_chat

**Purpose**: Generate AI chat responses using Cloudflare Workers AI

**When to Use**:
- Conversational AI features
- Customer support automation
- Interactive help systems
- Personalized content generation

**Example**:
```
"Generate a help message for users stuck on the signup form"
"Create a conversational response for this support ticket"
```

### 5. stream_completion

**Purpose**: Generate text content using AI

**When to Use**:
- Content generation
- Email templates
- Product descriptions
- Documentation assistance

**Example**:
```
"Generate an email template for new user onboarding"
"Write a product description for this feature"
```

### 6. stream_object

**Purpose**: Generate structured JSON data using AI

**When to Use**:
- Generate mock data
- Create test fixtures
- Build sample configurations
- Prototype data structures

**Example**:
```
"Generate a sample user profile JSON"
"Create test data for 5 products"
```

### 7. health_check

**Purpose**: Check if Inference UI API is operational

**When to Use**:
- Verify connectivity
- Debug connection issues
- Monitor system status
- Pre-flight checks

**Example**:
```
"Is Inference UI working?"
"Check the API health"
```

---

## Usage Examples

### Example 1: Analyzing User Engagement

**Scenario**: You want to understand which features users interact with most.

**Conversation**:
```
You: What are the top 10 most-clicked components this week?

Claude: I'll query the component interaction data for you.

[Uses graphql_query]

Here are the top 10 components by click count this week:

1. **"Get Started" Button** - 1,247 clicks
2. **Main Navigation** - 892 clicks
3. **Pricing Calculator** - 743 clicks
4. **Sign Up Form** - 621 clicks
5. **Feature Comparison Table** - 509 clicks
...

Would you like me to break this down by day or analyze specific user segments?
```

### Example 2: Tracking a Complete User Journey

**Scenario**: You want to log a multi-step user interaction.

**Conversation**:
```
You: Track this user journey for user_456:
1. Landed on home page from Google
2. Clicked the "Features" tab
3. Watched the demo video
4. Clicked "Get Started"
5. Started the signup process

Claude: I'll log these events as a batch for better efficiency.

[Uses ingest_batch]

✓ Successfully tracked 5-step user journey for user_456:

  Step 1: Page view (/home) from Google
  Step 2: Navigation click (Features)
  Step 3: Video interaction (demo)
  Step 4: CTA click (Get Started)
  Step 5: Flow started (signup)

All events are now available in your analytics dashboard.
```

### Example 3: Generating User-Facing Content

**Scenario**: You need to create personalized onboarding messages.

**Conversation**:
```
You: Generate 3 different welcome messages for new users who signed up for the Pro plan, emphasizing the advanced analytics features

Claude: I'll create personalized welcome messages using AI.

[Uses stream_chat]

Here are 3 welcome message variations:

**Version 1 (Enthusiastic):**
"Welcome to the Pro tier! 🎉 You now have access to advanced analytics that will transform how you understand your users. Dive into real-time insights, custom dashboards, and AI-powered predictions. Let's get started!"

**Version 2 (Professional):**
"Thank you for upgrading to Pro. You've unlocked powerful analytics capabilities including real-time event tracking, custom reporting, and predictive insights. Visit your dashboard to explore these advanced features."

**Version 3 (Educational):**
"Welcome aboard! As a Pro member, you'll discover how advanced analytics can drive better decisions. We recommend starting with the Real-Time Dashboard to see your data come alive. Need help? Our team is here for you."

Would you like me to refine any of these?
```

### Example 4: Debugging Event Tracking

**Scenario**: You suspect events aren't being tracked properly.

**Conversation**:
```
You: Check if any events were tracked for user user_789 in the last hour

Claude: Let me query recent events for that user.

[Uses graphql_query]

I found 3 events for user_789 in the last hour:

1. **2:45 PM** - button_click on "pricing-cta"
2. **2:47 PM** - page_view on "/pricing"
3. **2:48 PM** - form_focus on "email-input"

The events are being tracked correctly. Would you like to see more details about any specific event?
```

---

## Best Practices

### 1. Use Clear, Specific Language

✅ **Good**:
```
"Show me button clicks on the 'Sign Up' button from the last 7 days"
```

❌ **Avoid**:
```
"Show me some stuff about buttons"
```

### 2. Batch Events When Possible

✅ **Efficient**:
```
"Track these 10 events: [list]" → Uses ingest_batch (1 API call)
```

❌ **Inefficient**:
```
"Track event 1... Track event 2... Track event 3..." → 10 API calls
```

### 3. Specify User and Session IDs

✅ **Complete**:
```
"Track button click for user user_123, session sess_456"
```

❌ **Incomplete**:
```
"Track a button click" → Missing context
```

### 4. Use Health Checks Before Critical Operations

✅ **Safe**:
```
"First check if the API is healthy, then query user data"
```

### 5. Provide Context for AI Generation

✅ **Better Results**:
```
"Generate a welcome email for enterprise customers who signed up for annual billing, highlighting ROI and support benefits"
```

❌ **Generic**:
```
"Generate a welcome email"
```

---

## Troubleshooting

### MCP Server Not Showing in Claude Desktop

**Problem**: Tools aren't available after configuration

**Solutions**:

1. **Verify Configuration Path**
   ```bash
   # Check the file exists
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Check Absolute Path**
   ```bash
   # Get absolute path
   cd /path/to/mcp-server
   pwd
   # Use this path in config.json
   ```

3. **Restart Claude Desktop Completely**
   - Don't just close the window
   - Quit the application: `Cmd+Q` (Mac) or `Alt+F4` (Windows)
   - Start again

4. **Check for JSON Errors**
   ```bash
   # Validate JSON syntax
   node -e "JSON.parse(require('fs').readFileSync('$HOME/Library/Application Support/Claude/claude_desktop_config.json', 'utf8'))"
   ```

### "Connection Refused" Errors

**Problem**: MCP server can't reach Inference UI API

**Solutions**:

1. **Test API Directly**
   ```bash
   curl https://inference-ui-api.finhub.workers.dev/health
   ```

2. **Check Environment Variables**
   ```json
   {
     "env": {
       "INFERENCE_UI_API_URL": "https://inference-ui-api.finhub.workers.dev"
     }
   }
   ```

3. **Verify Network Access**
   - Check firewall settings
   - Ensure outbound HTTPS (port 443) is allowed

### Tools Return Errors

**Problem**: Tools execute but return error messages

**Solutions**:

1. **Check API Health**
   ```
   Ask Claude: "Check if the Inference UI API is healthy"
   ```

2. **Verify API Key** (if using authentication)
   ```json
   {
     "env": {
       "INFERENCE_UI_API_KEY": "correct-key-here"
     }
   }
   ```

3. **Check Request Format**
   - Ensure event data is properly structured
   - Verify GraphQL query syntax
   - Validate JSON schemas for stream_object

### Slow Response Times

**Problem**: Tools take too long to respond

**Solutions**:

1. **Check API Status**
   ```
   Ask Claude: "Check API health and response time"
   ```

2. **Optimize Queries**
   - Limit result counts (use `limit: 10` instead of `limit: 1000`)
   - Add time range filters
   - Query specific components instead of all

3. **Use Batch Operations**
   - Combine multiple events into `ingest_batch`
   - Batch multiple GraphQL queries

### MCP Server Crashes

**Problem**: Server stops responding or crashes

**Solutions**:

1. **Check Node.js Version**
   ```bash
   node --version
   # Should be >= 18.0.0
   ```

2. **Rebuild Server**
   ```bash
   cd mcp-server
   npm install
   npm run build
   ```

3. **Check Logs**
   - Look at Claude Desktop logs
   - Check terminal output where server runs

4. **Test Server Directly**
   ```bash
   npm start
   # Should print: "Inference UI MCP Server started"
   ```

---

## FAQ

### Can I use this with other AI assistants besides Claude?

Yes! Any AI assistant that supports the Model Context Protocol (MCP) can use the Inference UI MCP server. This includes:
- Claude Desktop
- Cline (VS Code extension)
- Any future MCP-compatible tools

### Is my data secure?

Yes. All communication:
- Uses HTTPS encryption
- Goes through Cloudflare's secure edge network
- Supports optional API key authentication
- Can be configured to use private deployments

### Does this cost anything?

The MCP server itself is free and open source. API usage follows Inference UI's pricing tiers:
- **Free Tier**: 10K events/month
- **Developer Tier**: $29/mo for enhanced features
- **Business Tier**: $199/mo for unlimited usage

### Can I customize the API endpoint?

Yes! Set the `INFERENCE_UI_API_URL` environment variable to your custom deployment:

```json
{
  "env": {
    "INFERENCE_UI_API_URL": "https://your-custom-domain.com"
  }
}
```

### How do I update the MCP server?

```bash
cd mcp-server
git pull
npm install
npm run build
```

Then restart your AI assistant.

### Can I add custom tools?

Yes! The MCP server is open source. You can:
1. Fork the repository
2. Add new tool definitions in `src/index.ts`
3. Rebuild and use your custom version

### What's the performance like?

- **API Latency**: <50ms globally (Cloudflare edge)
- **MCP Overhead**: <5ms (local stdio transport)
- **Total Response Time**: Typically <100ms

### Can I use this in production?

Yes! The MCP server is production-ready:
- ✅ Error handling and retries
- ✅ Timeout protection (30s default)
- ✅ Type-safe TypeScript implementation
- ✅ Tested against live API

### How do I get help?

- **Documentation**: This guide and the README
- **Issues**: GitHub Issues for bug reports
- **Community**: Discord server for discussions
- **Support**: Email support for Business/Enterprise tiers

---

## Next Steps

### Getting Started
1. ✅ Install and configure the MCP server
2. 📝 Try the example queries
3. 🚀 Start using natural language to interact with Inference UI

### Advanced Usage
- Explore [Service Bindings](SERVICE-BINDINGS-USER-GUIDE.md) for Worker-to-Worker integration
- Read [Integration Examples](INTEGRATION-EXAMPLES.md) for real-world scenarios
- Check [Troubleshooting Guide](TROUBLESHOOTING.md) for common issues

### Resources
- [MCP Specification](https://modelcontextprotocol.io)
- [Inference UI API Documentation](https://docs.inference-ui.com)
- [GraphQL Schema Reference](https://inference-ui-api.finhub.workers.dev/graphql)

---

**Built with ❤️ using Model Context Protocol by Anthropic**
