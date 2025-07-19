#!/bin/bash

# Script to update API URLs from localhost to production
# Usage: ./update-api-urls.sh https://your-backend-url.com

if [ -z "$1" ]; then
    echo "Usage: ./update-api-urls.sh <production-backend-url>"
    echo "Example: ./update-api-urls.sh https://parkapp-backend.herokuapp.com"
    exit 1
fi

PRODUCTION_URL=$1

echo "Updating API URLs from localhost:3001 to $PRODUCTION_URL..."

# Update all TypeScript/JavaScript files in mobile/app directory
find mobile/app -name "*.tsx" -o -name "*.ts" | while read file; do
    echo "Updating $file..."
    sed -i "s|http://localhost:3001|$PRODUCTION_URL|g" "$file"
done

echo "✅ API URLs updated successfully!"
echo "📱 You can now build your app with: npx eas build --platform android --profile preview" 