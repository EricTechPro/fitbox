# MCP Server Setup Guide

This guide explains how to set up all Model Context Protocol (MCP) servers for the FitBox application, enabling enhanced development capabilities through Claude.

## Overview

The FitBox project uses three MCP servers:

1. **Supabase MCP** - Database operations and schema management
2. **shadcn MCP** - UI component discovery and installation
3. **Playwright MCP** - Browser automation and E2E testing

## Quick Setup

### Automated Setup

Run the automated setup script:

```bash
./setup-mcp.sh
```

### Manual Setup

Copy the configuration to Claude Desktop:

```bash
mkdir -p ~/.config/claude-desktop
cp claude_desktop_config.json ~/.config/claude-desktop/claude_desktop_config.json
```

Then restart Claude Desktop.

## MCP Servers

### 1. Supabase MCP Server

**Purpose**: Direct database interaction, schema inspection, and migration management.

#### Prerequisites

1. **Personal Access Token (PAT)**:
   - Visit [Supabase Account Tokens](https://supabase.com/dashboard/account/tokens)
   - Click "Generate new token"
   - Name: "FitBox MCP Development"
   - Select scopes: `projects.read`, `sql.select`
   - Copy the token immediately

2. **Project Reference ID**:
   - Go to your FitBox Supabase project
   - Navigate to Settings → General
   - Copy the "Project ID" value

#### Configuration

```json
{
  "mcpServers": {
    "supabase-fitbox": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=YOUR_PROJECT_ID"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_ACCESS_TOKEN"
      }
    }
  }
}
```

#### Available Commands

- **Database Operations**:
  - `list_tables` - View all tables and schemas
  - `execute_sql` - Run SQL queries (read-only)
  - `apply_migration` - Apply database migrations
  - `list_migrations` - View migration history

- **Development Tools**:
  - `get_project_url` - Get API URL
  - `get_anon_key` - Get anonymous API key
  - `generate_typescript_types` - Generate types from schema

- **Debugging**:
  - `get_logs` - View service logs (postgres, api, auth)
  - `get_advisors` - Get security/performance recommendations

#### Usage Examples

```
"Show me all tables in the database"
"What's the schema for the subscriptions table?"
"Execute a query to find all active subscriptions"
"Generate TypeScript types for my database schema"
"Check the recent postgres logs for errors"
```

### 2. shadcn MCP Server

**Purpose**: UI component discovery, installation commands, and design system integration.

#### Configuration

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn-mcp"]
    }
  }
}
```

#### Available Commands

- `get_project_registries` - Get configured registry names
- `list_items_in_registries` - List available components
- `search_items_in_registries` - Fuzzy search for components
- `view_items_in_registries` - View component details
- `get_item_examples_from_registries` - Find usage examples
- `get_add_command_for_items` - Get CLI install commands
- `get_audit_checklist` - Component integration checklist

#### Usage Examples

```
"Search for a data table component"
"Show me examples of the accordion component"
"What's the install command for the button component?"
"List all available shadcn components"
```

### 3. Playwright MCP Server

**Purpose**: Browser automation, E2E testing, visual testing, and performance monitoring.

#### Configuration

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "false",
        "PLAYWRIGHT_BROWSER": "chromium"
      }
    }
  }
}
```

#### Environment Variables

- `PLAYWRIGHT_HEADLESS` - Run browser in headless mode (`true`/`false`)
- `PLAYWRIGHT_BROWSER` - Browser to use (`chromium`, `firefox`, `webkit`)

#### Available Commands

- **Browser Operations**:
  - `browser_navigate` - Navigate to URL
  - `browser_snapshot` - Capture accessibility snapshot
  - `browser_take_screenshot` - Take screenshot
  - `browser_close` - Close browser

- **Interactions**:
  - `browser_click` - Click elements
  - `browser_type` - Type text
  - `browser_fill_form` - Fill multiple form fields
  - `browser_select_option` - Select dropdown options

- **Testing & Validation**:
  - `browser_evaluate` - Execute JavaScript
  - `browser_console_messages` - Get console logs
  - `browser_network_requests` - View network activity
  - `browser_wait_for` - Wait for conditions

- **Advanced**:
  - `browser_tabs` - Manage browser tabs
  - `browser_resize` - Resize viewport
  - `browser_drag` - Drag and drop
  - `browser_file_upload` - Upload files

#### Usage Examples

```
"Navigate to http://localhost:3000 and take a screenshot"
"Test the login form with email test@example.com"
"Click the 'Add to Cart' button and verify the cart updates"
"Take a screenshot of the mobile menu at 375px width"
"Check the console for JavaScript errors"
"Fill out the subscription form with test data"
```

#### Browser Configuration Options

For headless mode (faster, no UI):

```json
"env": {
  "PLAYWRIGHT_HEADLESS": "true",
  "PLAYWRIGHT_BROWSER": "chromium"
}
```

For visible browser (debugging):

```json
"env": {
  "PLAYWRIGHT_HEADLESS": "false",
  "PLAYWRIGHT_BROWSER": "chromium"
}
```

For Firefox or Safari:

```json
"env": {
  "PLAYWRIGHT_HEADLESS": "false",
  "PLAYWRIGHT_BROWSER": "firefox"  // or "webkit" for Safari
}
```

## Complete Configuration Example

Here's a complete `claude_desktop_config.json` with all three servers:

```json
{
  "mcpServers": {
    "supabase-fitbox": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=wgvtdqtmgbnsvrvblprx"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_TOKEN_HERE"
      }
    },
    "shadcn": {
      "command": "npx",
      "args": ["shadcn-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "false",
        "PLAYWRIGHT_BROWSER": "chromium"
      }
    }
  }
}
```

## Security Best Practices

### Supabase MCP

1. **Use Read-Only Mode** for general development
2. **Scope Tokens Appropriately** - only grant necessary permissions
3. **Regular Token Rotation** - rotate access tokens periodically
4. **Environment Variables** - avoid hardcoding secrets
5. **Project Scoping** - limit access to specific projects

### Playwright MCP

1. **Local Development Only** - don't expose to production
2. **Trusted URLs** - only navigate to trusted domains
3. **Headless Mode** - use headless mode for CI/CD
4. **Network Isolation** - consider network restrictions for automated tests
5. **Screenshot Privacy** - be mindful of sensitive data in screenshots

## Troubleshooting

### Common Issues

#### MCP Server Not Loading

1. **Restart Claude Desktop** after config changes
2. **Verify JSON syntax** in configuration file
3. **Check Claude Desktop logs** for error messages
4. **Ensure npx is available** in your PATH

#### Supabase Connection Errors

1. **"Unauthorized"** - Verify access token is correct and not expired
2. **"Project not found"** - Verify project reference ID is correct
3. **"Permission denied"** - Check token scopes and permissions

#### Playwright Browser Errors

1. **"Browser not installed"** - Run `npx playwright install chromium`
2. **"Navigation timeout"** - Check network connectivity and URL
3. **"Element not found"** - Wait for page to load before interacting

### Debug Configuration

Enable verbose logging for troubleshooting:

```json
"env": {
  "NODE_ENV": "development",
  "DEBUG": "pw:api"
}
```

## Integration with FitBox Workflows

### Database Development Workflow

1. **Schema Design**: Use Supabase MCP to inspect current schema
2. **Migration**: Apply migrations and verify with `list_migrations`
3. **Type Generation**: Generate TypeScript types for new tables
4. **Validation**: Query data to verify migration success

### Component Development Workflow

1. **Discovery**: Search shadcn MCP for required components
2. **Installation**: Get install commands and add to project
3. **Implementation**: View examples and implement component
4. **Testing**: Use Playwright MCP to test component behavior

### E2E Testing Workflow

1. **Navigation**: Navigate to feature page
2. **Interaction**: Fill forms, click buttons, interact with UI
3. **Validation**: Verify expected outcomes (DOM changes, network requests)
4. **Screenshots**: Capture visual evidence for review
5. **Console Check**: Verify no JavaScript errors

## Related Documentation

- [Supabase MCP Server](https://github.com/supabase-community/supabase-mcp)
- [shadcn MCP Server](https://github.com/shadcn/mcp)
- [Playwright MCP Server](https://github.com/executeautomation/playwright-mcp-server)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [FitBox Testing Guide](./testing-guide.md)
