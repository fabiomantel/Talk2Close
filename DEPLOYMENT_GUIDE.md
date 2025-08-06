# 🚀 Fly.io Deployment Guide

## Prerequisites

1. **Add Payment Method to Fly.io**
   - Visit: https://fly.io/dashboard/fabio-mantelmacher/billing
   - Add your credit card to continue

2. **Install Fly CLI** (Already done)
   ```bash
   curl -L https://fly.io/install.sh | sh
   export PATH="$HOME/.fly/bin:$PATH"
   ```

3. **Login to Fly.io** (Already done)
   ```bash
   flyctl auth login
   ```

## Database Setup

### Option A: Fly.io Managed PostgreSQL (Recommended)

```bash
# Create PostgreSQL database
flyctl postgres create --name talk2close-db --region fra

# Attach database to your app
flyctl postgres attach talk2close-db --app talk2close
```

### Option B: External PostgreSQL Services

#### Neon (Free Tier)
1. Go to https://neon.tech
2. Create account and new project
3. Copy the connection string
4. Set as environment variable in Fly.io

#### Supabase (Free Tier)
1. Go to https://supabase.com
2. Create account and new project
3. Go to Settings > Database
4. Copy the connection string
5. Set as environment variable in Fly.io

## Application Deployment

### Step 1: Create Fly App
```bash
flyctl apps create talk2close
```

### Step 2: Set Environment Variables
```bash
# Set OpenAI API key
flyctl secrets set OPENAI_API_KEY="your_openai_api_key_here"

# Set other environment variables
flyctl secrets set NODE_ENV="production"
flyctl secrets set UPLOAD_DIR="./uploads"
flyctl secrets set MAX_FILE_SIZE="10485760"
flyctl secrets set ALLOWED_AUDIO_TYPES="audio/mpeg,audio/wav,audio/mp3,audio/mp4"
```

### Step 3: Create Volume for File Storage
```bash
flyctl volumes create talk2close_data --size 1 --region fra
```

### Step 4: Deploy Application
```bash
flyctl deploy
```

### Step 5: Run Database Migrations
```bash
flyctl ssh console -C "npx prisma migrate deploy"
```

## Configuration Files

### Dockerfile
- ✅ Created with multi-stage build
- ✅ Optimized for production
- ✅ Includes Prisma client generation

### fly.toml
- ✅ Configured for Node.js app
- ✅ Health checks enabled
- ✅ Volume mounting for uploads
- ✅ Auto-scaling enabled

### Health Check
- ✅ Endpoint at `/api/health`
- ✅ Database connection test
- ✅ Fly.io monitoring compatible

## Environment Variables

Set these in Fly.io dashboard or via CLI:

```bash
# Required
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."

# Optional (with defaults)
NODE_ENV="production"
PORT="3000"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760"
ALLOWED_AUDIO_TYPES="audio/mpeg,audio/wav,audio/mp3,audio/mp4"
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
```

## Post-Deployment

### 1. Verify Deployment
```bash
flyctl status
flyctl logs
```

### 2. Test Health Check
```bash
curl https://talk2close.fly.dev/api/health
```

### 3. Run Database Migrations
```bash
flyctl ssh console -C "npx prisma migrate deploy"
```

### 4. Monitor Application
```bash
flyctl logs --follow
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL environment variable
   - Verify database is running
   - Check network connectivity

2. **File Upload Issues**
   - Verify volume is mounted correctly
   - Check file permissions
   - Ensure upload directory exists

3. **Memory Issues**
   - Increase memory allocation in fly.toml
   - Monitor memory usage with `flyctl status`

### Useful Commands

```bash
# View app status
flyctl status

# View logs
flyctl logs

# SSH into app
flyctl ssh console

# Scale app
flyctl scale count 1

# Restart app
flyctl restart
```

## Cost Optimization

- **Auto-scaling**: App scales to zero when not in use
- **Database**: Use development tier for testing
- **Storage**: Start with 1GB volume, scale as needed

## Security Notes

- ✅ Environment variables for sensitive data
- ✅ Health checks for monitoring
- ✅ Rate limiting enabled
- ✅ HTTPS enforced
- ✅ No sensitive data in code

## Next Steps

1. Add payment method to Fly.io
2. Choose database provider
3. Deploy application
4. Set up monitoring
5. Configure custom domain (optional) 