# 🎓 IITGN Discussion Forum - AI-Powered Course Platform

An intelligent discussion platform for IIT Gandhinagar that uses local LLM to automatically generate discussion topics from course materials and provide AI-powered answers to student questions.

## 🌟 Features

- **👥 User Authentication**: Simple name-based login/signup system
- **🎭 Role-Based Access**: Different capabilities for teachers and students
- **📄 PDF Upload**: Teachers upload course PDFs (lectures, notes, slides)
- **🤖 AI Topic Extraction**: Automatically extracts 5-10 short topics (1-5 words) using Ollama LLM
- **💬 Discussion Threads**: Auto-creates organized discussion threads for each topic
- **🎯 Smart Q&A**: Students ask questions, AI TA answers using course material
- **🎓 Teacher Assistant**: AI helps teachers create quizzes, summaries, and study guides
- **📝 Message Attribution**: Student names displayed with avatars
- **🔄 Conversation Context**: AI considers last 5 messages for better responses
- **✨ Markdown Support**: AI responses render with proper formatting (lists, bold, code)
- **📊 Teacher Dashboard**: Real-time analytics on student engagement
- **🚀 Fully Local**: All processing happens on your machine - no cloud dependencies

## 🏗️ Tech Stack

**Backend**:
- FastAPI (Python web framework)
- SQLite (database with users, courses, threads, messages)
- pdfplumber (PDF text extraction)
- Ollama API (local LLM integration)

**Frontend**:
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Lucide React for icons
- react-markdown for formatted responses

**AI Model**:
- Ollama with llama3.2:1b or llama3.1:8b (local, fast, efficient)

## 🚀 Quick Start

See [QUICKSTART.md](QUICKSTART.md) for detailed 5-minute setup guide.

### Prerequisites

1. **Python 3.8+** installed
2. **Node.js 16+** and npm installed
3. **Ollama** installed and running

### Install Ollama & Model

```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Pull model
ollama pull llama3.2:1b
# OR for better quality (slower):
ollama pull llama3.1:8b
```

### Start Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend will be at: `http://localhost:8000`

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be at: `http://localhost:5173`

## 🎯 Usage Guide

### First Time Setup

1. Open http://localhost:5173
2. **Teacher Login**: Enter name `Teacher` and click Login
3. **Student Signup**: Click "Create New Account" and enter your name

### Teacher Workflow

1. **Upload Lecture**
   - Click "Upload Lecture" from homepage
   - Select PDF file
   - Wait 10-30 seconds for AI to extract topics
   - Lecture appears on homepage

2. **View Analytics**
   - Click "Dashboard" button
   - See total threads, questions, most active discussions

3. **Ask AI for Help**
   - Navigate to any thread
   - Ask AI to create quizzes, summaries, etc.
   - AI acts as Educational Assistant

### Student Workflow

1. **Browse Lectures**
   - Homepage shows all uploaded lectures
   - Click any lecture to see discussion topics

2. **Ask Questions**
   - Click a discussion thread
   - Type your question
   - AI TA responds in 5-30 seconds using course material

3. **View History**
   - See all previous Q&As in each thread
   - Your name appears on your messages

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with name
- `POST /api/auth/signup` - Create student account
- `GET /api/auth/users/{name}` - Check if user exists

### Content
- `POST /api/courses/upload` - Upload PDF and create threads
- `GET /api/lectures` - List all lectures with metadata
- `GET /api/courses/{id}/threads` - Get threads for a lecture
- `GET /api/threads/{id}/messages` - Get messages in thread
- `POST /api/threads/{id}/ask` - Ask question with user_id
- `GET /api/dashboard` - Teacher analytics (all courses)

## 📊 Database Schema

**users** table:
- `id` INTEGER PRIMARY KEY
- `name` TEXT UNIQUE
- `role` TEXT ('student' | 'teacher')
- `created_at` TIMESTAMP

**courses** table:
- `id` INTEGER PRIMARY KEY
- `name` TEXT
- `pdf_text` TEXT
- `created_at` TIMESTAMP

**threads** table:
- `id` INTEGER PRIMARY KEY
- `course_id` INTEGER
- `title` TEXT
- `topic` TEXT (1-5 words)
- `created_at` TIMESTAMP

**messages** table:
- `id` INTEGER PRIMARY KEY
- `thread_id` INTEGER
- `user_id` INTEGER (NULL for AI messages)
- `sender_type` TEXT ('student' | 'teacher' | 'ai')
- `content` TEXT
- `created_at` TIMESTAMP

## 🎨 Key Features Explained

### Role-Based AI Behavior

**For Students (AI TA)**:
- Friendly, helpful teaching assistant
- Answers questions using course material
- Beginner-friendly explanations
- Focus on learning

**For Teachers (AI Assistant)**:
- Professional educational assistant
- Can create quizzes with answer keys
- Generate summaries and study guides
- Suggest assignments and teaching strategies

### Conversation Context

AI receives the **last 5 messages** as context to:
- Understand follow-up questions
- Avoid repeating previous answers
- Provide contextually relevant responses

The prompt structure emphasizes the **current question** over history to prevent AI from just repeating old answers.

### Markdown Rendering

AI responses support:
- **Bold** and *italic* text
- Bullet and numbered lists
- Inline `code` and code blocks
- Headers (H1, H2, H3)
- Proper spacing and formatting

## 🐛 Troubleshooting

### "Cannot connect to Ollama"
```bash
ollama serve
```

### "User not found" on login
- First-time users: Click "Create New Account"
- Teacher account exists by default with name: `Teacher`

### "Failed to send question"
- Check backend is running on port 8000
- AI responses can take 15-30 seconds (be patient)
- Check backend terminal for errors

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend won't start
```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

## 📝 Development Notes

- Backend runs on port **8000**
- Frontend runs on port **5173**
- Database `data.db` auto-created in backend directory
- Teacher account auto-seeded on first run
- LLM responses can take 5-30 seconds depending on model and query complexity
- Old messages (before user system) won't have names

## 🎓 Educational Use

This platform is designed for:
- Course lectures and discussions
- Student Q&A sessions
- Teacher preparation (quizzes, summaries)
- Collaborative learning
- 24/7 AI-assisted learning

## 📄 License

Educational project for IIT Gandhinagar.

## 📞 Support

For issues:
1. Check Troubleshooting section above
2. Verify all services running (Ollama, Backend, Frontend)
3. Check browser console (F12) for errors
4. Review backend terminal for detailed logs

---

**Built with ❤️ for IIT Gandhinagar**

*Powered by Ollama, FastAPI, and React*
