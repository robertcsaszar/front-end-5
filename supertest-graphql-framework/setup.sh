#!/bin/bash

# SuperTest GraphQL Framework Setup Script
# This script helps you set up the framework quickly

set -e  # Exit on error

echo "🚀 SuperTest GraphQL Framework Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js detected: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo -e "${GREEN}✓${NC} npm detected: $(npm --version)"
echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env file created from .env.example"
    echo -e "${YELLOW}⚠${NC}  Please edit .env file with your configuration"
else
    echo -e "${YELLOW}⚠${NC}  .env file already exists, skipping..."
fi
echo ""

# Create necessary directories
echo -e "${BLUE}Creating directories...${NC}"
mkdir -p logs reports temp/csv

echo -e "${GREEN}✓${NC} Directories created"
echo ""

# Display next steps
echo "=========================================="
echo -e "${GREEN}Setup completed successfully!${NC}"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Edit .env file with your configuration:"
echo "   - API_BASE_URL"
echo "   - IDP_BASE_URL"
echo "   - IDP_CLIENT_ID"
echo "   - TEST_USER_EMAIL"
echo "   - TEST_USER_PASSWORD"
echo ""
echo "2. Run your first test:"
echo "   npm run test:smoke"
echo ""
echo "3. Read the documentation:"
echo "   - README.md - Complete guide"
echo "   - docs/QUICK_START.md - 5-minute guide"
echo "   - docs/EXAMPLES.md - Usage examples"
echo ""
echo "4. Run tests in parallel:"
echo "   npm run test:parallel"
echo ""
echo "5. View reports:"
echo "   open reports/test-report.html"
echo ""
echo "🎉 Happy Testing!"
