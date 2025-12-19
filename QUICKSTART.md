# Quick Start Guide

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ and npm installed

### Installing/Updating Prerequisites

#### Check Current Versions

```bash
# Check Python version
python3 --version

# Check Node.js version
node --version

# Check npm version
npm --version
```

#### Install/Update Python 3.8+ (macOS)

```bash
# Using Homebrew (recommended)
brew install python@3.11

# Or install latest Python 3
brew install python3

# Verify installation
python3 --version
```

#### Install/Update Node.js 16+ and npm (macOS)

```bash
# Using Homebrew (recommended)
brew install node@18

# Or install latest Node.js (includes npm)
brew install node

# Verify installation
node --version
npm --version
```

#### Install/Update Python 3.8+ (Linux)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3-pip

# Or use pyenv for version management
curl https://pyenv.run | bash
pyenv install 3.11.0
pyenv global 3.11.0

# Verify installation
python3 --version
```

#### Install/Update Node.js 16+ and npm (Linux)

```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify installation
node --version
npm --version
```

#### Install/Update Python 3.8+ (Windows)

1. Download Python from [python.org](https://www.python.org/downloads/)
2. Run the installer and check "Add Python to PATH"
3. Verify: `python --version`

#### Install/Update Node.js 16+ and npm (Windows)

1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer (includes npm)
3. Verify: `node --version` and `npm --version`

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

The backend should now be running on `http://localhost:5000`

### 2. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend should now be running on `http://localhost:3000`

### 3. Access the Application

Open your browser and navigate to: `http://localhost:3000`

## Sample Data

You can add sample data using the CSV upload feature in the Data Management page:

### Sample Mentors CSV:
```
```

### Sample Mentees CSV:
```
name,discipline,location,mode,status
Student A,Computer Science,Raleigh,Remote,active
Student B,Engineering,Charlotte,In-Person,active
Student C,Data Science,Durham,Hybrid,active
Student D,Business,Raleigh,Remote,active
Student E,Computer Science,Raleigh,Remote,active
```

## First Steps

1. **Add Data**: Go to Data Management → Upload CSV or manually add mentors and mentees
2. **Run Matching**: Go to Matching Engine → Adjust weights if needed → Click "Run Matching"
3. **Verify Matches**: Go to Verification → Review and approve matches
4. **View Reports**: Go to Reports → See analytics and statistics

## Troubleshooting

### Backend won't start
- Make sure port 5000 is not in use
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify Python version: `python --version` (should be 3.8+)

### Frontend won't start
- Make sure port 3000 is not in use
- Check that all dependencies are installed: `npm install`
- Verify Node.js version: `node --version` (should be 16+)

### CORS errors
- Make sure the backend is running on port 5000
- Check that `flask-cors` is installed in the backend

### Data not persisting
- The data directory is created automatically in `backend/data/`
- Check file permissions if data isn't saving

## Next Steps

- Customize matching weights in Matching Engine
- Add more mentors and mentees
- Review and verify matches
- Explore the Reports page for insights


