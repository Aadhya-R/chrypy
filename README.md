# chrypy
Running the Application
I can see this is a FastAPI application with a SQLite database. Here's how to run it:

Prerequisites
Python 3.7+ installed
Virtual environment (recommended)
Setup and Run
Activate the virtual environment (if you're using one):
bash
# On Windows:
.\venv\Scripts\activate
Install dependencies:
bash
pip install -r requirements.txt
Run the FastAPI server:
bash
uvicorn login.main:app --reload
--reload enables auto-reload on code changes (for development)
Access the API:
The API will be available at: http://127.0.0.1:8000
Interactive API documentation: http://127.0.0.1:8000/docs

ABOVE IS FOR BACKEND

BELOW IS BACKEND

React frontend in the login/react-framework-with-vite directory. Here's how to run it:

Navigate to the frontend directory:
bash
cd login/react-framework-with-vite
Install dependencies (if not already installed):
bash
npm install
Start the development server:
bash
npm run dev
The frontend will be available at http://localhost:5173 (Vite's default port).

Important: Make sure the FastAPI backend is running in a separate terminal window, as the frontend needs to communicate with it.