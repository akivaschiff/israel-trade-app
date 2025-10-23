#!/bin/bash

echo "🔐 Environment Variables Checker"
echo "================================"
echo ""

# Function to check if a variable exists and is not a placeholder
check_env_var() {
    local file=$1
    local var=$2
    
    if [ ! -f "$file" ]; then
        echo "  ❌ File not found: $file"
        return 1
    fi
    
    if ! grep -q "^$var=" "$file"; then
        echo "  ⚠️  Missing: $var"
        return 1
    fi
    
    value=$(grep "^$var=" "$file" | cut -d '=' -f2-)
    
    # Check for placeholder values
    if [[ "$value" == *"your-"* ]] || [[ "$value" == *"xxxxx"* ]] || [[ "$value" == "sk-ant-api03-xxxxx" ]]; then
        echo "  ⚠️  $var has placeholder value"
        return 1
    fi
    
    if [ -z "$value" ]; then
        echo "  ⚠️  $var is empty"
        return 1
    fi
    
    echo "  ✅ $var is set"
    return 0
}

# Check Frontend .env
echo "📱 Frontend Environment (.env)"
if [ -f ".env" ]; then
    check_env_var ".env" "VITE_SUPABASE_URL"
    check_env_var ".env" "VITE_SUPABASE_ANON_KEY"
    check_env_var ".env" "VITE_API_URL"
else
    echo "  ❌ .env file not found"
    echo "     Run: cp .env.example .env"
fi
echo ""

# Check Backend .env
echo "🖥️  Backend Environment (backend/.env)"
if [ -f "backend/.env" ]; then
    check_env_var "backend/.env" "ANTHROPIC_API_KEY"
    check_env_var "backend/.env" "DATABASE_URL"
    
    # Check DATABASE_URL format
    if [ -f "backend/.env" ]; then
        db_url=$(grep "^DATABASE_URL=" backend/.env | cut -d '=' -f2-)
        if [[ "$db_url" == *":6543"* ]]; then
            echo "  ✅ DATABASE_URL uses pooler port :6543"
        elif [[ "$db_url" == *":5432"* ]]; then
            echo "  ⚠️  DATABASE_URL uses direct port :5432 (should use :6543 pooler)"
        fi
    fi
else
    echo "  ❌ backend/.env file not found"
    echo "     Run: cp backend/.env.example backend/.env"
fi
echo ""

echo "================================"
echo "💡 Tips:"
echo "  - Get Supabase URL/key from: Dashboard → Settings → API"
echo "  - Get Database URL from: Dashboard → Settings → Database → Connection Pooling"
echo "  - Get Anthropic key from: console.anthropic.com"
echo "  - Always use DATABASE_URL with :6543 port (pooler)"
