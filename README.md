# AI Ticket Resolver Project

This project is an AI-powered ticket resolution system that integrates a Python backend with a React frontend. The system allows users to submit tickets, receive AI-generated resolutions, and manage ticket data efficiently.

## Project Structure

The project is organized into two main directories: `backend` and `frontend`.

```
ai-ticket-resolver
├── backend
│   ├── app.py                # Main entry point for the Flask backend
│   ├── requirements.txt      # Python dependencies for the backend
│   ├── ai_powered           # Package containing AI ticket resolver logic
│   │   ├── __init__.py      # Initializes the ai_powered package
│   │   └── resolver.py       # Contains the AITicketResolver class
│   ├── data                  # Directory for sample data
│   │   └── sample_data.csv   # Sample historical ticket data
│   └── README.md             # Documentation for the backend
├── frontend
│   ├── public                # Public assets for the React app
│   │   ├── index.html        # Main HTML file for the React application
│   │   └── favicon.ico       # Favicon for the web application
│   ├── src                   # Source code for the React app
│   │   ├── components         # React components for the application
│   │   │   ├── SettingsView.jsx  # Component for configuring API settings
│   │   │   ├── NewTicketView.jsx  # Component for submitting new tickets
│   │   │   └── TicketsView.jsx     # Component for displaying tickets
│   │   ├── services           # API service functions
│   │   │   └── api.js        # Functions for making API calls to the backend
│   │   ├── App.js            # Main component of the React application
│   │   ├── index.js          # Entry point for the React application
│   │   └── index.css         # Global styles for the React application
│   ├── package.json          # Configuration file for npm
│   ├── tailwind.config.js     # Configuration file for Tailwind CSS
│   └── README.md             # Documentation for the frontend
└── README.md                 # Overview of the entire project
```

## Backend Setup

1. Navigate to the `backend` directory.
2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```
3. Start the Flask backend:
   ```
   python app.py
   ```

## Frontend Setup

1. Navigate to the `frontend` directory.
2. Install the required npm packages:
   ```
   npm install
   ```
3. Start the React frontend:
   ```
   npm start
   ```

## Accessing the Application

Once both the backend and frontend are running, you can access the application at `http://localhost:3000`. Configure the API settings with your Azure OpenAI credentials to start using the ticket resolver.

## Additional Information

- Ensure that the backend is running before starting the frontend.
- Modify the sample data in `backend/data/sample_data.csv` for testing purposes.
- Refer to the individual `README.md` files in the `backend` and `frontend` directories for more detailed instructions and usage guidelines.