#!/bin/bash

# FitBox + Supabase Database Setup Script
# This script sets up your FitBox app with Supabase database

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "🚀 FitBox + Supabase Setup"
echo "=========================="
echo -e "${NC}"

# Step 1: Check if .env.local exists
echo -e "${YELLOW}Step 1: Checking environment configuration...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${RED}✗ .env.local file not found${NC}"
    echo ""
    echo "Please create .env.local with your Supabase connection details:"
    echo ""
    echo "1. Go to https://supabase.com and create a new project"
    echo "2. Get your database connection string from Settings → Database"
    echo "3. Create .env.local file with:"
    echo ""
    echo "DATABASE_URL=\"postgresql://postgres:[YOUR-PASSWORD]@db.xyz.supabase.co:5432/postgres\""
    echo "NEXTAUTH_SECRET=\"$(openssl rand -base64 32 2>/dev/null || echo 'your-secret-key-here')\""
    echo ""
    echo "See SUPABASE_SETUP.md for detailed instructions."
    exit 1
else
    echo -e "${GREEN}✓ .env.local file found${NC}"
fi

# Step 2: Check DATABASE_URL
echo -e "\n${YELLOW}Step 2: Validating database connection...${NC}"
if grep -q "supabase.co" .env.local; then
    echo -e "${GREEN}✓ Supabase database URL detected${NC}"
elif grep -q "DATABASE_URL" .env.local; then
    echo -e "${YELLOW}⚠ Database URL found but may not be Supabase${NC}"
    echo "Make sure your DATABASE_URL points to your Supabase project"
else
    echo -e "${RED}✗ DATABASE_URL not found in .env.local${NC}"
    echo "Please add your Supabase DATABASE_URL to .env.local"
    exit 1
fi

# Step 3: Install dependencies
echo -e "\n${YELLOW}Step 3: Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Step 4: Generate Prisma Client
echo -e "\n${YELLOW}Step 4: Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"

# Step 5: Test database connection
echo -e "\n${YELLOW}Step 5: Testing Supabase connection...${NC}"
if npx prisma db execute --stdin <<< "SELECT 1" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Successfully connected to Supabase${NC}"
else
    echo -e "${RED}✗ Could not connect to Supabase${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check your DATABASE_URL in .env.local"
    echo "2. Make sure your Supabase project is active"
    echo "3. Verify your database password is correct"
    echo "4. Check if you're behind a corporate firewall"
    echo ""
    echo "Run: npx prisma studio"
    echo "If that fails, your connection string needs to be fixed."
    exit 1
fi

# Step 6: Push database schema
echo -e "\n${YELLOW}Step 6: Creating database schema in Supabase...${NC}"
npx prisma db push
echo -e "${GREEN}✓ Database schema created${NC}"

# Step 7: Seed database
echo -e "\n${YELLOW}Step 7: Seeding database with sample data...${NC}"
npx prisma db seed
echo -e "${GREEN}✓ Database seeded with sample data${NC}"

# Step 8: Success message
echo -e "\n${GREEN}✅ FitBox + Supabase setup complete!${NC}"
echo ""
echo -e "${BLUE}🎉 Your database is ready!${NC}"
echo "==============================="
echo ""
echo "📊 What was created in Supabase:"
echo "• 2 users (admin & customer)"
echo "• 8 sample meals across 4 categories" 
echo "• 3 Vancouver delivery zones"
echo "• 1 active weekly menu"
echo "• 1 sample order with payment"
echo ""
echo "🔐 Test login credentials:"
echo "• Admin:    admin@fitbox.ca / admin123"
echo "• Customer: customer@fitbox.ca / customer123"
echo ""
echo "🛠️  Useful commands:"
echo "• View data in browser:     npx prisma studio"
echo "• Reset database:           npx prisma migrate reset"
echo "• Re-seed database:         npx prisma db seed"
echo "• Start dev server:         npm run dev"
echo "• Run contract tests:       npm run test:contract"
echo ""
echo "🌐 Supabase Dashboard:"
echo "• Go to https://supabase.com/dashboard"
echo "• View your tables in 'Table Editor'"
echo "• Run SQL queries in 'SQL Editor'"
echo ""
echo -e "${GREEN}Ready to start development! 🚀${NC}"