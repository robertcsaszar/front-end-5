# Installation Guide

## Prerequisites

- Node.js >= 14.x
- npm >= 6.x
- Access to your GraphQL API
- IDP credentials (for authentication)

## Installation Methods

### Method 1: Automated Setup (Recommended)

```bash
# Run the setup script
./setup.sh
```

This will:
1. ✅ Check for Node.js and npm
2. ✅ Install all dependencies
3. ✅ Create .env file from template
4. ✅ Create necessary directories
5. ✅ Display next steps

### Method 2: Manual Setup

#### Step 1: Install Dependencies

```bash
npm install
```

#### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your settings
nano .env  # or use your favorite editor
```

#### Step 3: Create Directories

```bash
mkdir -p logs reports temp/csv
```

## Configuration

### Required Environment Variables

Edit `.env` file with these required values:

```env
# API Configuration
API_BASE_URL=https://api.example.com
GRAPHQL_ENDPOINT=/graphql

# IDP Configuration
IDP_BASE_URL=https://idp.example.com
IDP_CLIENT_ID=your-client-id
IDP_WELL_KNOWN_URL=https://idp.example.com/.well-known/openid-configuration

# Test User
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=YourPassword123!
```

### Optional Configuration

```env
# Client Secret (if required by your IDP)
IDP_CLIENT_SECRET=your-client-secret

# Test Admin User (for admin tests)
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=AdminPassword123!

# Test Execution
RUN_PARALLEL=true
MAX_WORKERS=4
TEST_TIMEOUT=60000

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
```

## Verification

### Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Verify dependencies
npm list --depth=0
```

### Test Configuration

```bash
# Run a simple test to verify setup
npm test -- users.smoke.test.js
```

### Expected Output

```
PASS  src/tests/smoke/users.smoke.test.js
  Users - Smoke Tests
    CRUD Operations
      ✓ Should create a new user (523 ms)
      ✓ Should retrieve user by ID (234 ms)
      ✓ Should list all users with pagination (156 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

## Troubleshooting Installation

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Permission denied on setup.sh

**Solution:**
```bash
chmod +x setup.sh
./setup.sh
```

### Issue: Cannot find module

**Solution:**
```bash
# Ensure all dependencies are installed
npm install

# Check if node_modules exists
ls node_modules/

# If issue persists, try:
npm ci  # Clean install
```

### Issue: .env file not found

**Solution:**
```bash
cp .env.example .env
# Then edit .env with your configuration
```

## Platform-Specific Instructions

### macOS

```bash
# Install Node.js with Homebrew
brew install node

# Run setup
./setup.sh
```

### Linux (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Run setup
./setup.sh
```

### Windows

```powershell
# Install Node.js from https://nodejs.org/

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env with your configuration
notepad .env

# Create directories
mkdir logs
mkdir reports
mkdir temp\csv
```

## Docker Installation (Optional)

If you prefer to run in Docker:

```bash
# Build image
docker build -t supertest-graphql .

# Run tests
docker run -it --rm \
  -e API_BASE_URL=$API_BASE_URL \
  -e IDP_CLIENT_ID=$IDP_CLIENT_ID \
  -e TEST_USER_EMAIL=$TEST_USER_EMAIL \
  -e TEST_USER_PASSWORD=$TEST_USER_PASSWORD \
  supertest-graphql npm test
```

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["npm", "test"]
```

## Validation Checklist

After installation, verify:

- [ ] Node.js and npm are installed
- [ ] Dependencies are installed (check `node_modules/`)
- [ ] `.env` file exists and is configured
- [ ] Required directories exist (`logs/`, `reports/`, `temp/`)
- [ ] Can run a simple test successfully
- [ ] Can access your API
- [ ] Authentication works

## Next Steps

Once installation is complete:

1. **Read the Quick Start**: `docs/QUICK_START.md`
2. **Run smoke tests**: `npm run test:smoke`
3. **View documentation**: `README.md`
4. **Write your first test**: Follow examples in `docs/EXAMPLES.md`

## Getting Help

If you encounter issues:

1. Check this installation guide
2. Review `README.md` troubleshooting section
3. Verify your `.env` configuration
4. Check Node.js and npm versions
5. Ensure API and IDP are accessible

## Uninstallation

To remove the framework:

```bash
# Remove dependencies
rm -rf node_modules package-lock.json

# Remove generated files
rm -rf logs reports temp .env

# Remove the entire directory
cd ..
rm -rf supertest-graphql-framework
```

## Update/Upgrade

To update the framework:

```bash
# Pull latest changes (if using git)
git pull

# Update dependencies
npm install

# Check for breaking changes
cat CHANGELOG.md
```
