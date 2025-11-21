# ⚡ QUICKSTART - Get Running in 5 Minutes!

## Prerequisites
- Python 3.8+ installed ✅
- Node.js 16+ installed ✅
- Ollama installed ✅

## 1️⃣ Install Ollama Model (3-5 minutes)

```bash
ollama pull llama3.1:8b
```

## 2️⃣ Start Backend (2 minutes)

Terminal 1:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

✅ Backend running at http://localhost:8000

## 3️⃣ Start Frontend (2 minutes)

Terminal 2:
```bash
cd frontend
npm install
npm run dev
```

✅ Frontend running at http://localhost:5173

## 4️⃣ Test It!

1. Open http://localhost:5173
2. Upload any PDF (course notes, lecture slides)
3. Wait 10-30 seconds
4. Click a thread and ask a question!

---

## 📁 Project Structure

```
iitgn-discussion-forum/
├── backend/           # FastAPI + Ollama + SQLite
│   ├── main.py       # API endpoints
│   ├── database.py   # Database operations
│   ├── llm_service.py # AI integration
│   └── pdf_processor.py # PDF extraction
└── frontend/         # React + Tailwind
    └── src/
        └── components/
            ├── UploadPage.jsx
            ├── ThreadsList.jsx
            ├── ThreadChat.jsx
            └── Dashboard.jsx
```

## 🎯 Key Features

✨ Upload PDF → AI extracts topics → Auto-creates threads
💬 Students ask questions → AI answers from course material
📊 Teacher dashboard shows all activity

## 🐛 Troubleshooting

**Ollama not connecting?**
```bash
ollama serve
```

**Port already in use?**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**Dependencies issue?**
```bash
# Backend
cd backend && pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

---

**That's it! You're ready to go! 🚀**

For detailed documentation, see [README.md](README.md)

