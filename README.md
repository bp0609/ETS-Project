<<<<<<< Updated upstream
# ETA-Project
=======
# 🎓 IITGN Discussion Forum - AI-Powered Course Platform

An intelligent discussion platform for IIT Gandhinagar that uses local LLM to automatically generate discussion topics from course materials and provide AI-powered answers to student questions.

## 🌟 Features

- **📄 PDF Upload**: Teachers upload course PDFs (lectures, notes, slides)
- **🤖 AI Topic Extraction**: Automatically extracts 5-10 key topics using Ollama LLM
- **💬 Discussion Threads**: Auto-creates organized discussion threads for each topic
- **🎯 Smart Q&A**: Students ask questions, AI answers using ONLY the course material
- **📊 Teacher Dashboard**: Real-time analytics on student engagement and activity
- **🚀 Fully Local**: All processing happens on your machine - no cloud dependencies

## 🏗️ Architecture

### Tech Stack

**Backend**:
- FastAPI (Python web framework)
- SQLite (database)
- pdfplumber (PDF text extraction)
- Ollama API (local LLM integration)

**Frontend**:
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Lucide React for icons

**AI Model**:
- Ollama with llama3.1:8b (local, high-quality, 8B parameters)

### Project Structure

```
iitgn-discussion-forum/
├── backend/
│   ├── main.py              # FastAPI app with all endpoints
│   ├── database.py          # SQLite operations
│   ├── pdf_processor.py     # PDF text extraction
│   ├── llm_service.py       # Ollama LLM integration
│   ├── requirements.txt     # Python dependencies
│   └── data.db             # SQLite database (auto-created)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadPage.jsx      # PDF upload interface
│   │   │   ├── ThreadsList.jsx     # Display discussion threads
│   │   │   ├── ThreadChat.jsx      # Q&A chat interface
│   │   │   ├── Dashboard.jsx       # Teacher analytics
│   │   │   └── Message.jsx         # Message component
│   │   ├── App.jsx                 # Main router
│   │   ├── api.js                  # API service
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Tailwind styles
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

1. **Python 3.8+** installed
2. **Node.js 16+** and npm installed
3. **Ollama** installed and running

### Step 1: Install Ollama

**macOS / Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from https://ollama.ai/download

**Pull the model:**
```bash
ollama pull llama3.1:8b
```

**Verify Ollama is running:**
```bash
ollama list
# Should show llama3.1:8b in the list
```

### Step 2: Setup Backend

```bash
# Navigate to backend directory
cd iitgn-discussion-forum/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

The backend will be running at `http://localhost:8000`

### Step 3: Setup Frontend

Open a new terminal window:

```bash
# Navigate to frontend directory
cd iitgn-discussion-forum/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be running at `http://localhost:5173`

## 🎯 Usage Guide

### For Teachers:

1. **Upload Course Material**
   - Go to http://localhost:5173
   - Click "Upload PDF" and select your course material
   - Wait 10-30 seconds for AI processing
   - System automatically creates discussion threads

2. **Monitor Activity**
   - Click "Dashboard" to view analytics
   - See total threads, questions asked, and most active discussions
   - Click any thread to view conversation

### For Students:

1. **Browse Topics**
   - View all available discussion threads
   - Each thread focuses on one key topic from the course

2. **Ask Questions**
   - Click on a thread to open the chat interface
   - Type your question in the input box
   - AI responds within 5-10 seconds using course material

3. **View Conversation History**
   - All questions and answers are saved
   - Scroll through past discussions

## 📡 API Endpoints

### Upload Course
```http
POST /api/courses/upload
Content-Type: multipart/form-data

Response: {
  "course_id": 1,
  "course_name": "Computer Networks",
  "topics_extracted": 7,
  "threads_created": 7,
  "topics": ["Topic 1", "Topic 2", ...]
}
```

### Get Threads
```http
GET /api/courses/{course_id}/threads

Response: {
  "course_id": 1,
  "course_name": "Computer Networks",
  "threads": [...]
}
```

### Get Messages
```http
GET /api/threads/{thread_id}/messages

Response: {
  "thread_id": 1,
  "thread_title": "Discussion: OSI Model",
  "messages": [...]
}
```

### Ask Question
```http
POST /api/threads/{thread_id}/ask
Content-Type: application/json

{
  "question": "What is the difference between TCP and UDP?"
}

Response: {
  "success": true,
  "messages": [...]
}
```

### Dashboard
```http
GET /api/courses/{course_id}/dashboard

Response: {
  "total_threads": 7,
  "total_questions": 15,
  "most_active_thread": {...}
}
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/main.py` to change:
- CORS origins (line 19)
- Server port (default: 8000)

### Frontend Configuration

Edit `frontend/src/api.js` to change:
- Backend API URL (line 3, default: `http://localhost:8000`)

### LLM Configuration

Edit `backend/llm_service.py` to change:
- Ollama model (line 7, default: `llama3.1:8b`)
- Temperature, token limits (line 25-27)
- Prompt templates (various functions)

## 🐛 Troubleshooting

### "Cannot connect to Ollama"
- Make sure Ollama is running: `ollama serve`
- Verify model is installed: `ollama list`
- Check Ollama is on port 11434: `curl http://localhost:11434`

### "PDF text extraction failed"
- Ensure PDF is not scanned images (needs OCR)
- Try with a different PDF
- Check PDF file is not corrupted

### "CORS errors in browser"
- Verify backend is running on port 8000
- Check CORS settings in `backend/main.py` include your frontend URL

### "Frontend won't start"
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear browser cache

## 📊 Database Schema

**courses** table:
- `id` INTEGER PRIMARY KEY
- `name` TEXT
- `pdf_text` TEXT
- `created_at` TIMESTAMP

**threads** table:
- `id` INTEGER PRIMARY KEY
- `course_id` INTEGER
- `title` TEXT
- `topic` TEXT
- `created_at` TIMESTAMP

**messages** table:
- `id` INTEGER PRIMARY KEY
- `thread_id` INTEGER
- `sender_type` TEXT ('student' | 'ai')
- `content` TEXT
- `created_at` TIMESTAMP

## 🎨 Customization

### Change AI Personality

Edit prompts in `backend/llm_service.py`:

```python
# For answering questions (line 82)
prompt = f"""You are a friendly teaching assistant..."""

# For extracting topics (line 39)
prompt = f"""Extract main topics from this text..."""
```

### Styling

Edit `frontend/src/index.css` for global styles, or modify Tailwind classes in component files.

## 🚀 Deployment

### Production Build

**Backend:**
```bash
# Use gunicorn for production
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

**Frontend:**
```bash
npm run build
# Deploy the 'dist' folder to a static host
```

## 📝 Development Notes

- Backend runs on port **8000**
- Frontend runs on port **5173**
- Database file `data.db` is created automatically in backend directory
- All LLM processing is synchronous (may take 5-10 seconds per request)
- No authentication implemented (MVP focuses on core functionality)

## 🤝 Contributing

This is a prototype/MVP. Areas for improvement:

- Add user authentication
- Implement real-time updates with WebSockets
- Add thread summaries feature
- Support multiple file formats (Word, PPT, etc.)
- Add teacher moderation capabilities
- Implement search functionality
- Add email notifications for new questions

## 📄 License

This project is created for educational purposes at IIT Gandhinagar.

## 👨‍💻 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Verify all services are running (Ollama, Backend, Frontend)
3. Check browser console for errors
4. Review backend logs for detailed error messages

---

**Built with ❤️ for IIT Gandhinagar**

*Powered by Ollama, FastAPI, and React*

>>>>>>> Stashed changes
