# 🚀 Chrypy - Modern Authentication System

Chrypy is a secure, full-stack authentication system built with FastAPI and React. It provides JWT-based authentication with refresh tokens, protected routes, and user management capabilities.

## ⚡ Quick Start

### How to Run Backend? (FIRST)
Run the following in a cmd line:
```bash
cd c:\Users\kavin\OneDrive\Desktop\chrypy\login
python -m venv venv
venv\Scripts\activate
pip install "fastapi<0.100" "pydantic<2" "uvicorn[standard]" python-dotenv
uvicorn backend.main:app --reload
```
**YOU SHOULD SEE:** Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)

### How to Run Frontend? (Second)
Run the following in another (new) cmd line:
```bash
cd c:\Users\kavin\OneDrive\Desktop\chrypy\login\react-framework-with-vite
npm install
npm run dev
```
**YOU SHOULD SEE:**
```
VITE v4.x ready in XXX ms
➜ Local: http://localhost:5173/
➜ Network: use --host to expose
➜ press h to show help
```

---

## ✨ Features

- 🔐 JWT-based authentication
- 🔄 Refresh token rotation
- 🔒 Protected API endpoints
- 👤 User management (CRUD operations)
- 🚀 Modern React frontend with Vite
- 🔄 CORS support
- 🔄 Session management with token blacklisting
- 🔑 Secure password hashing with bcrypt

## 🛠️ Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- SQLite (included with Python)

## 🏗️ Project Structure

```
chrypy/
├── login/                      # Main application directory
│   ├── __pycache__/            # Python bytecode cache
│   ├── react-framework-with-vite/  # Frontend React application
│   │   ├── public/             # Static files
│   │   └── src/                # React source files
│   │       ├── components/      # Reusable React components
│   │       ├── App.jsx         # Main App component
│   │       └── main.jsx        # Entry point
│   ├── main.py                # FastAPI application
│   └── migrate.py             # Database migration script
├── .env                       # Environment variables
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## 🛠️ Built With

- **Backend**
  - [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework
  - [SQLAlchemy](https://www.sqlalchemy.org/) - SQL toolkit and ORM
  - [Python-JOSE](https://python-jose.readthedocs.io/) - JWT implementation
  - [Passlib](https://passlib.readthedocs.io/) - Password hashing

- **Frontend**
  - [React](https://reactjs.org/) - JavaScript library for building UIs
  - [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
  - [React Router](https://reactrouter.com/) - Declarative routing

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FastAPI community for the amazing framework
- Vite for the lightning-fast development experience
- All open-source contributors whose work made this project possible

## 🏗️ Development Notes

--reload flag in backend ensures auto-restart on code changes.

Vite’s dev server supports hot reloading for frontend changes.

For production:

Backend can be deployed with Uvicorn + Gunicorn or Docker.

Frontend can be built using npm run build and served via Nginx/Apache.