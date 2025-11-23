# ⚡ QUICKSTART - Get Running in 5 Minutes!

## Prerequisites
- Python 3.8+ installed ✅
- Node.js 16+ installed ✅

## 1️⃣ Install Ollama & Model (2 minutes)

```bash
# Install Ollama (macOS/Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the model (recommended)
ollama pull llama3.1:8b

# Alternative: Faster but lower quality
# ollama pull llama3.2:1b
```

## 2️⃣ Start Backend (1 minute)

**Terminal 1:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

✅ Backend running at http://localhost:8000

## 3️⃣ Start Frontend (1 minute)

**Terminal 2:**
```bash
cd frontend
npm install
npm run dev
```

✅ Frontend running at http://localhost:5173

## 4️⃣ Use the App! (1 minute)

### Login
1. Open http://localhost:5173
2. **Teacher**: Enter name `Teacher` and click Login
3. **Students**: Click "Create New Account" and enter your name

### Upload Lecture (Teacher Only)
1. Click "Upload Lecture" button
2. Select a PDF file
3. Wait 10-30 seconds for AI processing
4. Lecture appears on homepage with discussion topics

### Ask Questions
1. Click on any lecture
2. Click on a discussion thread
3. Type your question
4. AI responds in 5-30 seconds with formatted answer

---

## 🎯 Quick Test

Upload a sample PDF or use this test:

1. Login as "Teacher"
2. Upload any PDF (lecture notes, textbook chapter, etc.)
3. Go back to Home
4. Click the lecture → Click a thread
5. Ask: "What are the main points?"
6. Watch AI respond with markdown-formatted answer!

---

## 🐛 Quick Fixes

### Backend not responding?
```bash
# Make sure Ollama is running
ollama serve

# Restart backend
cd backend
source venv/bin/activate
python main.py
```

### Can't login?
- **Teacher**: Use name `Teacher` (case-sensitive)
- **Students**: Create account first via "Sign Up"

### Port already in use?
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

---

## ✨ Key Features

- **Simple Login**: Just enter your name (no passwords!)
- **Role-Based AI**: TA for students, Assistant for teachers
- **Markdown Responses**: Formatted lists, bold text, code blocks
- **Short Topics**: AI generates 2-6 word topic names
- **Context-Aware**: AI remembers last 5 messages
- **Student Names**: See who asked what

---

**That's it! You're ready to go! 🚀**

For detailed documentation, see [README.md](README.md)
