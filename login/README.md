# Chyrp Lite - Authentication System

A full-stack authentication system with FastAPI backend and React frontend.

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- SQLite (included in Python)

## Backend Setup

1. Navigate to the project directory:
   ```bash
   cd c:\Users\kavin\OneDrive\Desktop\chrypy
   ```

2. Install Python dependencies directly (no need for requirements.txt):
   ```bash
   pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv pydantic==1.10.13
   ```

3. Navigate to the login directory:
   ```bash
   cd login
   ```

4. Set up environment variables:
   Create a `.env` file in the login directory with:
   ```
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=15
   REFRESH_TOKEN_EXPIRE_DAYS=7
   ```

5. Run database migrations:
   ```bash
   python migrate.py
   ```

6. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd react-framework-with-vite
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Install additional required packages:
   ```bash
   npm install axios
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## API Endpoints

- `POST /users/` - Create a new user (sign up)
- `POST /token` - Login and get access token
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout and invalidate token
- `GET /users/` - List all users (protected)
- `GET /users/{user_id}` - Get user by ID (protected)

## Environment Variables

### Backend (`.env`)
- `SECRET_KEY`: Secret key for JWT token signing
- `ALGORITHM`: Algorithm for JWT (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Access token expiration in minutes
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration in days

## Troubleshooting

1. **Port already in use**:
   - Make sure no other application is using ports 8000 (backend) or 5173 (frontend)
   - You can change the ports in the respective configuration files if needed

2. **Database issues**:
   - Make sure the SQLite database file has write permissions
   - Delete the database file and re-run migrations if needed

3. **CORS issues**:
   - The backend is configured to allow requests from `http://localhost:5173`
   - If you change the frontend port, update the CORS configuration in `main.py`

## Project Structure

```
login/
├── main.py                # FastAPI application
├── migrate.py            # Database migrations
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables
└── react-framework-with-vite/  # Frontend React application
    ├── src/
    │   ├── App.jsx       # Main application component
    │   ├── main.jsx      # Entry point
    │   └── ...
    └── package.json      # Frontend dependencies
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
