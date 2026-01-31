# 🔧 Troubleshooting Guide

## Issue: Network Error / Backend Not Running

### Problem
Getting "Network Error" when trying to process video from React frontend.

### Solution 1: Start Backend Manually

**Open a new terminal and run:**
```bash
cd D:\desktop-top\Intent_search_Cine_Ai
uvicorn app:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Solution 2: PyTorch DLL Error (Windows)

If you see this error:
```
OSError: [WinError 1114] A dynamic link library (DLL) initialization routine failed
```

**Fix:**
1. Install Visual C++ Redistributables:
   - Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
   - Install it
   - Restart computer

2. Or reinstall PyTorch (CPU version):
   ```bash
   pip uninstall torch
   pip install torch --index-url https://download.pytorch.org/whl/cpu
   ```

### Solution 3: Check Backend is Running

**Test in browser or terminal:**
```bash
# Should return JSON with status
curl http://localhost:8000/process-status
```

**Or open in browser:**
http://localhost:8000/docs (FastAPI docs)

### Solution 4: Check CORS

Make sure CORS in `app.py` includes:
```python
allow_origins=[
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]
```

### Solution 5: Check Ports

**Backend should be on:** http://localhost:8000
**Frontend should be on:** http://localhost:5500

**Check if ports are in use:**
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :5500
```

---

## Quick Fix Commands

### Start Backend
```bash
cd D:\desktop-top\Intent_search_Cine_Ai
uvicorn app:app --reload
```

### Start Frontend (separate terminal)
```bash
cd D:\desktop-top\Intent_search_Cine_Ai\frontend
npm run dev
```

### Test Backend
```bash
curl http://localhost:8000/process-status
```

---

## Common Errors

### "ModuleNotFoundError: No module named 'fastapi'"
**Fix:** `pip install -r requirements.txt`

### "Cannot connect to backend"
**Fix:** Make sure backend is running on port 8000

### "CORS error"
**Fix:** Check CORS settings in `app.py`

### "PyTorch DLL error"
**Fix:** Install Visual C++ Redistributables or reinstall PyTorch

---

## Verification Steps

1. ✅ Backend running: http://localhost:8000/docs
2. ✅ Frontend running: http://localhost:5500
3. ✅ No console errors in browser
4. ✅ Backend logs show requests

---

## Still Having Issues?

1. Check backend terminal for error messages
2. Check browser console (F12) for errors
3. Verify both servers are running
4. Check firewall isn't blocking ports

