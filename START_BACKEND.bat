@echo off
echo ========================================
echo Starting Backend Server
echo ========================================
echo.
echo Starting FastAPI server on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
uvicorn app:app --reload

