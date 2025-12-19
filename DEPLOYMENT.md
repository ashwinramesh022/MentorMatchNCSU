# Deployment Guide for MentorMatch NCSU

This guide will help you deploy the application to Render.com (free tier) so your supervisor can access it.

## Prerequisites

1. **GitHub Account** (free) - https://github.com
2. **Render Account** (free) - https://render.com

## Step-by-Step Deployment Instructions

### Part 1: Prepare Your Code for GitHub

1. **Initialize Git repository** (if not already done):
   ```bash
   cd /Users/ashwinrameshkannan/Downloads/MentorMatchNCSU
   git init
   ```

2. **Create a .gitignore file** (if it doesn't exist):
   ```bash
   # Already created - includes node_modules, venv, etc.
   ```

3. **Add all files to Git**:
   ```bash
   git add .
   git commit -m "Initial commit - ready for deployment"
   ```

4. **Create a GitHub repository**:
   - Go to https://github.com/new
   - Name it something like `mentor-match-ncsu`
   - Don't initialize with README (you already have one)
   - Click "Create repository"

5. **Push your code to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/mentor-match-ncsu.git
   git branch -M main
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your GitHub username)

### Part 2: Deploy Backend to Render

1. **Sign up/Login to Render**:
   - Go to https://render.com
   - Sign up with GitHub (easiest option)

2. **Create Backend Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository: `mentor-match-ncsu`

3. **Configure Backend Service**:
   - **Name:** `mentor-match-backend` (or any name you prefer)
   - **Environment:** `Python 3`
   - **Region:** Choose closest to you (e.g., `Oregon (US West)`)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
   - **Plan:** Select "Free" plan

4. **Environment Variables** (optional, but recommended):
   - Click "Advanced" → "Environment Variables"
   - Add: `PYTHON_VERSION` = `3.11.0`

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes first time)
   - **Copy the URL** - it will be like: `https://mentor-match-backend.onrender.com`
   - ⚠️ **Save this URL** - you'll need it for the frontend!

### Part 3: Deploy Frontend to Render

1. **Create Frontend Static Site**:
   - Click "New +" → "Static Site"
   - Connect your GitHub repository (same one)
   - Select your repository: `mentor-match-ncsu`

2. **Configure Frontend Service**:
   - **Name:** `mentor-match-frontend` (or any name you prefer)
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Plan:** Select "Free" plan

3. **Environment Variables** (IMPORTANT):
   - Click "Environment" tab
   - Add environment variable:
     - **Key:** `VITE_API_URL`
     - **Value:** `https://YOUR-BACKEND-URL.onrender.com/api`
     - (Replace `YOUR-BACKEND-URL` with the actual backend URL from Step 2)

4. **Deploy**:
   - Click "Create Static Site"
   - Wait for deployment (3-5 minutes)
   - **Copy the frontend URL** - it will be like: `https://mentor-match-frontend.onrender.com`

### Part 4: Update CORS Settings (Important!)

1. **Go back to your Backend service** on Render
2. **Click "Environment" tab**
3. **Add environment variable:**
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://YOUR-FRONTEND-URL.onrender.com`
   - (Replace with your actual frontend URL)

4. **Update backend/app.py** (if needed):
   - The CORS settings should allow your frontend URL
   - Currently set to allow `localhost:3000` - you may need to update this

### Part 5: Test Your Deployment

1. **Visit your frontend URL** (e.g., `https://mentor-match-frontend.onrender.com`)
2. **Try uploading some data** to test
3. **Check if matching works**

## Important Notes

### Free Tier Limitations:
- ⚠️ **Spin-down:** Services spin down after 15 minutes of inactivity
- ⚠️ **First request:** May take 30-60 seconds to wake up
- ⚠️ **Monthly hours:** 750 free hours/month (enough for testing)
- ✅ **Data persists:** Your JSON files are saved on the server

### Troubleshooting:

**Backend won't start:**
- Check the logs in Render dashboard
- Make sure `gunicorn` is in requirements.txt
- Verify the start command is correct

**Frontend can't connect to backend:**
- Check `VITE_API_URL` environment variable is set correctly
- Make sure backend URL includes `/api` at the end
- Check CORS settings in backend

**Data not persisting:**
- JSON files are stored in `backend/data/` directory
- This persists across deployments on Render

## Sharing with Your Supervisor

Once deployed, share:
- **Frontend URL:** `https://mentor-match-frontend.onrender.com`
- They can access it from any browser
- No installation needed on their end

## Updating the Deployment

When you make changes:
1. Push to GitHub: `git push`
2. Render will automatically redeploy (or you can manually trigger it)

## Alternative: Quick Local Sharing

If you just need quick access without deployment:
- Use **ngrok** (free): `ngrok http 3000` to create a public URL
- Or use **VS Code Live Share** for temporary access

---

**Need help?** Check Render's documentation: https://render.com/docs

