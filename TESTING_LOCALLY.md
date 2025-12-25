# Testing Locally

This guide will help you test the MentorMatch application locally, including the new login system and Excel export features.

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ and npm installed

## Step 1: Start the Backend Server

1. Open a terminal and navigate to the project directory:
   ```bash
   cd /Users/ashwinrameshkannan/Downloads/MentorMatchNCSU
   ```

2. Activate the Python virtual environment:
   ```bash
   cd backend
   source venv/bin/activate
   ```
   (On Windows: `venv\Scripts\activate`)

3. Install dependencies (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```

4. Start the Flask backend server:
   ```bash
   python app.py
   ```

   You should see output like:
   ```
   * Running on http://127.0.0.1:5000
   ```

   **Keep this terminal window open** - the backend needs to keep running.

## Step 2: Start the Frontend Development Server

1. Open a **new terminal window** (keep the backend terminal running)

2. Navigate to the frontend directory:
   ```bash
   cd /Users/ashwinrameshkannan/Downloads/MentorMatchNCSU/frontend
   ```

3. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```

   You should see output like:
   ```
   VITE v5.0.8  ready in XXX ms
   
   ➜  Local:   http://localhost:3000/
   ➜  Network: use --host to expose
   ```

## Step 3: Access the Application

1. Open your web browser and go to:
   ```
   http://localhost:3000
   ```

2. You should see the **Login page** (this is new!)

3. Enter the login credentials:
   - **Username:** `admin`
   - **Password:** `mentormatch2026`

4. Click "Login" - you should be redirected to the Dashboard

## Step 4: Test the Features

### Test Login System:
- ✅ Try logging in with wrong credentials - should show error
- ✅ Log in with correct credentials - should access dashboard
- ✅ Click "Logout" in the navigation bar - should return to login page
- ✅ Try accessing `/data` directly in browser - should redirect to login

### Test Excel Export:
1. Navigate to **Verification** page (from the navigation menu)
2. If you have verified matches, you'll see an **"📥 Export to Excel"** button
3. Click the button - it should download an Excel file with all verified matches
4. Open the downloaded file to verify it contains:
   - Match numbers
   - Mentee and Mentor details (names, emails, IDs, disciplines, locations, modes)
   - Compatibility scores
   - Status and export date

### Test Data Persistence:
1. Upload some mentors/mentees in **Data Management**
2. Open the app in a different browser (or incognito window)
3. Log in again
4. You should see the same data you uploaded - confirming data is shared

## Troubleshooting

### Backend won't start:
- Make sure port 5000 is not in use by another application
- Check that the virtual environment is activated
- Verify all dependencies are installed: `pip install -r requirements.txt`

### Frontend won't start:
- Make sure Node.js is installed: `node --version`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that port 3000 is available

### Can't connect to backend:
- Verify backend is running on `http://127.0.0.1:5000`
- Check the browser console for errors
- Make sure the Vite proxy is configured correctly in `vite.config.js`

### Login page not showing:
- Clear browser cache and refresh
- Check browser console for JavaScript errors
- Verify `Login.jsx` file exists in `frontend/src/pages/`

### Excel export not working:
- Check browser console for errors
- Make sure `xlsx` package is installed: `npm install xlsx`
- Verify you have verified matches to export

## Quick Commands Reference

**Backend:**
```bash
cd backend
source venv/bin/activate  # or: venv\Scripts\activate (Windows)
python app.py
```

**Frontend:**
```bash
cd frontend
npm install  # First time only
npm run dev
```

**Stop servers:**
- Press `Ctrl+C` in the terminal where the server is running

## Next Steps

Once you've tested locally and everything works:
1. Commit your changes to git
2. Push to your repository
3. Deploy to Render (the deployment will automatically include the new features)

---

**Note:** The login credentials are hardcoded in `frontend/src/pages/Login.jsx`. You can change them by editing lines 12-13 of that file.

