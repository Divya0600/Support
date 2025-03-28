# AI Ticket Resolver Backend Documentation

## Overview

The AI Ticket Resolver backend is built using Flask and serves as the API for managing ticket resolutions using AI. It processes incoming requests, interacts with the AITicketResolver class, and provides endpoints for updating settings, resolving tickets, uploading historical data, and fetching ticket information.

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd ai-ticket-resolver/backend
   ```

2. Install the required Python packages:

   ```
   pip install -r requirements.txt
   ```

### Running the Backend

1. Start the Flask application:

   ```
   python app.py
   ```

2. The backend will be accessible at `http://localhost:5000`.

## API Endpoints

### 1. Update Settings

- **Endpoint**: `/api/settings`
- **Method**: `POST`
- **Description**: Updates the API settings for the ticket resolver.

### 2. Resolve Ticket

- **Endpoint**: `/api/resolve`
- **Method**: `POST`
- **Description**: Receives a ticket description and returns an AI-generated resolution.

### 3. Upload Data

- **Endpoint**: `/api/upload`
- **Method**: `POST`
- **Description**: Uploads historical ticket data for processing.

### 4. Get Tickets

- **Endpoint**: `/api/tickets`
- **Method**: `GET`
- **Description**: Retrieves a list of sample tickets for demonstration purposes.

## File Structure

- `app.py`: Main entry point for the Flask backend.
- `requirements.txt`: Lists the required Python dependencies.
- `ai_powered/`: Contains the AITicketResolver class and related functionality.
- `data/sample_data.csv`: Sample historical ticket data for testing.

## Notes

- Ensure that the backend is running before accessing the frontend.
- For production deployment, consider implementing security measures and performance optimizations.