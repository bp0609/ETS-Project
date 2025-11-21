# Quick Reference - New Features

## 🚀 Quick Start with New Features

### Start the Application
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python main.py

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Browser
open http://localhost:5173
```

---

## 👥 User Accounts

### Teacher Account (Pre-configured)
- **Username**: `Teacher`
- **Role**: teacher
- **Capabilities**: Upload lectures, access dashboard, AI Assistant

### Student Accounts (Self-signup)
- **Signup**: Click "Create New Account" on login page
- **Username**: Any name (must be unique)
- **Role**: student (automatic)
- **Capabilities**: View lectures, ask questions, AI TA help

---

## 🗺️ Navigation Map

```
Login Page (/)
  ├─ Login → Home Page (/home)
  └─ Sign Up → Signup Page → Home Page

Home Page (/home)
  ├─ Student View:
  │   ├─ Lecture Rows (click to view threads)
  │   └─ Logout
  │
  └─ Teacher View:
      ├─ Upload Lecture → Upload Page (/upload)
      ├─ Dashboard → Analytics (/dashboard)
      ├─ Lecture Rows (click to view threads)
      └─ Logout

Lecture Page (/lecture/:id/threads)
  ├─ Thread Cards (click to open chat)
  ├─ Dashboard (teacher only)
  └─ Back to Home

Thread Chat (/thread/:id)
  ├─ Message History (with names)
  ├─ Ask Question Input
  └─ Back Button

Upload Page (/upload) [Teacher Only]
  ├─ PDF Upload
  ├─ Processing Status
  └─ Back to Home

Dashboard (/dashboard) [Teacher Only]
  ├─ Statistics Cards
  ├─ Most Active Thread
  ├─ All Threads List
  └─ Back to Home
```

---

## 💬 Message Display

### Student Message
```
┌─────────────────────────┐
│  [RK]  Rahul Kumar      │
│  What is TCP?           │
│  3:45 PM                │
└─────────────────────────┘
```

### Teacher Message
```
┌─────────────────────────────────┐
│  [👨‍🎓] Teacher [Teacher Badge]   │
│  Can you prepare a quiz?        │
│  4:10 PM                        │
└─────────────────────────────────┘
```

### AI Response (for Student)
```
┌─────────────────────────────┐
│  [🤖] AI TA                 │
│  TCP is a connection-       │
│  oriented protocol...       │
│  4:11 PM                    │
└─────────────────────────────┘
```

### AI Response (for Teacher)
```
┌─────────────────────────────┐
│  [🤖] AI Assistant          │
│  Here's a 10-question       │
│  quiz based on the...       │
│  4:11 PM                    │
└─────────────────────────────┘
```

---

## 🎭 Role Differences

| Feature | Student | Teacher |
|---------|---------|---------|
| Signup | ✅ Via signup page | ❌ Pre-configured |
| Upload Lecture | ❌ No access | ✅ Full access |
| View Dashboard | ❌ No access | ✅ Full access |
| Ask Questions | ✅ AI TA answers | ✅ AI Assistant answers |
| Message Color | Gray | Purple |
| Home Buttons | Logout only | Upload + Dashboard + Logout |

---

## 🤖 AI Behavior

### For Students (AI TA)
- **Tone**: Friendly, helpful, educational
- **Purpose**: Answer questions clearly
- **Scope**: Uses only course material
- **Examples**: "Let me explain...", "Based on the lecture..."

### For Teachers (AI Assistant)
- **Tone**: Professional, thorough
- **Purpose**: Help with teaching tasks
- **Capabilities**:
  - Generate quizzes
  - Create summaries
  - Draft assignments
  - Suggest study guides
- **Examples**: "I've created a 10-question quiz...", "Here's a summary..."

---

## 🔄 Common Workflows

### Student: Ask a Question
1. Login with your name
2. Click on a lecture from Home
3. Click on a relevant thread
4. Type your question
5. Click "Send"
6. AI TA responds in 5-10 seconds
7. Your name appears on your message

### Teacher: Upload New Lecture
1. Login as "Teacher"
2. Click "Upload Lecture" on Home
3. Select PDF file
4. Wait for AI processing (10-30 seconds)
5. Automatically redirected to Home
6. New lecture appears in list

### Teacher: View Analytics
1. Login as "Teacher"
2. Click "Dashboard" on Home
3. See overall statistics:
   - Total threads
   - Total questions
   - Most active thread
4. Click any thread to view details

---

## 🐛 Quick Troubleshooting

### "User not found" on login
- **Fix**: Use signup page to create account first
- **Note**: "Teacher" account exists by default

### Can't see Upload button
- **Fix**: Must login as "Teacher" (exact spelling)
- **Note**: Students don't have upload access

### Messages show "Student" instead of name
- **Fix**: Old messages (before migration) don't have user_id
- **Note**: New messages will show names correctly

### Dashboard shows "Forbidden"
- **Fix**: Only "Teacher" can access dashboard
- **Note**: Students are redirected to Home

### AI not responding
- **Fix**: Check Ollama is running: `ollama serve`
- **Check**: Backend logs for connection errors

---

## 📱 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message | `Enter` |
| Logout | Click avatar → Logout |
| Back to Home | Click "Home" button |

---

## 💾 Data Storage

### LocalStorage (Browser)
- User session (id, name, role)
- Persists across page refreshes
- Cleared on logout

### Database (Backend)
- `users` - All user accounts
- `courses` - Uploaded lectures
- `threads` - Discussion topics
- `messages` - All conversations (with user attribution)

---

## 🔗 API Endpoints Quick Reference

### Authentication
- `POST /api/auth/login` - { name }
- `POST /api/auth/signup` - { name }
- `GET /api/auth/users/{name}` - Check existence

### Content
- `GET /api/lectures` - List all with metadata
- `GET /api/courses/{id}/threads` - Threads for lecture
- `GET /api/threads/{id}/messages` - Messages in thread
- `POST /api/threads/{id}/ask` - { question, user_id }
- `GET /api/dashboard` - Teacher analytics

---

## 🎨 Color Coding

- **Indigo** (#4F46E5): Primary buttons, links
- **Blue** (#3B82F6): AI messages
- **Gray** (#6B7280): Student messages
- **Purple** (#9333EA): Teacher messages
- **Green** (#10B981): Dashboard button
- **Red** (#EF4444): Error messages

---

## ✅ Feature Checklist

After logging in, verify:
- [ ] Your name appears in header
- [ ] Logout button visible
- [ ] Lectures list loads
- [ ] Click lecture opens threads
- [ ] Click thread opens chat
- [ ] Can send message
- [ ] Message shows your name
- [ ] AI responds appropriately
- [ ] Back navigation works

Teacher-specific:
- [ ] "Upload Lecture" button visible
- [ ] "Dashboard" button visible
- [ ] Can upload PDF
- [ ] Dashboard shows statistics

---

## 🆘 Support

1. Check browser console (F12) for errors
2. Check backend terminal for logs
3. Review MIGRATION_GUIDE.md
4. See IMPLEMENTATION_SUMMARY.md for details

---

**Quick Reference v2.0 - Updated with User Auth Features**

