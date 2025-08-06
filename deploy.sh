#!/bin/bash

# 🚀 Fly.io Deployment Script for Talk2Close
# Run this script after adding payment method to Fly.io

set -e

echo "🚀 Starting Fly.io deployment for Talk2Close..."

# Check if Fly CLI is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ Fly CLI not found. Please install it first:"
    echo "curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Please run: flyctl auth login"
    exit 1
fi

echo "✅ Fly CLI ready"

# Create app if it doesn't exist
echo "📱 Creating Fly app..."
flyctl apps create talk2close --org personal || echo "App already exists"

# Create volume for file storage
echo "💾 Creating volume for file storage..."
flyctl volumes create talk2close_data --size 1 --region fra || echo "Volume already exists"

# Set environment variables
echo "🔧 Setting environment variables..."
echo "Please enter your OpenAI API key:"
read -s OPENAI_API_KEY

flyctl secrets set OPENAI_API_KEY="$OPENAI_API_KEY"
flyctl secrets set NODE_ENV="production"
flyctl secrets set UPLOAD_DIR="./uploads"
flyctl secrets set MAX_FILE_SIZE="10485760"
flyctl secrets set ALLOWED_AUDIO_TYPES="audio/mpeg,audio/wav,audio/mp3,audio/mp4"

echo "✅ Environment variables set"

# Deploy the application
echo "🚀 Deploying application..."
flyctl deploy

echo "✅ Deployment complete!"
echo ""
echo "🔗 Your app is available at: https://talk2close.fly.dev"
echo "📊 Health check: https://talk2close.fly.dev/api/health"
echo ""
echo "📋 Next steps:"
echo "1. Set up your database (see DEPLOYMENT_GUIDE.md)"
echo "2. Run database migrations: flyctl ssh console -C 'npx prisma migrate deploy'"
echo "3. Monitor logs: flyctl logs --follow"
echo ""
echo "🎉 Happy deploying!" 