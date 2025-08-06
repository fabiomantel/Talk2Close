# 🚀 Vercel Deployment Guide

## Prerequisites

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Follow the prompts**:
   - Link to existing project: `No`
   - Project name: `talk2close-frontend` (or your preferred name)
   - Directory: `./` (current directory)

### Option 2: Deploy via Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Configure the project**:
   - Framework Preset: `Create React App`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

## Environment Variables

The following environment variables are configured in `vercel.json`:

- `REACT_APP_API_BASE_URL`: `https://talk2close.fly.dev/api`
- `REACT_APP_BACKEND_URL`: `https://talk2close.fly.dev`
- `REACT_APP_NAME`: `Hebrew Sales Call Analysis`
- `REACT_APP_ENVIRONMENT`: `production`
- `REACT_APP_DEFAULT_LOCALE`: `he-IL`
- `REACT_APP_RTL_SUPPORT`: `true`

## Post-Deployment

1. **Test the application** at your Vercel URL
2. **Verify API connectivity** with your Fly.io backend
3. **Check Hebrew RTL support** is working correctly

## Custom Domain (Optional)

1. **Add custom domain** in Vercel dashboard
2. **Configure DNS** as instructed by Vercel
3. **Update environment variables** if needed

## Troubleshooting

- **Build fails**: Check if all dependencies are installed
- **API errors**: Verify backend URL is correct
- **RTL issues**: Ensure Hebrew locale is properly configured 