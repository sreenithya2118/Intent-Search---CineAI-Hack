# 🚨 Quick Fix: Network Error

## Problem
Getting "Network Error" when trying to process video from React frontend.

## Immediate Solution

### Step 1: Start Backend Server

**Open a NEW terminal/command prompt and run:**

```bash
cd D:\desktop-top\Intent_search_Cine_Ai
uvicorn app:app --reload
```

**OR double-click:** `START_BACKEND_FIXED.bat`

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Step 2: Verify Backend is Running

**Open browser and go to:**
http://localhost:8000/docs

**OR test in terminal:**
```bash
curl http://localhost:8000/process-status
```

**Should return:** `{"state":"idle","message":""}`

### Step 3: Start Frontend (if not already running)

**In another terminal:**
```bash
cd D:\desktop-top\Intent_search_Cine_Ai\frontend
npm run dev
```

### Step 4: Test in Browser

1. Open: http://localhost:5500
2. Try loading a video
3. Should work now!

---

## If Backend Won't Start

### PyTorch DLL Error

If you see:
```
OSError: [WinError 1114] A dynamic link library (DLL) initialization routine failed
```

**Quick Fix:**
```bash
# Reinstall PyTorch (CPU version - more stable on Windows)
pip uninstall torch
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

**OR install Visual C++ Redistributables:**
- Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
- Install and restart

---

## Verification Checklist

- [ ] Backend terminal shows "Uvicorn running on http://127.0.0.1:8000"
- [ ] Can access http://localhost:8000/docs in browser
- [ ] Frontend is running on http://localhost:5500
- [ ] No errors in backend terminal
- [ ] No CORS errors in browser console (F12)

---

## Still Not Working?

1. **Check if backend is actually running:**
   ```bash
   netstat -ano | findstr :8000
   ```
   Should show a process listening on port 8000

2. **Check backend logs** for error messages

3. **Check browser console** (F12) for specific error

4. **Try accessing backend directly:**
   http://localhost:8000/process-status

---

## Summary

**The network error means the backend isn't running!**

**Solution:** Start the backend server:
```bash
uvicorn app:app --reload
```

Then try your request again from the frontend! 🚀

