# Alumni Mentorship Matching Platform

A full-stack web application for university staff to manage, match, and verify mentors and mentees.

## Features

- **Dashboard**: Overview of mentors, mentees, matches, and quick actions
- **Data Management**: Upload and manage mentor/mentee data via CSV or manual entry
- **Matching Engine**: Run weighted matching algorithm with adjustable parameters
- **Verification**: Review, approve, or reassign matches before finalizing
- **Reports**: Visual analytics with charts and statistics

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Flask (Python)
- **Data Storage**: Local JSON files (easily upgradeable to Firebase)
- **Charts**: Recharts

## Prerequisites

- **Python 3.8+** - Required for the Flask backend
- **Node.js 16+** - Required for the React frontend
- **npm** - Comes with Node.js, used for managing frontend dependencies

### Quick Version Check

```bash
# Check Python version
python3 --version

# Check Node.js version
node --version

# Check npm version
npm --version
```

### Installation Instructions

See [QUICKSTART.md](QUICKSTART.md) for detailed installation instructions for:
- macOS (using Homebrew)
- Linux (Ubuntu/Debian)
- Windows

## Project Structure

```
MentorMatchNCSU/
├── backend/
│   ├── app.py                 # Flask application with all API endpoints
│   ├── matching_logic.py      # Matching algorithm implementation
│   ├── requirements.txt       # Python dependencies
│   └── data/                  # JSON data storage (created automatically)
│       ├── mentors.json
│       ├── mentees.json
│       └── matches.json
├── frontend/
│   ├── src/
│   │   ├── pages/             # React page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DataManagement.jsx
│   │   │   ├── MatchingEngine.jsx
│   │   │   ├── Verification.jsx
│   │   │   └── Reports.jsx
│   │   ├── utils/
│   │   │   └── api.js         # API utility functions
│   │   ├── App.jsx            # Main app component with routing
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Data Management
- `GET /api/get-data?type={mentor|mentee}` - Get all mentors or mentees
- `POST /api/upload-data` - Upload mentor/mentee data
- `PUT /api/update-record` - Update a record
- `DELETE /api/delete-record?id={id}&type={type}` - Delete a record

### Matching
- `POST /api/run-matching` - Run matching algorithm with weights
- `GET /api/get-matches` - Get all matches
- `POST /api/verify-match` - Approve or reassign a match

### Statistics
- `GET /api/stats` - Get dashboard statistics
- `GET /api/health` - Health check

## Matching Algorithm

The matching algorithm uses weighted scoring based on:
- **Discipline**: Exact match = 1.0, partial = 0.5, no match = 0.0
- **Location**: Exact match = 1.0, partial = 0.5, no match = 0.0
- **Mode**: Exact match = 1.0, hybrid compatibility = 0.7, no match = 0.0

Weights are normalized automatically and can be adjusted via sliders in the Matching Engine page.

The algorithm also enforces mentor capacity limits (default: 3 mentees per mentor).

## Data Format

### Mentor Record
```json
{
  "id": 1,
  "name": "John Doe",
  "discipline": "Computer Science",
  "location": "Raleigh",
  "mode": "Remote",
  "status": "active",
  "max_mentees": 3,
  "current_mentees": 0
}
```

### Mentee Record
```json
{
  "id": 1,
  "name": "Jane Smith",
  "discipline": "Computer Science",
  "location": "Raleigh",
  "mode": "Remote",
  "status": "active"
}
```

### CSV Upload Format
```
name,discipline,location,mode,status
John Doe,Computer Science,Raleigh,Remote,active
Jane Smith,Engineering,Charlotte,In-Person,active
```

## Usage Workflow

1. **Add Data**: Use the Data Management page to add mentors and mentees (via CSV upload or manual entry)
2. **Run Matching**: Go to Matching Engine, adjust weights if needed, and click "Run Matching"
3. **Verify Matches**: Review matches in the Verification page and approve or reassign as needed
4. **View Reports**: Check the Reports page for analytics and statistics

## Future Enhancements

- Firebase integration for cloud storage
- User authentication and role-based access
- Email notifications for matches
- Export functionality (PDF, Excel)
- Advanced filtering and search
- Match history and versioning
- Mentor/mentee profiles with photos

## License

This project is created for educational purposes.


