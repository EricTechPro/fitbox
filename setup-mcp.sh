#!/bin/bash

# FitBox Supabase MCP Setup Script
# This script helps set up the Supabase MCP server for database development

set -e

echo "🚀 Setting up Supabase MCP for FitBox development..."

# Check if Claude Desktop config directory exists
CLAUDE_CONFIG_DIR="$HOME/.config/claude-desktop"
if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
    echo "📁 Creating Claude Desktop config directory..."
    mkdir -p "$CLAUDE_CONFIG_DIR"
fi

# Copy the MCP configuration
if [ -f "claude_desktop_config.json" ]; then
    echo "📋 Copying MCP configuration to Claude Desktop..."
    cp claude_desktop_config.json "$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    echo "✅ Configuration copied successfully!"
else
    echo "❌ Error: claude_desktop_config.json not found in current directory"
    exit 1
fi

echo ""
echo "📋 Next steps:"
echo "1. Get your Supabase Personal Access Token:"
echo "   - Visit: https://supabase.com/dashboard/account/tokens"
echo "   - Create a new token named 'FitBox MCP Development'"
echo ""
echo "2. Get your Supabase Project Reference ID:"
echo "   - Go to your FitBox project in Supabase Dashboard"
echo "   - Find the Project ID in Settings → General"
echo ""
echo "3. Update the configuration file:"
echo "   - Edit: $CLAUDE_CONFIG_DIR/claude_desktop_config.json"
echo "   - Replace YOUR_PROJECT_REF_HERE with your project ID"
echo "   - Replace YOUR_SUPABASE_ACCESS_TOKEN_HERE with your token"
echo ""
echo "4. Restart Claude Desktop to load the new configuration"
echo ""
echo "🎉 Setup complete! You can now ask Claude to interact with your Supabase database."
