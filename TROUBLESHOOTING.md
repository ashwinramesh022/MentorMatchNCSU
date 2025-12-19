# Troubleshooting Guide

## Common Issues and Solutions

### 403 Error When Uploading CSV or Making API Calls

**Symptom:** You see "Request failed with status code 403" or "Access forbidden" error messages.

**Most Common Cause:** The Flask backend server is not running.

**Solution:**
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate your virtual environment (if using one):
   ```bash
   source venv/bin/activate  # macOS/Linux
   # or
   venv\Scripts\activate  # Windows
   ```

3. Start the Flask server:
   ```bash
   python app.py
   ```

4. You should see output like:
   ```
   * Running on http://127.0.0.1:5000
   * Running on http://localhost:5000
   ```

5. Keep this terminal window open while using the application.

**Verify Backend is Running:**
- Open your browser and go to: `http://localhost:5000/api/health`
- You should see: `{"status":"healthy","message":"Backend is running"}`

### Other Common Issues

#### Frontend Won't Start
- **Check:** Is port 3000 already in use?
- **Solution:** 
  ```bash
  # Find process using port 3000
  lsof -ti:3000  # macOS/Linux
  # Kill the process if needed
  kill -9 $(lsof -ti:3000)
  ```

#### Backend Won't Start
- **Check:** Is port 5000 already in use?
- **Solution:**
  ```bash
  # Find process using port 5000
  lsof -ti:5000  # macOS/Linux
  # Kill the process if needed
  kill -9 $(lsof -ti:5000)
  ```

#### CORS Errors
- **Check:** Is the backend running on port 5000?
- **Check:** Is the frontend running on port 3000?
- **Solution:** Make sure both servers are running and restart them if needed.

#### Data Not Saving
- **Check:** Does the `backend/data/` directory exist?
- **Check:** Do you have write permissions?
- **Solution:** The data directory is created automatically. Check file permissions if issues persist.

#### CSV Upload Not Working
- **Check:** Is the backend server running?
- **Check:** Is the CSV format correct? (headers: name, discipline, location, mode, status)
- **Check:** Browser console for detailed error messages (F12 → Console tab)

### Debugging Steps

1. **Check Backend Logs:**
   - Look at the terminal where Flask is running
   - Check for error messages or stack traces

2. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for error messages

3. **Check Network Tab:**
   - Open Developer Tools (F12)
   - Go to Network tab
   - Try uploading CSV again
   - Click on the failed request to see details

4. **Test Backend Directly:**
   ```bash
   # Test health endpoint
   curl http://localhost:5000/api/health
   
   # Test get data endpoint
   curl http://localhost:5000/api/get-data?type=mentor
   ```

### Still Having Issues?

1. Make sure all dependencies are installed:
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

2. Restart both servers:
   - Stop both frontend and backend (Ctrl+C)
   - Start backend first, then frontend

3. Clear browser cache and reload

4. Check that you're using the correct Python and Node.js versions:
   ```bash
   python3 --version  # Should be 3.8+
   node --version     # Should be 16+
   ```

