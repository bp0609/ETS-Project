# 🎓 IITGN Discussion Forum

AI-powered discussion platform for IIT Gandhinagar courses with intelligent topic generation and on-demand AI assistance.

## ⚡ Quick Start

```bash
# 1. Install Ollama & Model
ollama pull llama3.1:8b

# 2. Start Backend (Terminal 1)
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python main.py

# 3. Start Frontend (Terminal 2)
cd frontend && npm install && npm run dev

# 4. Open Browser
open http://localhost:5173
```

**Login**: Teacher account = `Teacher` | Students = Create account

---

## ✨ Key Features

### 🎭 Role-Based Platform
- **Students**: Discuss with peers, get AI TA help  
- **Teachers**: Upload lectures, access dashboard, get AI Assistant help

### 💬 Discussion Mode
- Chat freely with classmates
- Mention `@AI` when you need help
- AI responds only when asked

### 🤖 Smart AI
- **Topic Generation**: Automatically creates 2-6 discussion topics
- **Context-Aware**: Remembers thread topic + last 5 messages
- **Role-Adaptive**: Acts as TA for students, Assistant for teachers
- **Markdown Formatting**: Returns beautifully formatted responses

### 📊 Teacher Tools
- Upload lecture PDFs
- View engagement analytics
- AI-powered quiz generation
- Student activity monitoring

---

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Complete guide with API reference, configuration, troubleshooting
- **[frontend/README.md](frontend/README.md)** - Frontend-specific docs

---

## 🎯 Usage

### Regular Discussion
```
Student A: Has anyone solved problem 3?
Student B: I think it's option C
Student A: Same! Let's verify together
```
→ Messages post instantly

### With AI Help
```
Student: @AI what's the formula for X?
```
→ AI TA responds with detailed explanation

```
Teacher: @AI create a 10-question quiz
```
→ AI Assistant generates quiz with answers

---

## 🏗️ Tech Stack

**Backend**: Python, FastAPI, SQLite, pdfplumber  
**Frontend**: React, Vite, Tailwind CSS, react-markdown  
**AI**: Ollama (llama3.1:8b - fast & high quality)  

---

## 🛠️ Configuration

### Change AI Model
```python
# backend/llm_service.py
DEFAULT_MODEL = "llama3.1:8b"  # Current (recommended)
# Or for faster but lower quality:
# DEFAULT_MODEL = "llama3.2:1b"
```

### Adjust @AI Triggers
```python
# backend/prompts.py
AI_TRIGGERS = ['@ai', '@help', '@assistant']
```

### Modify Prompts
Edit `backend/prompts.py` - all prompts are centralized there

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Ollama not connecting | `ollama serve` |
| Can't login as Teacher | Use exact name: `Teacher` |
| AI not responding | Check if @AI mentioned in message |
| Timeout errors | Backend running? Check port 8000 |
| Frontend errors | `npm install` and restart |

**For detailed help**: See [DOCUMENTATION.md](DOCUMENTATION.md#troubleshooting)

---

## 📦 Project Info

**Purpose**: Centralize course discussions with AI assistance  
**Target**: IIT Gandhinagar courses  
**Status**: Production-ready MVP  
**License**: Educational use  

---

**Built with ❤️ for IIT Gandhinagar**

*Quick setup? → [QUICKSTART.md](QUICKSTART.md)*  
*Complete guide? → [DOCUMENTATION.md](DOCUMENTATION.md)*
