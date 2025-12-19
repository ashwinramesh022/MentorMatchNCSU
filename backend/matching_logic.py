"""
Matching Algorithm for Alumni Mentorship Matching Platform
Implements weighted scoring based on discipline, location, and mode preferences
"""


def calculate_compatibility_score(mentor, mentee, weights):
    """
    Calculate compatibility score between a mentor and mentee
    
    Args:
        mentor: Dict with mentor attributes (discipline, location, mode, max_mentees, current_mentees)
        mentee: Dict with mentee attributes (discipline, location, mode)
        weights: Dict with weights for each attribute (discipline, location, mode)
    
    Returns:
        float: Compatibility score (0.0 to 1.0)
    """
    score = 0.0
    
    # Discipline match (exact match = 1.0, partial match = 0.5, no match = 0.0)
    if mentor.get('discipline', '').lower() == mentee.get('discipline', '').lower():
        discipline_score = 1.0
    elif mentor.get('discipline', '').lower() in mentee.get('discipline', '').lower() or \
         mentee.get('discipline', '').lower() in mentor.get('discipline', '').lower():
        discipline_score = 0.5
    else:
        discipline_score = 0.0
    
    score += weights.get('discipline', 0.4) * discipline_score
    
    # Location match (exact match = 1.0, same country/region = 0.5, no match = 0.0)
    mentor_location = mentor.get('location', '').lower()
    mentee_location = mentee.get('location', '').lower()
    
    if mentor_location == mentee_location:
        location_score = 1.0
    elif any(word in mentor_location for word in mentee_location.split()) or \
         any(word in mentee_location for word in mentor_location.split()):
        location_score = 0.5
    else:
        location_score = 0.0
    
    score += weights.get('location', 0.3) * location_score
    
    # Mode match (exact match = 1.0, partial match = 0.5, no match = 0.0)
    mentor_mode = mentor.get('mode', '').lower()
    mentee_mode = mentee.get('mode', '').lower()
    
    if mentor_mode == mentee_mode:
        mode_score = 1.0
    elif 'hybrid' in mentor_mode or 'hybrid' in mentee_mode:
        # Hybrid can match with both in-person and remote
        mode_score = 0.7
    else:
        mode_score = 0.0
    
    score += weights.get('mode', 0.3) * mode_score
    
    return min(score, 1.0)  # Cap at 1.0


def run_matching_algorithm(mentors, mentees, weights):
    """
    Run the matching algorithm to pair mentors with mentees
    
    Args:
        mentors: List of mentor dictionaries
        mentees: List of mentee dictionaries
        weights: Dict with weights for matching criteria
    
    Returns:
        tuple: (matches, unmatched_mentees)
            matches: List of dicts with mentee_id, mentor_id, score, and top alternatives
            unmatched_mentees: List of mentee IDs that couldn't be matched
    """
    matches = []
    unmatched_mentees = []
    
    # Track mentor capacity
    mentor_mentee_count = {mentor['id']: 0 for mentor in mentors}
    
    # Get max_mentees for each mentor (default to 3 if not specified).
    # Values coming from CSV uploads are strings, so we coerce to int safely.
    mentor_max_capacity = {}
    for mentor in mentors:
        raw_value = mentor.get('max_mentees', 3)
        try:
            max_capacity = int(raw_value)
        except (TypeError, ValueError):
            max_capacity = 3
        mentor_max_capacity[mentor['id']] = max_capacity
    
    # For each mentee, find the best matching mentors
    for mentee in mentees:
        mentee_id = mentee['id']
        candidate_scores = []
        
        # Calculate compatibility with all available mentors
        for mentor in mentors:
            mentor_id = mentor['id']
            
            # Skip if mentor is at capacity
            if mentor_mentee_count[mentor_id] >= mentor_max_capacity[mentor_id]:
                continue
            
            # Calculate compatibility score
            score = calculate_compatibility_score(mentor, mentee, weights)
            
            candidate_scores.append({
                'mentor_id': mentor_id,
                'mentor_name': mentor.get('name', 'Unknown'),
                'score': score
            })
        
        # Sort by score (descending)
        candidate_scores.sort(key=lambda x: x['score'], reverse=True)
        
        if candidate_scores and candidate_scores[0]['score'] > 0:
            # Match with the best mentor
            best_match = candidate_scores[0]
            mentor_id = best_match['mentor_id']
            
            # Get top 3 alternatives (excluding the best match)
            top_alternatives = candidate_scores[1:4]  # Next 3 best matches
            
            matches.append({
                'mentee_id': mentee_id,
                'mentee_name': mentee.get('name', 'Unknown'),
                'mentor_id': mentor_id,
                'mentor_name': best_match['mentor_name'],
                'score': best_match['score'],
                'top_alternatives': top_alternatives,
                'status': 'pending',  # Pending verification
                'verified': False
            })
            
            # Update mentor capacity
            mentor_mentee_count[mentor_id] += 1
        else:
            # No suitable mentor found
            unmatched_mentees.append({
                'id': mentee_id,
                'name': mentee.get('name', 'Unknown')
            })
    
    return matches, unmatched_mentees


