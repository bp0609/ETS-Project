# 🎓 IITGN Classroom - Polling & Discussion Platform

AI-powered classroom platform with announcements, topic polling, peer discovery, and discussion threads.

---

## ✨ Features

**For Teachers:**
- 📢 Create announcements with PDF uploads
- 🤖 Auto-generate discussion topics from PDFs using AI
- 📊 View student understanding through polls
- 📈 Analytics dashboard for engagement tracking

**For Students:**
- 📚 View announcements and download materials
- ✅ Vote on understanding level for each topic (Complete/Partial/None)
- 👥 Find classmates who can help with topics
- 💬 Discuss with peers and get AI assistance using @AI

---

## 🚀 Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Ollama (for AI features)

### 1. Install Ollama & AI Model
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull AI model
ollama pull llama3.1:8b

# Start Ollama (if not running)
ollama serve
```

### 2. Setup Backend
```bash
cd backend

# First time setup
./setup.sh

# Start server
./run.sh
```

The backend will show both local and network URLs:
- Local: `http://localhost:8000`
- Network: `http://YOUR_IP:8000`

### 3. Setup Frontend
```bash
cd frontend

# Install dependencies (first time)
npm install

# Start development server
npm run dev
```

Vite will display:
- Local: `http://localhost:5173`
- Network: `http://YOUR_IP:5173`

### 4. Access the App
- Open `http://localhost:5173` in your browser
- **Teacher Login:** Name = `Teacher` (case-sensitive)
- **Student Login:** Signup with any name

---

## 📡 Network Access

To allow others on the same network (e.g., classroom WiFi) to access the app:

1. **Find your IP address:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Look for something like `192.168.1.100` or `10.x.x.x`

2. **Share the Network URL with students:**
   - Students access: `http://YOUR_IP:5173`
   - Example: `http://192.168.1.100:5173`

3. **Both servers automatically accept network connections** - no additional configuration needed!

**Note:** All devices must be on the same WiFi/network.

---

## 📖 How to Use

### Teacher Workflow
1. **Create Announcement**
   - Click "New Post" button
   - Enter title and content
   - Upload PDF (optional) - AI will auto-generate 2-6 topics and create discussion threads
   - Students can view/download the PDF

2. **Monitor Understanding**
   - Check polling sidebar to see student votes:
     - ✅ Green = Understand completely
     - ⚠️ Yellow = Partially understand
     - ❌ Red = Need help
   - Click on counts to see which students

3. **View Analytics**
   - Click "Analytics" button for engagement metrics

4. **Join Discussions**
   - Click "Thread" button on any topic
   - Use `@AI` for help (e.g., "@AI create a quiz on this topic")

### Student Workflow
1. **View Announcements**
   - See all posts on homepage
   - Click "View" to open PDFs, "Download" to save

2. **Vote on Understanding**
   - Use polling sidebar on the right
   - Click ✅ ⚠️ or ❌ for each topic
   - Change vote anytime

3. **Find Help**
   - Click "👥 Help" button on topics you're struggling with
   - See students who marked "Complete Understanding"

4. **Discuss & Learn**
   - Click "Thread" button to join discussions
   - Chat with classmates
   - Use `@AI` for AI assistance (e.g., "@AI explain this concept")

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Ollama not connecting | Run `ollama serve` |
| Can't login as Teacher | Use exact name: `Teacher` (case-sensitive) |
| @AI not responding | Make sure you typed `@AI` in your message |
| PDF upload fails | Ensure file is PDF format |
| Network access not working | Check all devices on same WiFi, verify firewall |

### Reset Everything
```bash
# Reset Backend
cd backend
rm data.db
./run.sh

# Reset Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Check if Services are Running
```bash
# Backend
curl http://localhost:8000

# Frontend
curl http://localhost:5173
```

---

## 💡 Tips

- **@AI Feature**: AI responds in 5-30 seconds. Be specific in your questions.
- **Poll Updates**: Teachers can see votes in real-time.
- **PDF Processing**: First PDF upload takes 10-30 seconds while AI extracts topics.
- **Peer Learning**: Students who vote "Complete" become potential tutors for others.

---

## 🎓 Tech Stack

- **Backend**: Python, FastAPI, SQLite, Ollama
- **Frontend**: React, Vite, Tailwind CSS
- **AI Model**: llama3.1:8b

---

## 📝 Quick Demo

1. Login as "Teacher"
2. Click "New Post" → Upload a PDF
3. Wait for AI to process (10-30 sec)
4. See announcement with auto-generated topics
5. Logout → Create student account
6. Vote on topics using ✅ ⚠️ ❌
7. Click "Thread" → Type "@AI explain this"
8. Get instant AI help!

---

**Enjoy your smart classroom! 🎓**
