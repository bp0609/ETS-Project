# 🎓 IITGN Classroom - Polling & Discussion Platform

A modern classroom interface with announcements, topic polling, peer discovery, and AI-powered discussion threads.

---

## 🌟 Key Features

### For Teachers
- 📢 **Create Announcements** - Post updates with or without PDF attachments
- 📊 **View Poll Results** - See how many students understand each topic
- 📈 **Analytics Dashboard** - Monitor class engagement and participation
- 💬 **Participate in Discussions** - Join threads and use @AI for assistance

### For Students
- 📚 **View Announcements** - Stay updated with class materials
- ✅ **Vote on Understanding** - Indicate your comprehension level for each topic
- 👥 **Find Study Partners** - Connect with students who understand topics completely
- 💬 **Discuss & Learn** - Chat with classmates and get AI TA help with @AI

### AI Features
- 🤖 **Auto Topic Generation** - AI extracts topics from uploaded PDFs
- 🧠 **Context-Aware Responses** - AI remembers conversation history
- 👨‍🏫 **Role-Based AI** - TA for students, Assistant for teachers
- ✨ **Markdown Formatting** - Beautiful formatted responses

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Ollama (for AI features)

### 1. Install Ollama & Model
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull AI model
ollama pull llama3.1:8b
```

### 2. Start Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
✅ Backend running at http://localhost:8000

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend running at http://localhost:5173

### 4. Access Application
Open http://localhost:5173 in your browser

**Teacher Login:** Name = `Teacher`  
**Student Login:** Create new account with any name

---

## 📖 How to Use

### Teacher Workflow

**1. Create Announcement**
- Click "New Post" button
- Enter title and content
- Optionally upload PDF:
  - AI will extract 2-6 topics
  - Discussion threads auto-created
  - PDF viewable/downloadable in announcement

**2. View Poll Results**
- Check polling sidebar on right
- See student understanding levels:
  - ✅ Complete (green)
  - ⚠️ Partial (yellow)
  - ❌ None (red)

**3. Access Analytics**
- Click "Analytics" button
- View engagement metrics
- See most/least active topics
- Monitor participation rates

**4. Join Discussions**
- Click "Thread" button on any topic
- Post messages like students
- Use @AI for assistance (quiz generation, summaries, etc.)

### Student Workflow

**1. View Announcements**
- See all teacher posts on homepage
- Click "View" to open PDFs in browser
- Click "Download" to save PDFs

**2. Vote on Understanding**
- Use polling sidebar (right side)
- Click icon buttons for each topic:
  - ✅ = I understand completely
  - ⚠️ = I partially understand
  - ❌ = I didn't understand
- Change vote anytime

**3. Find Study Partners**
- Click "Help" button on any topic
- See students who marked "Complete"
- Reach out for peer tutoring

**4. Join Discussions**
- Click "Thread" button on any topic
- Chat with classmates
- Mention @AI to get AI TA help
- Example: "@AI can you explain this concept?"

---

## 🏗️ Architecture

### Tech Stack
- **Backend**: Python, FastAPI, SQLite
- **Frontend**: React, Vite, Tailwind CSS
- **AI**: Ollama (llama3.1:8b)
- **PDF Processing**: pdfplumber

### Database Schema

**users**
- id, name, role (student/teacher), created_at

**announcements**
- id, teacher_id, title, content, pdf_text, pdf_path, pdf_filename, has_topics, created_at

**threads**
- id, announcement_id, title, topic, created_at

**messages**
- id, thread_id, user_id, sender_type, content, created_at

**topic_polls**
- id, thread_id, student_id, understanding_level, created_at, updated_at

### API Endpoints

**Authentication:**
- `POST /api/auth/login` - Login user
- `POST /api/auth/signup` - Create student account

**Announcements:**
- `POST /api/announcements` - Create text announcement
- `POST /api/announcements/with-pdf` - Create announcement with PDF
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/{id}/pdf` - View/download PDF

**Discussions:**
- `GET /api/threads/{id}/messages` - Get thread messages
- `POST /api/threads/{id}/ask` - Post message (AI responds if @AI mentioned)

**Polling:**
- `POST /api/topics/{thread_id}/poll` - Vote on understanding
- `GET /api/topics/{thread_id}/poll` - Get poll results
- `GET /api/topics/{thread_id}/helpers` - Get students who understand

---

## 🎯 Key Concepts

### Polling System
Students indicate understanding level for each topic:
- **Complete (✅)** - Fully understand, can help others
- **Partial (⚠️)** - Have some understanding, may need clarification
- **None (❌)** - Need help with this topic

Teachers see vote distribution to gauge class comprehension.

### @AI Feature
Type `@AI` in any message to get AI assistance:

**For Students (AI TA):**
```
@AI what is the main concept here?
@AI can you explain with an example?
```

**For Teachers (AI Assistant):**
```
@AI create a 10-question quiz on this topic
@AI generate a summary of key points
```

AI responds in 5-30 seconds with formatted answers using course material.

### Peer Discovery
"Help" button shows students who voted "Complete Understanding" so others can reach out for peer tutoring.

---

## ⚙️ Configuration

### Change AI Model
Edit `backend/llm_service.py`:
```python
DEFAULT_MODEL = "llama3.1:8b"  # Current (recommended)
# Or: "llama3.2:1b" (faster, lower quality)
# Or: "llama3.1:70b" (best quality, slower)
```

### Adjust @AI Triggers
Edit `backend/prompts.py`:
```python
AI_TRIGGERS = ['@ai', '@help', '@assistant']
```

### Backend Port
Edit `backend/main.py` (last line):
```python
uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Frontend API URL
Edit `frontend/src/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Ollama not connecting | Run `ollama serve` |
| Can't login as Teacher | Use exact name: `Teacher` (case-sensitive) |
| @AI not responding | Check if @AI mentioned in message |
| Backend errors | Check `backend/` terminal for logs |
| Frontend errors | Check browser console (F12) |
| PDF not uploading | Ensure file is PDF and < 50MB |
| Polls not updating | Refresh page or check network tab |

### Common Fixes

**Reset Database:**
```bash
cd backend
rm data.db
python main.py  # Will recreate with fresh schema
```

**Reinstall Backend:**
```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

**Reinstall Frontend:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📁 Project Structure

```
iitgn-discussion-forum/
├── README.md                      # This file
├── backend/
│   ├── database.py               # Database operations
│   ├── main.py                   # FastAPI endpoints
│   ├── llm_service.py           # AI logic
│   ├── pdf_processor.py         # PDF text extraction
│   ├── prompts.py               # AI prompts
│   ├── requirements.txt         # Python dependencies
│   ├── data.db                  # SQLite database
│   └── uploaded_pdfs/           # Stored PDF files
└── frontend/
    ├── src/
    │   ├── components/          # React components
    │   ├── context/             # User context
    │   ├── api.js              # API client
    │   └── main.jsx            # Entry point
    ├── package.json
    └── vite.config.js
```

---

## 🎨 UI Components

### Homepage
- **Left Column (2/3)**: Announcements feed
- **Right Column (1/3)**: Topic polling sidebar

### Announcement Card
- Title and content
- Teacher name and timestamp (IST)
- PDF attachment (if any) with View/Download buttons

### Polling Sidebar
- Legend explaining voting icons
- Topics grouped by announcement (collapsible)
- Compact inline voting buttons
- Thread and Help action buttons

### Thread Chat
- Discussion messages with markdown support
- Real-time @AI responses
- Message history with user names
- Works for both teachers and students

---

## 🔒 Security Notes

- **Simple Authentication**: Name-only login (no passwords)
- **Local Deployment**: Designed for local classroom use
- **Data Privacy**: All data stored locally in SQLite
- **PDF Storage**: Files stored in `uploaded_pdfs/` directory

**For Production Use:**
- Add password authentication
- Implement JWT tokens
- Add rate limiting
- Use HTTPS
- Deploy with proper security measures

---

## 🎓 Use Cases

1. **Teacher announces homework** → Students see announcement → Vote on understanding → Discuss questions
2. **Teacher uploads lecture PDF** → AI generates topics → Students vote → Find peers for help
3. **Student confused** → Check who understands → Reach out for peer tutoring
4. **Group discussion** → Use @AI when stuck → Get instant explanations
5. **Teacher monitors class** → Check polls → Identify struggling topics → Provide extra support

---

## 📊 Key Metrics (Dashboard)

- Total announcements posted
- Total discussion topics
- Total messages exchanged
- Average messages per topic
- Most/least active topics
- Student participation rates

---

## 🆘 Support

**Check if services are running:**
```bash
# Backend
curl http://localhost:8000

# Frontend
curl http://localhost:5173
```

**View logs:**
- Backend: Check terminal where `python main.py` is running
- Frontend: Open browser console (F12)

**Database inspection:**
```bash
cd backend
sqlite3 data.db
.tables
SELECT * FROM announcements;
SELECT * FROM topic_polls;
.quit
```

---

## 📝 License

Educational project for IIT Gandhinagar

---

## 🎉 Quick Demo Flow

1. Login as "Teacher"
2. Click "New Post"
3. Upload a PDF (lecture notes, textbook chapter)
4. Wait 10-30 seconds for AI processing
5. See announcement with PDF attachment
6. Check polling sidebar - topics generated
7. Logout and create student account
8. Vote on topic understanding
9. Click "Help" to see who can help
10. Click "Thread" to discuss
11. Type "@AI explain this" to get AI help

**That's it! Enjoy your smart classroom! 🎓**
