# IITGN Discussion Forum - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Usage Guide](#usage-guide)
6. [API Reference](#api-reference)
7. [Configuration](#configuration)
8. [Development](#development)
9. [Troubleshooting](#troubleshooting)

---

## Overview

An AI-powered discussion platform for IIT Gandhinagar that:
- Automatically generates discussion topics from course PDFs
- Enables student-to-student discussions
- Provides on-demand AI assistance via @AI mentions
- Supports role-based features for teachers and students

**Tech Stack**: React, FastAPI, SQLite, Ollama (local LLM)

---

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Ollama installed

### Installation (5 minutes)

**1. Install Ollama & Model**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.1:8b
```

**2. Start Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
→ http://localhost:8000

**3. Start Frontend**
```bash
cd frontend
npm install
npm run dev
```
→ http://localhost:5173

### First Use

1. Open http://localhost:5173
2. **Teacher**: Login with name `Teacher`
3. **Students**: Click "Create New Account"
4. Upload a PDF and start discussing!

---

## Features

### Core Features
- ✅ **Simple Authentication**: Name-only login (no passwords)
- ✅ **Role-Based Access**: Different features for teachers vs students
- ✅ **Auto Topic Generation**: AI extracts 2-6 concise topics from PDFs
- ✅ **Discussion Mode**: Users chat freely, AI helps when mentioned
- ✅ **@AI System**: Type `@AI` to get intelligent assistance
- ✅ **Markdown Rendering**: Beautiful formatted AI responses
- ✅ **Context-Aware AI**: Considers thread topic + conversation history
- ✅ **Teacher Dashboard**: Analytics and engagement metrics

### AI Capabilities

**For Students** (AI TA):
- Answer questions using course material
- Explain concepts clearly
- Provide examples and clarifications

**For Teachers** (AI Assistant):
- Create quizzes with answer keys
- Generate summaries and study guides
- Suggest assignments
- Explain concepts different ways

---

## Architecture

### System Components

```
Frontend (React) → Backend (FastAPI) → Ollama (LLM)
                              ↓
                         SQLite DB
```

### Project Structure

```
iitgn-discussion-forum/
├── README.md                   # Main documentation
├── QUICKSTART.md               # 5-minute setup guide
├── DOCUMENTATION.md            # This file
│
├── backend/
│   ├── main.py                # API endpoints
│   ├── database.py            # Database operations
│   ├── llm_service.py         # AI logic
│   ├── prompts.py             # Modular prompts
│   ├── pdf_processor.py       # PDF handling
│   ├── requirements.txt       # Dependencies
│   ├── setup.sh               # Setup script
│   └── run.sh                 # Run script
│
└── frontend/
    ├── src/
    │   ├── components/        # React components
    │   ├── context/           # Auth context
    │   ├── App.jsx            # Main app
    │   └── api.js             # API client
    ├── package.json
    └── vite.config.js
```

### Database Schema

**users**: id, name, role, created_at  
**courses**: id, name, pdf_text, created_at  
**threads**: id, course_id, title, topic, created_at  
**messages**: id, thread_id, user_id, sender_type, content, created_at  

---

## Usage Guide

### Teacher Workflow

**1. Upload Lecture**
```
Login → Upload Lecture → Select PDF → Wait 10-30s → Done
```
AI extracts 2-6 topics and creates discussion threads.

**2. Monitor Activity**
```
Dashboard → View stats → Click threads to read discussions
```

**3. Get AI Help**
```
In any thread: "@AI create a 5-question quiz on this topic"
```

### Student Workflow

**1. Browse & Discuss**
```
Login → Select lecture → Choose thread → Discuss with peers
```

**2. Get AI Help When Needed**
```
Type: "@AI can you explain X?"
AI responds with detailed answer
```

**3. Continue Discussion**
```
React to AI answer
Ask follow-ups with @AI
Help other students
```

### The @AI System

**Regular Messages** (instant):
```
"Has anyone solved this?"
"I think the answer is B"
"Great explanation!"
```

**AI-Assisted Messages** (5-30s response):
```
"@AI what is the formula?"
"Can someone help? @AI explain this"
"@AI summarize the key points"
```

---

## API Reference

### Authentication

**Login**
```http
POST /api/auth/login
Body: { "name": "Teacher" }
Response: { "success": true, "user": {...} }
```

**Signup** 
```http
POST /api/auth/signup
Body: { "name": "Rahul" }
Response: { "success": true, "user": {...} }
```

### Content

**Upload PDF**
```http
POST /api/courses/upload
Content-Type: multipart/form-data
Body: file (PDF)
Response: { "course_id": 1, "topics": [...] }
```

**List Lectures**
```http
GET /api/lectures
Response: { "lectures": [{id, name, created_at, thread_count}] }
```

**Get Threads**
```http
GET /api/courses/{id}/threads
Response: { "threads": [...] }
```

**Get Messages**
```http
GET /api/threads/{id}/messages
Response: { "messages": [...] }
```

**Post Message**
```http
POST /api/threads/{id}/ask
Body: { "question": "...", "user_id": 1 }
Response: { 
  "success": true,
  "ai_responded": false,  # true if @AI mentioned
  "messages": [...]
}
```

**Dashboard**
```http
GET /api/dashboard
Response: { "total_threads": 10, "total_questions": 25, ... }
```

---

## Configuration

### Backend Settings

**File**: `backend/prompts.py`
```python
# Adjust AI triggers
AI_TRIGGERS = ['@ai', '@help', '@assistant']

# Context limits
MAX_COURSE_TEXT_LENGTH = 20000
MAX_HISTORY_MESSAGES = 5
MAX_TOTAL_PROMPT_LENGTH = 30000
```

**File**: `backend/llm_service.py`
```python
# backend/llm_service.py
DEFAULT_MODEL = "llama3.1:8b"  # Current (recommended)
# For faster responses: "llama3.2:1b"
# For best quality: "llama3.1:70b"
```

**File**: `backend/main.py`
```python
# CORS origins (line 18)
allow_origins=["http://localhost:5173"]
```

### Frontend Settings

**File**: `frontend/src/api.js`
```javascript
// Backend URL
const API_BASE_URL = 'http://localhost:8000';

// Request timeout
timeout: 60000  // 60 seconds
```

---

## Development

### Running Tests

**Backend Module Tests**:
```bash
cd backend
source venv/bin/activate
python -c "import llm_service; print('✅ OK')"
```

**API Tests**:
```bash
# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Teacher"}'

# Test @AI detection
curl -X POST http://localhost:8000/api/threads/1/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"@AI help", "user_id":1}'
```

### Code Structure

**Backend Modularity**:
- `main.py`: API routes only
- `database.py`: All DB operations
- `llm_service.py`: AI logic (uses prompts.py)
- `prompts.py`: All prompts centralized
- `pdf_processor.py`: PDF handling only

**Frontend Modularity**:
- `components/`: UI components
- `context/`: State management
- `api.js`: All API calls
- `App.jsx`: Routing only

### Adding New Features

**New AI Capability**:
1. Add prompt to `backend/prompts.py`
2. Add function to `backend/llm_service.py`
3. Call from appropriate endpoint in `main.py`

**New UI Component**:
1. Create in `frontend/src/components/`
2. Add route in `App.jsx`
3. Add API call in `api.js` if needed

---

## Troubleshooting

### Common Issues

**"Cannot connect to Ollama"**
```bash
ollama serve  # Start Ollama
ollama list   # Verify model installed
```

**"User not found"**
- Teacher: Use exact name `Teacher` (case-sensitive)
- Students: Create account first via signup

**"Failed to send question" / Timeout**
- Check backend is running
- AI can take 15-30 seconds (be patient)
- Check backend terminal for errors

**"Topics not generating properly"**
- Ensure Ollama model is downloaded
- Check PDF has extractable text (not scanned images)
- Try restarting backend

**Frontend won't start**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Backend won't start**
```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Debug Mode

**Backend Logging**:
- Check terminal where `python main.py` is running
- Look for 💬, 🤖, ✅, ❌ emoji indicators

**Frontend Logging**:
- Open browser console (F12)
- Look for API call logs
- Check Network tab for failed requests

### Performance Tips

**Change AI Model**:
```bash
# For faster responses (current: llama3.1:8b)
ollama pull llama3.2:1b
# Edit backend/llm_service.py: DEFAULT_MODEL = "llama3.2:1b"

# For best quality (slower)
ollama pull llama3.1:70b
# Edit backend/llm_service.py: DEFAULT_MODEL = "llama3.1:70b"
```

---

## Advanced Topics

### Customizing Prompts

All prompts are in `backend/prompts.py`. Edit them to:
- Change AI personality
- Adjust response length
- Modify instruction style
- Add domain-specific guidance

### Database Management

**View Data**:
```bash
cd backend
sqlite3 data.db
```

```sql
-- List all users
SELECT * FROM users;

-- Count messages per thread
SELECT thread_id, COUNT(*) FROM messages GROUP BY thread_id;

-- Find most active students
SELECT u.name, COUNT(m.id) as message_count 
FROM users u 
JOIN messages m ON u.id = m.user_id 
GROUP BY u.id 
ORDER BY message_count DESC;
```

**Backup**:
```bash
cp backend/data.db backend/data.db.backup
```

### Security Considerations

Current implementation:
- Name-only auth (no passwords)
- Local-only (no network exposure)
- All data stored locally

For production:
- Add password authentication
- Implement JWT tokens
- Add rate limiting
- Use HTTPS
- Deploy with proper security

---

## Support

### Getting Help

1. Check this documentation
2. Review QUICKSTART.md for setup issues
3. Check browser console (F12) for frontend errors
4. Check backend terminal for server logs

### Common Questions

**Q: Can multiple teachers use this?**
A: Currently designed for single teacher. Extend users table for multi-teacher support.

**Q: How do I change the AI model?**
A: Edit `DEFAULT_MODEL` in `backend/llm_service.py`

**Q: Can I use this without internet?**
A: Yes! After initial Ollama model download, everything runs locally.

**Q: How do I reset the database?**
A: Delete `backend/data.db` and restart backend (auto-recreates)

---

## License & Credits

Educational project for IIT Gandhinagar

**Built with**: Ollama • FastAPI • React • Tailwind CSS

**Version**: 2.1.0  
**Last Updated**: November 2024

---

**For quick setup, see [QUICKSTART.md](QUICKSTART.md)**  
**For code documentation, see inline comments in source files**

