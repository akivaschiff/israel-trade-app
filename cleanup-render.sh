#!/bin/bash

echo "🧹 Cleaning up old Render files..."
echo ""

# Files to remove
files_to_remove=(
    "render.yaml"
    "RENDER_DEPLOY.md"
    "DEPLOY_SUMMARY.md"
    "DEPLOYMENT_CHECKLIST.md"
    "render.yaml.backup"
)

for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✅ Removed: $file"
    else
        echo "  ⏭️  Not found: $file"
    fi
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Keeping Railway files:"
echo "  - railway.toml"
echo "  - backend/railway.json"
echo "  - railway-frontend.json"
echo "  - RAILWAY_DEPLOY.md"
echo "  - DEPLOY_CHECKLIST.md"
echo "  - START_HERE.md"
