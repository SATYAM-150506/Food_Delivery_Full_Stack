# Vercel Deployment Guide

## Setup Instructions

### 1. Environment Variables on Vercel
Go to your Vercel project settings and add these environment variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=your_vercel_domain_url
NODE_ENV=production
```

### 2. Build Configuration
The deployment uses:
- **Frontend**: React app built with `npm run build`
- **Backend**: Express server served via serverless functions
- **API**: Serverless API route handler

### 3. Deployment Process

```bash
# Push to GitHub
git add .
git commit -m "your message"
git push

# Vercel will automatically deploy based on vercel.json configuration
```

### 4. Troubleshooting Exit Code 126

**Exit code 126** = Permission Denied

**Solutions:**
1. Ensure all dependencies are listed in package.json
2. Check that build scripts are correctly defined
3. Verify NODE_ENV is set to "production"
4. Clear Vercel cache and redeploy

**To redeploy:**
- Go to Vercel Dashboard → Your Project → Deployments
- Click three dots on latest deployment → "Redeploy"
- Check build logs for errors

### 5. File Structure
```
/
├── api/
│   └── index.js (serverless function)
├── backend/
│   ├── src/
│   │   └── app.js (express app)
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json (builds to build/)
└── vercel.json (configuration)
```

### 6. Important Notes
- `.env` files are NOT committed (secured in .gitignore)
- Set all secrets in Vercel dashboard only
- Frontend builds to `frontend/build/`
- Backend serves API routes via `/api/`
