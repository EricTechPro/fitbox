# Supabase MCP Server Setup

This guide explains how to set up the Supabase Model Context Protocol (MCP) server for the FitBox application, enabling direct database interaction through Claude.

## Overview

The Supabase MCP server allows Claude to:

- Execute SQL queries directly against your Supabase database
- Inspect database schemas and tables
- Apply database migrations
- Generate TypeScript types from your schema
- View logs and get database recommendations

## Quick Setup

Run the automated setup script:

```bash
./setup-mcp.sh
```

## Manual Setup

### Step 1: Get Supabase Credentials

1. **Personal Access Token (PAT)**:
   - Visit [Supabase Account Tokens](https://supabase.com/dashboard/account/tokens)
   - Click "Generate new token"
   - Name: "FitBox MCP Development"
   - Select appropriate scopes (at minimum: `projects.read`, `sql.select`)
   - Copy the token immediately (you won't see it again)

2. **Project Reference ID**:
   - Go to your FitBox Supabase project
   - Navigate to Settings → General
   - Copy the "Project ID" value

### Step 2: Configure Claude Desktop

1. **Create/Update Configuration**:

   ```bash
   # Ensure config directory exists
   mkdir -p ~/.config/claude-desktop

   # Copy the provided configuration
   cp claude_desktop_config.json ~/.config/claude-desktop/claude_desktop_config.json
   ```

2. **Update Configuration Values**:
   Edit `~/.config/claude-desktop/claude_desktop_config.json`:

   ```json
   {
     "mcpServers": {
       "supabase-fitbox": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server-supabase@latest",
           "--read-only",
           "--project-ref=YOUR_ACTUAL_PROJECT_ID"
         ],
         "env": {
           "SUPABASE_ACCESS_TOKEN": "YOUR_ACTUAL_ACCESS_TOKEN"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop** to load the new configuration.

### Step 3: Verify Setup

Ask Claude to test the connection:

```
"Can you list the tables in my FitBox database?"
```

If successful, you should see your database tables listed.

## Available Commands

### Database Operations

- `list_tables` - View all tables and their schemas
- `execute_sql` - Run SQL queries (read-only by default)
- `apply_migration` - Apply database migrations
- `list_migrations` - View migration history
- `list_extensions` - View installed PostgreSQL extensions

### Development Tools

- `get_project_url` - Get API URL for the project
- `get_anon_key` - Get anonymous API key
- `generate_typescript_types` - Generate TypeScript types from schema

### Debugging & Monitoring

- `get_logs` - View logs by service (postgres, api, auth, etc.)
- `get_advisors` - Get security and performance recommendations

## Usage Examples

### Schema Inspection

```
"What tables do we have in the FitBox database?"
"Show me the structure of the subscriptions table"
"What foreign key relationships exist in our schema?"
```

### Data Queries

```
"How many active subscriptions do we have?"
"Show me the latest 10 orders"
"Find all users who signed up this week"
```

### Development Tasks

```
"Generate TypeScript types for our database"
"Check for any security issues in our database"
"Show me recent postgres errors"
```

### Migration Management

```
"List all database migrations"
"What was the last migration applied?"
```

## Security Configuration

### Read-Only Mode (Recommended)

The MCP server is configured with `--read-only` flag for safety. This:

- Prevents accidental data modification
- Allows safe query execution
- Enables schema inspection

### Full Access Mode (Use Carefully)

To enable write operations, remove the `--read-only` flag:

```json
"args": [
  "-y",
  "@supabase/mcp-server-supabase@latest",
  "--project-ref=YOUR_PROJECT_ID"
]
```

### Environment Variables (Recommended)

Instead of hardcoding tokens in config:

1. Add to your shell profile:

   ```bash
   echo 'export SUPABASE_ACCESS_TOKEN="your-token-here"' >> ~/.zshrc
   source ~/.zshrc
   ```

2. Update config to use environment variable:
   ```json
   "env": {
     "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
   }
   ```

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**:
   - Verify your access token is correct
   - Check token hasn't expired
   - Ensure token has required permissions

2. **"Project not found" errors**:
   - Verify project reference ID is correct
   - Ensure you have access to the project

3. **MCP server not loading**:
   - Check Claude Desktop is restarted after config changes
   - Verify JSON configuration syntax is valid
   - Check Claude Desktop logs for error messages

### Debug Configuration

Enable verbose logging by adding to your config:

```json
"env": {
  "SUPABASE_ACCESS_TOKEN": "your-token",
  "NODE_ENV": "development"
}
```

## Best Practices

1. **Use Read-Only Mode** for general development
2. **Scope Tokens Appropriately** - only grant necessary permissions
3. **Regular Token Rotation** - rotate access tokens periodically
4. **Environment Variables** - avoid hardcoding secrets
5. **Project Scoping** - limit access to specific projects only

## Related Documentation

- [Supabase MCP Server Documentation](https://github.com/supabase-community/supabase-mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [FitBox Database Design](../specifications/database-design.md)
