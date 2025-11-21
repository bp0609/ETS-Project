# 🚀 Quick Setup Guide - IITGN Discussion Forum

Follow these steps to get the platform running in under 10 minutes!

## ✅ Prerequisites Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Ollama installed

## Step 1: Install Ollama (5 minutes)

### macOS / Linux:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Windows:
Download and install from https://ollama.ai/download

### Pull the model:
```bash
ollama pull llama3.1:8b
```

### Verify:
```bash
ollama list
# You should see llama3.1:8b in the list
```

## Step 2: Setup Backend (2 minutes)

```bash
# Navigate to backend
cd iitgn-discussion-forum/backend

# Run setup script (macOS/Linux)
chmod +x setup.sh
./setup.sh

# OR manually:
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start the server
python main.py
```

**✅ Backend ready at:** http://localhost:8000

## Step 3: Setup Frontend (2 minutes)

Open a NEW terminal:

```bash
# Navigate to frontend
cd iitgn-discussion-forum/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**✅ Frontend ready at:** http://localhost:5173

## Step 4: Test the System (1 minute)

1. Open http://localhost:5173 in your browser
2. Upload a sample PDF (lecture notes, slides, etc.)
3. Wait 10-30 seconds for processing
4. Click on a thread and ask a question!

## 🎯 Quick Test

Don't have a PDF? Create a simple test file:

1. Open any text editor
2. Write some course content:
   ```
   Introduction to Computer Networks
   
   The OSI Model has 7 layers: Physical, Data Link, Network, Transport, 
   Session, Presentation, and Application.
   
   TCP is connection-oriented while UDP is connectionless.
   UDP is faster but less reliable than TCP.
   ```
3. Save as PDF
4. Upload to the platform

## 🐛 Common Issues

### "Cannot connect to Ollama"
```bash
# Start Ollama
ollama serve
```

### "Port 8000 already in use"
```bash
# Kill the process on port 8000
# macOS/Linux:
lsof -ti:8000 | xargs kill -9
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### "Module not found"
```bash
# Backend:
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend:
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📊 Architecture Overview

```
┌─────────────┐      ┌─────────────┐      ┌──────────┐
│   Browser   │─────▶│  Frontend   │─────▶│ Backend  │
│  (Port 5173)│      │   (React)   │      │ (FastAPI)│
└─────────────┘      └─────────────┘      └─────┬────┘
                                                  │
                                                  ▼
                                           ┌─────────────┐
                                           │   Ollama    │
                                           │  (LLM API)  │
                                           └─────────────┘
                                                  │
                                                  ▼
                                           ┌─────────────┐
                                           │   SQLite    │
                                           │ (Database)  │
                                           └─────────────┘
```

## 🎓 What Happens When You Upload a PDF?

1. **Upload** → Frontend sends PDF to backend
2. **Extract** → Backend extracts text using pdfplumber
3. **Analyze** → Ollama LLM analyzes content and extracts topics
4. **Create** → Backend creates discussion threads for each topic
5. **Display** → Frontend shows all threads
6. **Interact** → Students ask questions, AI answers using course content

## 🚀 You're Ready!

Everything should be working now. Head to http://localhost:5173 and start exploring!

Need help? Check the main README.md for detailed documentation.

