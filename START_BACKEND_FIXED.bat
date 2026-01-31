@echo off
echo ========================================
echo Starting Backend Server
echo ========================================
echo.
echo Make sure you're in the project directory!
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Starting FastAPI server...
echo.
echo If you see PyTorch DLL errors, you may need to:
echo 1. Install Visual C++ Redistributables
echo 2. Or reinstall PyTorch: pip install torch --index-url https://download.pytorch.org/whl/cpu
echo.
pause
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000

