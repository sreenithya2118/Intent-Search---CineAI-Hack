# 🚀 Server Status

## How to Check if Servers are Running

### Backend (FastAPI)
**URL:** http://localhost:8000
**Docs:** http://localhost:8000/docs
**Status:** http://localhost:8000/process-status

### Frontend (React + Vite)
**URL:** http://localhost:5500

---

## Quick Commands

### Start Backend
```bash
uvicorn app:app --reload
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Check Status
- Backend: http://localhost:8000/docs
- Frontend: http://localhost:5500

---

## If Servers Don't Start

1. **Check if ports are free:**
   ```bash
   netstat -ano | findstr :8000
   netstat -ano | findstr :5500
   ```

2. **Kill processes if needed:**
   ```bash
   taskkill /PID <process_id> /F
   ```

3. **Check for errors in terminal output**

---

## Next Steps

1. ✅ Backend running on port 8000
2. ✅ Frontend running on port 5500
3. 🌐 Open http://localhost:5500 in browser
4. 🎬 Load a video and test search!

