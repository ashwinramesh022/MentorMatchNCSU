"""
Flask Backend for Alumni Mentorship Matching Platform
Main application file with all API endpoints
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from matching_logic import run_matching_algorithm

app = Flask(__name__)
# Enable CORS for React frontend with explicit configuration
# Allow both local development and production URLs
frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
allowed_origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    frontend_url
]
# Add HTTPS version if frontend URL is HTTP
if frontend_url.startswith('http://'):
    allowed_origins.append(frontend_url.replace('http://', 'https://'))

CORS(app, resources={
    r"/api/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Data storage paths
DATA_DIR = 'data'
MENTORS_FILE = os.path.join(DATA_DIR, 'mentors.json')
MENTEES_FILE = os.path.join(DATA_DIR, 'mentees.json')
MATCHES_FILE = os.path.join(DATA_DIR, 'matches.json')

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize empty data files if they don't exist
def init_data_files():
    """Initialize JSON data files if they don't exist"""
    if not os.path.exists(MENTORS_FILE):
        with open(MENTORS_FILE, 'w') as f:
            json.dump([], f)
    if not os.path.exists(MENTEES_FILE):
        with open(MENTEES_FILE, 'w') as f:
            json.dump([], f)
    if not os.path.exists(MATCHES_FILE):
        with open(MATCHES_FILE, 'w') as f:
            json.dump([], f)

init_data_files()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Backend is running'})


@app.route('/api/upload-data', methods=['POST'])
def upload_data():
    """
    Upload mentor/mentee data from CSV
    Expects: { 'type': 'mentor' or 'mentee', 'data': [array of objects] }
    """
    try:
        data = request.json
        data_type = data.get('type')  # 'mentor' or 'mentee'
        records = data.get('data', [])
        
        if data_type not in ['mentor', 'mentee']:
            return jsonify({'error': 'Invalid type. Must be "mentor" or "mentee"'}), 400
        
        # Determine target file
        target_file = MENTORS_FILE if data_type == 'mentor' else MENTEES_FILE
        
        # Read existing data
        if os.path.exists(target_file):
            with open(target_file, 'r') as f:
                existing_data = json.load(f)
        else:
            existing_data = []
        
        # Add new records (with unique IDs)
        max_id = max([r.get('id', 0) for r in existing_data], default=0)
        for i, record in enumerate(records):
            if 'id' not in record:
                record['id'] = max_id + i + 1
        
        # Merge with existing data (update if ID exists, append if new)
        existing_ids = {r['id'] for r in existing_data}
        for record in records:
            if record['id'] in existing_ids:
                # Update existing record
                for i, existing in enumerate(existing_data):
                    if existing['id'] == record['id']:
                        existing_data[i] = record
                        break
            else:
                # Add new record
                existing_data.append(record)
        
        # Save to file
        with open(target_file, 'w') as f:
            json.dump(existing_data, f, indent=2)
        
        return jsonify({
            'success': True,
            'message': f'Successfully uploaded {len(records)} {data_type}(s)',
            'total': len(existing_data)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/get-data', methods=['GET'])
def get_data():
    """Get all mentors or mentees"""
    try:
        data_type = request.args.get('type')  # 'mentor' or 'mentee'
        
        if data_type not in ['mentor', 'mentee']:
            return jsonify({'error': 'Invalid type. Must be "mentor" or "mentee"'}), 400
        
        target_file = MENTORS_FILE if data_type == 'mentor' else MENTEES_FILE
        
        if os.path.exists(target_file):
            with open(target_file, 'r') as f:
                data = json.load(f)
        else:
            data = []
        
        return jsonify({'success': True, 'data': data})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/update-record', methods=['PUT'])
def update_record():
    """Update a single mentor or mentee record"""
    try:
        data = request.json
        record_id = data.get('id')
        data_type = data.get('type')  # 'mentor' or 'mentee'
        updated_record = data.get('record')
        
        if data_type not in ['mentor', 'mentee']:
            return jsonify({'error': 'Invalid type'}), 400
        
        target_file = MENTORS_FILE if data_type == 'mentor' else MENTEES_FILE
        
        # Read existing data
        with open(target_file, 'r') as f:
            records = json.load(f)
        
        # Find and update record
        found = False
        for i, record in enumerate(records):
            if record.get('id') == record_id:
                updated_record['id'] = record_id  # Preserve ID
                records[i] = updated_record
                found = True
                break
        
        if not found:
            return jsonify({'error': 'Record not found'}), 404
        
        # Save to file
        with open(target_file, 'w') as f:
            json.dump(records, f, indent=2)
        
        return jsonify({'success': True, 'message': 'Record updated'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/delete-record', methods=['DELETE'])
def delete_record():
    """Delete a mentor or mentee record and clean up related matches"""
    try:
        record_id = int(request.args.get('id'))
        data_type = request.args.get('type')  # 'mentor' or 'mentee'
        
        if data_type not in ['mentor', 'mentee']:
            return jsonify({'error': 'Invalid type'}), 400
        
        target_file = MENTORS_FILE if data_type == 'mentor' else MENTEES_FILE
        
        # Read existing data
        with open(target_file, 'r') as f:
            records = json.load(f)
        
        # Remove record
        records = [r for r in records if r.get('id') != record_id]
        
        # Save to file
        with open(target_file, 'w') as f:
            json.dump(records, f, indent=2)
        
        # Clean up matches that reference the deleted record
        if os.path.exists(MATCHES_FILE):
            with open(MATCHES_FILE, 'r') as f:
                match_data = json.load(f)
            
            matches = match_data.get('matches', [])
            
            # Remove matches that reference the deleted mentor or mentee
            if data_type == 'mentor':
                matches = [m for m in matches if m.get('mentor_id') != record_id]
            else:  # mentee
                matches = [m for m in matches if m.get('mentee_id') != record_id]
            
            # Also clean up unmatched_mentees if a mentee was deleted
            if data_type == 'mentee':
                unmatched_mentees = match_data.get('unmatched_mentees', [])
                unmatched_mentees = [m for m in unmatched_mentees if m.get('id') != record_id]
                match_data['unmatched_mentees'] = unmatched_mentees
            
            match_data['matches'] = matches
            
            # Save updated matches
            with open(MATCHES_FILE, 'w') as f:
                json.dump(match_data, f, indent=2)
        
        return jsonify({'success': True, 'message': 'Record deleted and related matches cleaned up'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/run-matching', methods=['POST'])
def run_matching():
    """
    Run the matching algorithm with custom weights
    Expects: { 'weights': { 'discipline': 0.4, 'location': 0.3, 'mode': 0.3 } }
    """
    try:
        weights = request.json.get('weights', {
            'discipline': 0.5,  # Higher weight for career/field alignment
            'location': 0.3,    # Moderate weight (can work remotely)
            'mode': 0.2         # Lower weight (most flexible)
        })
        
        # Load mentors and mentees
        with open(MENTORS_FILE, 'r') as f:
            mentors = json.load(f)
        
        with open(MENTEES_FILE, 'r') as f:
            mentees = json.load(f)
        
        # Run matching algorithm
        matches, unmatched_mentees = run_matching_algorithm(mentors, mentees, weights)
        
        # Save matches
        with open(MATCHES_FILE, 'w') as f:
            json.dump({
                'matches': matches,
                'unmatched_mentees': unmatched_mentees,
                'weights': weights
            }, f, indent=2)
        
        return jsonify({
            'success': True,
            'matches': matches,
            'unmatched_mentees': unmatched_mentees,
            'total_matches': len(matches),
            'total_unmatched': len(unmatched_mentees)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/get-matches', methods=['GET'])
def get_matches():
    """Get all matches (pending and verified), filtering out invalid references"""
    try:
        # Load mentors and mentees to validate match references
        with open(MENTORS_FILE, 'r') as f:
            mentors = json.load(f)
        with open(MENTEES_FILE, 'r') as f:
            mentees = json.load(f)
        
        mentor_ids = {m.get('id') for m in mentors}
        mentee_ids = {m.get('id') for m in mentees}
        
        if os.path.exists(MATCHES_FILE):
            with open(MATCHES_FILE, 'r') as f:
                data = json.load(f)
        else:
            data = {'matches': [], 'unmatched_mentees': [], 'weights': {}}
        
        # Filter out matches with invalid mentor or mentee references
        valid_matches = []
        for match in data.get('matches', []):
            if (match.get('mentor_id') in mentor_ids and 
                match.get('mentee_id') in mentee_ids):
                valid_matches.append(match)
        
        # Filter out unmatched mentees that no longer exist
        valid_unmatched = [
            m for m in data.get('unmatched_mentees', [])
            if m.get('id') in mentee_ids
        ]
        
        data['matches'] = valid_matches
        data['unmatched_mentees'] = valid_unmatched
        
        return jsonify({'success': True, **data})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/clear-matches', methods=['POST'])
def clear_matches():
    """Clear all matches"""
    try:
        with open(MATCHES_FILE, 'w') as f:
            json.dump({
                'matches': [],
                'unmatched_mentees': [],
                'weights': {}
            }, f, indent=2)
        
        return jsonify({'success': True, 'message': 'All matches cleared'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/clear-all', methods=['POST'])
def clear_all():
    """Clear all mentors or mentees"""
    try:
        data = request.json
        data_type = data.get('type')  # 'mentor' or 'mentee'
        
        if data_type not in ['mentor', 'mentee']:
            return jsonify({'error': 'Invalid type. Must be "mentor" or "mentee"'}), 400
        
        target_file = MENTORS_FILE if data_type == 'mentor' else MENTEES_FILE
        
        # Clear the file
        with open(target_file, 'w') as f:
            json.dump([], f, indent=2)
        
        # Also clear matches that reference the deleted records
        if os.path.exists(MATCHES_FILE):
            with open(MATCHES_FILE, 'r') as f:
                match_data = json.load(f)
            
            matches = match_data.get('matches', [])
            unmatched_mentees = match_data.get('unmatched_mentees', [])
            
            if data_type == 'mentor':
                # Remove all matches (since all mentors are deleted)
                matches = []
            else:  # mentee
                # Remove all matches and unmatched mentees
                matches = []
                unmatched_mentees = []
            
            match_data['matches'] = matches
            match_data['unmatched_mentees'] = unmatched_mentees
            
            with open(MATCHES_FILE, 'w') as f:
                json.dump(match_data, f, indent=2)
        
        return jsonify({'success': True, 'message': f'All {data_type}s cleared and related matches cleaned up'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/verify-match', methods=['POST'])
def verify_match():
    """
    Approve or reassign a match
    Expects: { 'mentee_id': int, 'mentor_id': int, 'action': 'approve' or 'reassign', 'new_mentor_id': int (if reassign) }
    """
    try:
        data = request.json
        mentee_id = data.get('mentee_id')
        mentor_id = data.get('mentor_id')
        action = data.get('action')  # 'approve' or 'reassign'
        
        # Load matches
        with open(MATCHES_FILE, 'r') as f:
            match_data = json.load(f)
        
        matches = match_data.get('matches', [])
        
        # Find the match
        match_found = False
        for match in matches:
            if match.get('mentee_id') == mentee_id and match.get('mentor_id') == mentor_id:
                if action == 'approve':
                    match['status'] = 'verified'
                    match['verified'] = True
                elif action == 'reassign':
                    new_mentor_id = data.get('new_mentor_id')
                    if new_mentor_id:
                        match['mentor_id'] = new_mentor_id
                        match['status'] = 'pending'
                    else:
                        return jsonify({'error': 'new_mentor_id required for reassign'}), 400
                match_found = True
                break
        
        if not match_found:
            return jsonify({'error': 'Match not found'}), 404
        
        # Save updated matches
        with open(MATCHES_FILE, 'w') as f:
            json.dump(match_data, f, indent=2)
        
        return jsonify({'success': True, 'message': f'Match {action}d successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    try:
        # Load all data
        with open(MENTORS_FILE, 'r') as f:
            mentors = json.load(f)
        
        with open(MENTEES_FILE, 'r') as f:
            mentees = json.load(f)
        
        if os.path.exists(MATCHES_FILE):
            with open(MATCHES_FILE, 'r') as f:
                match_data = json.load(f)
            matches = match_data.get('matches', [])
            verified_matches = [m for m in matches if m.get('status') == 'verified']
        else:
            matches = []
            verified_matches = []
        
        # Calculate mentor capacity usage
        mentor_capacity = {}
        for match in verified_matches:
            mentor_id = match.get('mentor_id')
            if mentor_id not in mentor_capacity:
                mentor_capacity[mentor_id] = 0
            mentor_capacity[mentor_id] += 1
        
        return jsonify({
            'success': True,
            'stats': {
                'total_mentors': len(mentors),
                'total_mentees': len(mentees),
                'total_matches': len(matches),
                'verified_matches': len(verified_matches),
                'unmatched_mentees': len(mentees) - len(verified_matches),
                'mentor_capacity_usage': mentor_capacity
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)


