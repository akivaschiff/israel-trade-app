#!/bin/bash
# Railway Deployment Script
# Run this to prepare your project for Railway deployment

echo "🚂 Railway Deployment Preparation"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
  echo "❌ Git repository not initialized. Run: git init"
  exit 1
fi

echo "✅ Git repository found"
echo ""

# Check for required files
echo "📋 Checking required files..."

required_files=(
  "backend/package.json"
  "backend/server.js"
  "package.json"
  "vite.config.ts"
  ".gitignore"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ Missing: $file"
    exit 1
  fi
done

echo ""
echo "✅ All required files present"
echo ""

# Check for .env files (should NOT be committed)
echo "🔒 Checking .env files are in .gitignore..."

if git ls-files --error-unmatch .env 2>/dev/null; then
  echo "  ⚠️  WARNING: .env is tracked by git! This is a security risk."
  echo "  Run: git rm --cached .env"
  exit 1
else
  echo "  ✅ .env not tracked by git"
fi

if git ls-files --error-unmatch backend/.env 2>/dev/null; then
  echo "  ⚠️  WARNING: backend/.env is tracked by git! This is a security risk."
  echo "  Run: git rm --cached backend/.env"
  exit 1
else
  echo "  ✅ backend/.env not tracked by git"
fi

echo ""
echo "✅ Environment files secured"
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Uncommitted changes detected:"
  git status --short
  echo ""
  echo "Commit changes? (y/n)"
  read -r answer
  if [ "$answer" = "y" ]; then
    echo ""
    echo "Enter commit message:"
    read -r commit_msg
    git add .
    git commit -m "$commit_msg"
    echo "✅ Changes committed"
  else
    echo "⚠️  Continuing with uncommitted changes..."
  fi
else
  echo "✅ No uncommitted changes"
fi

echo ""
echo "📤 Push to GitHub? (y/n)"
read -r push_answer
if [ "$push_answer" = "y" ]; then
  git push origin main
  echo "✅ Pushed to GitHub"
fi

echo ""
echo "=================================="
echo "🎉 Ready for Railway Deployment!"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Go to https://railway.app"
echo "2. Create new project → Deploy from GitHub"
echo "3. Deploy BACKEND first:"
echo "   - Root directory: backend"
echo "   - Add environment variables:"
echo "     • ANTHROPIC_API_KEY"
echo "     • DATABASE_URL"
echo "     • NODE_ENV=production"
echo ""
echo "4. Deploy FRONTEND second:"
echo "   - Root directory: /"
echo "   - Add environment variables:"
echo "     • VITE_SUPABASE_URL"
echo "     • VITE_SUPABASE_ANON_KEY"
echo "     • VITE_API_URL (backend Railway URL)"
echo ""
echo "5. Update backend environment variables:"
echo "   - Add FRONTEND_URL (frontend Railway URL)"
echo ""
echo "6. Test your deployment!"
echo ""
echo "See DEPLOYMENT_CHECKLIST.md for detailed instructions"
echo ""
