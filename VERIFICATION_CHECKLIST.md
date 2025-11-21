# ✅ Setup Verification Checklist

Use this checklist to ensure everything is properly configured before running the application.

## Pre-Installation Checks

- [ ] **Python 3.8+** installed
  ```bash
  python3 --version
  # Should show: Python 3.8.x or higher
  ```

- [ ] **Node.js 16+** installed
  ```bash
  node --version
  # Should show: v16.x.x or higher
  ```

- [ ] **npm** installed
  ```bash
  npm --version
  # Should show: 7.x.x or higher
  ```

- [ ] **Ollama** installed
  ```bash
  ollama --version
  # Should show version information
  ```

## Ollama Setup

- [ ] **Ollama service running**
  ```bash
  ollama serve &
  # Or check if already running
  curl http://localhost:11434
  ```

- [ ] **llama3.1:8b model downloaded**
  ```bash
  ollama list
  # Should show llama3.1:8b in the list
  ```

- [ ] **Test model works**
  ```bash
  ollama run llama3.1:8b "Hello"
  # Should respond with a greeting
  ```

## Backend Setup

- [ ] **Virtual environment created**
  ```bash
  cd backend
  ls venv/
  # Should show bin/ (or Scripts/ on Windows) directory
  ```

- [ ] **Dependencies installed**
  ```bash
  source venv/bin/activate  # Windows: venv\Scripts\activate
  pip list | grep fastapi
  # Should show fastapi and other packages
  ```

- [ ] **Backend starts successfully**
  ```bash
  python main.py
  # Should show: "Server ready at http://localhost:8000"
  ```

- [ ] **Backend health check**
  Open browser: http://localhost:8000
  ```json
  Should see: {
    "status": "ok",
    "message": "IITGN Discussion Forum API is running"
  }
  ```

- [ ] **API docs accessible**
  Open browser: http://localhost:8000/docs
  Should see FastAPI Swagger UI

## Frontend Setup

- [ ] **Dependencies installed**
  ```bash
  cd frontend
  ls node_modules/
  # Should show many packages
  ```

- [ ] **Frontend starts successfully**
  ```bash
  npm run dev
  # Should show: "Local: http://localhost:5173"
  ```

- [ ] **Frontend loads in browser**
  Open browser: http://localhost:5173
  Should see "IITGN Discussion Forum" upload page

## Connectivity Tests

- [ ] **Frontend → Backend connection**
  - Open http://localhost:5173
  - Open browser console (F12)
  - No CORS errors should appear

- [ ] **Backend → Ollama connection**
  ```bash
  # With backend running, check logs
  # Should not see "Cannot connect to Ollama" errors
  ```

## Functionality Tests

- [ ] **File upload works**
  - Create a simple PDF file
  - Upload via frontend
  - Should process without errors

- [ ] **Topics extracted**
  - After upload, should see 5-10 topics
  - Threads should be created

- [ ] **Chat interface works**
  - Click on a thread
  - Type a question
  - Should receive AI response

- [ ] **Dashboard displays**
  - Click "Dashboard" button
  - Should see statistics
  - Numbers should be accurate

## Port Availability

- [ ] **Port 8000 is free** (for backend)
  ```bash
  lsof -i :8000
  # Should show nothing or only your backend
  ```

- [ ] **Port 5173 is free** (for frontend)
  ```bash
  lsof -i :5173
  # Should show nothing or only your Vite dev server
  ```

- [ ] **Port 11434 is free** (for Ollama)
  ```bash
  lsof -i :11434
  # Should show Ollama process
  ```

## File System Checks

- [ ] **All required files exist**
  ```bash
  # From project root
  ls backend/main.py
  ls frontend/package.json
  ls README.md
  # All should exist
  ```

- [ ] **Scripts are executable**
  ```bash
  ls -l backend/*.sh
  # Should show -rwxr-xr-x (executable permissions)
  ```

- [ ] **Database will be created**
  ```bash
  # After first upload, this should exist:
  ls backend/data.db
  ```

## Browser Requirements

- [ ] **Modern browser** (Chrome, Firefox, Safari, Edge)
- [ ] **JavaScript enabled**
- [ ] **Cookies/LocalStorage enabled**
- [ ] **Pop-up blocker not interfering**

## Common Issues Resolved

- [ ] No "Python not found" errors
- [ ] No "Module not found" errors
- [ ] No "Command not found: npm" errors
- [ ] No CORS errors in browser console
- [ ] No "Connection refused" errors
- [ ] No "Port already in use" errors

---

## 🎯 All Checks Passed?

If you've checked all the boxes above, you're ready to go! 🚀

### Start the application:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Browser:**
```
http://localhost:5173
```

---

## ❌ Something Not Working?

### Quick Fixes:

1. **Restart Ollama:**
   ```bash
   pkill ollama
   ollama serve
   ```

2. **Recreate virtual environment:**
   ```bash
   cd backend
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Reinstall frontend dependencies:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Check firewall/antivirus:**
   - Allow Python, Node, and Ollama through firewall
   - Temporarily disable antivirus if blocking local connections

5. **Use different ports:**
   - Edit `backend/main.py` line 91: change port
   - Edit `frontend/vite.config.js` line 6: change port
   - Edit `frontend/src/api.js` line 3: update backend URL

---

## 📞 Still Having Issues?

Consult these docs:
- [README.md](README.md) - Full documentation
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup
- [QUICKSTART.md](QUICKSTART.md) - Quick setup
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Architecture overview

Check logs:
- Backend: Terminal output where `python main.py` is running
- Frontend: Browser console (F12)
- Ollama: Terminal output where `ollama serve` is running

---

**Good luck! 🍀**

