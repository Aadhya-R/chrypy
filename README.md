🚀 Full-Stack Login Application (FastAPI + React + SQLite)

This project is a full-stack login application built with:

Backend → FastAPI
 + SQLite (with interactive API docs)

Frontend → React
 with Vite

📋 Prerequisites

Before running the project, make sure you have the following installed:

Python 3.7+

Node.js + npm (check with node -v and npm -v)

(Optional) Virtual environment for Python (venv recommended)

⚙️ Backend (FastAPI + SQLite)
1. Navigate to backend folder

If your backend code is inside login/, open a terminal there.

cd login

2. Create & activate a virtual environment (recommended)

On Windows (PowerShell):

python -m venv venv
.\venv\Scripts\activate


On Linux/Mac:

python3 -m venv venv
source venv/bin/activate

3. Install dependencies
pip install -r requirements.txt

4. Run FastAPI server
uvicorn main:app --reload


✅ Backend will be running at:

API → http://127.0.0.1:8000

Docs → http://127.0.0.1:8000/docs

🎨 Frontend (React + Vite)
1. Navigate to frontend folder
cd login/react-framework-with-vite

2. Install dependencies
npm install

3. Start development server
npm run dev


✅ Frontend will be running at:

UI → http://localhost:5173

🔗 Running Both Together

Open two terminals (or split terminal in VS Code):

Terminal 1 → Run FastAPI backend (uvicorn main:app --reload)

Terminal 2 → Run React frontend (npm run dev)

The frontend will communicate with the backend via REST API calls.

📌 Usage

Start the backend first.

Start the frontend.

Open http://localhost:5173
 in your browser.

Use the login page (frontend) → It will send requests to FastAPI backend.

Explore API endpoints at http://127.0.0.1:8000/docs
.

🛠 Development Notes

--reload flag in backend ensures auto-restart on code changes.

Vite’s dev server supports hot reloading for frontend changes.

For production:

Backend can be deployed with Uvicorn + Gunicorn or Docker.

Frontend can be built using npm run build and served via Nginx/Apache.