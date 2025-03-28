from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import pandas as pd
import os
from ai_powered import AITicketResolver  # Import your AITicketResolver class

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests

# Initialize the resolver (with placeholder values, will be updated via API)
resolver = None

@app.route('/api/settings', methods=['POST'])
def update_settings():
    """Update API settings for the ticket resolver"""
    settings = request.json
    global resolver
    
    # Initialize the resolver with new settings
    resolver = AITicketResolver(
        api_key=settings['apiKey'],
        endpoint=settings['endpoint'],
        embedding_deployment=settings['embeddingModel'],
        completion_deployment=settings['completionModel']
    )
    
    try:
        # Create a sample dataset if needed
        sample_data = {
            'issue_description': [
                "Outlook crashes when opening emails with attachments",
                "Cannot connect to the VPN from home network",
                "Computer runs very slow after recent Windows update",
                "Printer not responding when trying to print documents",
                "Unable to access shared network drive"
            ],
            'solution': [
                "Update Outlook to the latest version and clear the attachment cache.",
                "Ensure you're using the correct VPN client version and reset your home router.",
                "Roll back the problematic Windows update through Control Panel > Programs > View installed updates.",
                "Restart the print spooler service by going to Services, finding Print Spooler, right-clicking and selecting Restart.",
                "Check if the network is down by pinging the server. Verify network credentials and update them if necessary."
            ]
        }
        
        # Use in-memory data for testing
        df = pd.DataFrame(sample_data)
        
        # Set up historical data
        resolver.historical_data = df
        resolver.column_mapping = {'issue': 'issue_description', 'resolution': 'solution'}
        resolver._clean_data()
        
        # Generate embeddings
        resolver.generate_embeddings()
        
        return jsonify({"status": "success", "message": "Settings updated and embeddings generated"})
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    """Get list of tickets (for demo/testing)"""
    # In a real implementation, this would fetch from a database
    sample_tickets = [
        {"id": 1, "title": "Outlook crashes when opening PDFs", "status": "resolved", "date": "2025-03-25", "priority": "high"},
        {"id": 2, "title": "VPN connection fails from home network", "status": "pending", "date": "2025-03-27", "priority": "medium"},
        {"id": 3, "title": "Computer running slow after Windows update", "status": "resolved", "date": "2025-03-23", "priority": "low"},
        {"id": 4, "title": "Printer not responding to print commands", "status": "in-progress", "date": "2025-03-26", "priority": "high"},
        {"id": 5, "title": "Unable to access shared drive", "status": "resolved", "date": "2025-03-22", "priority": "medium"}
    ]
    return jsonify(sample_tickets)

@app.route('/api/resolve', methods=['POST'])
def resolve_ticket():
    """Get AI-generated resolution for a ticket"""
    if not resolver:
        return jsonify({"status": "error", "message": "Resolver not initialized"}), 400
    
    ticket_data = request.json
    ticket_description = ticket_data.get('description', '')
    
    try:
        # Get resolution from the AITicketResolver
        result = resolver.get_resolution(ticket_description)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_data():
    """Upload and process historical ticket data"""
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file provided"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400
    
    try:
        # Save file temporarily
        file_path = 'temp_upload.csv'
        file.save(file_path)
        
        # Initialize resolver if not already done
        global resolver
        if not resolver:
            return jsonify({"status": "error", "message": "Please configure API settings first"}), 400
        
        # Load data
        resolver.load_data(file_path)
        
        # Generate embeddings
        resolver.generate_embeddings()
        
        return jsonify({"status": "success", "message": f"Loaded {len(resolver.historical_data)} records and generated embeddings"})
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get system statistics"""
    if not resolver or not hasattr(resolver, 'historical_data'):
        # Return dummy stats if resolver is not initialized
        return jsonify({
            "totalResolved": 0,
            "avgResponseTime": "N/A",
            "successRate": "0%",
            "pendingTickets": 0
        })
    
    # Calculate real stats based on resolver data
    # This is a simple example - in a real implementation you would
    # calculate these metrics from your database
    total_records = len(resolver.historical_data)
    
    return jsonify({
        "totalResolved": total_records,
        "avgResponseTime": "14.2 min",  # Example value
        "successRate": "92%",           # Example value
        "pendingTickets": 8             # Example value
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)