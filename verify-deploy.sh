#!/bin/bash

echo "🔍 Railway Deployment Verification"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from the trade-app root directory"
    exit 1
fi

echo "✅ In correct directory"
echo ""

# Check for required files
echo "📄 Checking required files..."
files=(
    "package.json"
    "backend/package.json"
    "backend/server.js"
    "backend/railway.json"
    ".env.example"
    "backend/.env.example"
)
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ Missing: $file"
    fi
done
echo ""

# Check environment files exist (but not tracked)
echo "🔐 Checking environment setup..."
if [ -f ".env" ]; then
    echo "  ✅ Frontend .env exists"
else
    echo "  ⚠️  Frontend .env not found (create from .env.example)"
fi

if [ -f "backend/.env" ]; then
    echo "  ✅ Backend .env exists"
else
    echo "  ⚠️  Backend .env not found (create from backend/.env.example)"
fi
echo ""

# Check gitignore
echo "🚫 Checking .gitignore..."
if grep -q ".env" .gitignore; then
    echo "  ✅ .env files are gitignored"
else
    echo "  ⚠️  Add .env to .gitignore!"
fi
echo ""

# Check node_modules
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ Frontend dependencies installed"
else
    echo "  ⚠️  Run: npm install"
fi

if [ -d "backend/node_modules" ]; then
    echo "  ✅ Backend dependencies installed"
else
    echo "  ⚠️  Run: cd backend && npm install"
fi
echo ""

# Check Railway CLI
echo "🚂 Checking Railway CLI..."
if command -v railway &> /dev/null; then
    echo "  ✅ Railway CLI installed"
    railway --version
else
    echo "  ⚠️  Railway CLI not installed"
    echo "     Run: npm install -g @railway/cli"
fi
echo ""

# Check git status
echo "📚 Git status..."
if [ -d ".git" ]; then
    echo "  ✅ Git repository initialized"
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo "  ⚠️  You have uncommitted changes"
        echo "     Run: git add . && git commit -m 'Ready for Railway deployment'"
    else
        echo "  ✅ No uncommitted changes"
    fi
    
    # Check if connected to remote
    if git remote get-url origin &>/dev/null; then
        echo "  ✅ Connected to GitHub: $(git remote get-url origin)"
    else
        echo "  ⚠️  No GitHub remote configured"
        echo "     Run: git remote add origin <your-repo-url>"
    fi
else
    echo "  ❌ Not a git repository"
    echo "     Run: git init && git add . && git commit -m 'Initial commit'"
fi
echo ""

echo "===================================="
echo "✅ Verification complete!"
echo ""
echo "Next steps:"
echo "1. Ensure .env files have real values (not .example placeholders)"
echo "2. Push code to GitHub"
echo "3. Run: railway login"
echo "4. Follow START_HERE.md for Railway deployment"
