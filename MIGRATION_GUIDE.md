# Migration Guide - User Authentication & Role-Based Features

## Overview

This guide helps you migrate your existing IITGN Discussion Forum to the new version with user authentication and role-based features.

## What's New

### Backend Changes
1. **Users table** - Stores student and teacher accounts
2. **Updated messages table** - Includes user_id to track who sent each message
3. **Authentication endpoints** - Login, signup, and user lookup
4. **Role-based AI prompts** - Different AI behavior for students (TA) vs teachers (Assistant)
5. **Thread history context** - AI now considers previous messages in the conversation
6. **Lectures API** - New endpoint for listing all lectures with metadata

### Frontend Changes
1. **LoginPage & SignupPage** - Simple name-based authentication
2. **HomePage** - Shows all lectures in rows, different UI for students vs teachers
3. **UserContext** - Manages authentication state across the app
4. **Protected Routes** - Requires login to access content
5. **Message attribution** - Shows actual student names and avatars
6. **Updated navigation** - All pages now navigate to /home as the central hub

## Migration Steps

### Step 1: Backup Your Database

```bash
cd backend
cp data.db data.db.backup
```

### Step 2: Update Dependencies (if needed)

Backend dependencies are unchanged, but verify:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

Frontend - install if fresh:
```bash
cd frontend
npm install
```

### Step 3: Database Migration

The database will automatically migrate when you restart the backend:

```bash
cd backend
source venv/bin/activate
python main.py
```

What happens automatically:
- Creates `users` table
- Adds `user_id` column to `messages` table (existing messages will have NULL)
- Seeds "Teacher" account automatically

### Step 4: Manual Verification

Connect to your database and verify:

```bash
sqlite3 data.db
```

```sql
-- Check users table exists
SELECT * FROM users;

-- Should show: Teacher account with role='teacher'

-- Check messages table structure
PRAGMA table_info(messages);

-- Should show: user_id column added
```

### Step 5: Test the Application

#### Test Teacher Login:
1. Start backend: `cd backend && source venv/bin/activate && python main.py`
2. Start frontend: `cd frontend && npm run dev`
3. Go to http://localhost:5173
4. Login with name: **Teacher**
5. Verify you see "Upload Lecture" and "Dashboard" buttons

#### Test Student Signup:
1. Click "Create New Account"
2. Enter any name (e.g., "Rahul")
3. Verify account is created
4. Login and verify you see lectures list

#### Test Q&A Flow:
1. As teacher, upload a PDF lecture
2. Wait for topics to be extracted
3. Go to home, click on the lecture
4. Click on a thread
5. Ask a question - verify it shows your name
6. Verify AI responds as "AI TA" for students or "AI Assistant" for teacher

## New User Flows

### Teacher Flow:
```
Login (name: Teacher) → Home → Upload Lecture → [AI processes] → 
Home (see lecture) → Click lecture → View threads → 
Ask question (AI Assistant helps) → Dashboard (analytics)
```

### Student Flow:
```
Signup (enter name) → Login → Home → Click lecture → 
View threads → Click thread → Ask question → Get AI answer
```

## Key Configuration Changes

### Backend (`main.py`)
- New auth endpoints: `/api/auth/login`, `/api/auth/signup`
- Modified ask endpoint: Now requires `user_id`
- New lectures endpoint: `/api/lectures`

### Frontend Routes
- `/` - Login page
- `/signup` - Signup page
- `/home` - Main homepage (protected)
- `/lecture/:lectureId/threads` - Thread list for a lecture
- `/thread/:threadId` - Chat interface
- `/upload` - Upload page (teacher only)
- `/dashboard` - Analytics (teacher only)

## Breaking Changes

### API Changes

**Before:**
```javascript
askQuestion(threadId, question)
```

**After:**
```javascript
askQuestion(threadId, question, userId)
```

### Database Schema

**Messages table - NEW STRUCTURE:**
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    user_id INTEGER,  -- NEW FIELD
    sender_type TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
)
```

## Rollback Procedure

If you need to rollback:

1. Stop both servers
2. Restore backup:
```bash
cd backend
rm data.db
mv data.db.backup data.db
```
3. Checkout previous git commit:
```bash
git log  # Find commit before changes
git checkout <commit-hash>
```

## Troubleshooting

### Issue: "User not found" error
**Solution:** Make sure Teacher account was seeded. Check:
```sql
SELECT * FROM users WHERE name = 'Teacher';
```

### Issue: Messages not showing student names
**Solution:** Old messages don't have user_id. They'll show as "Student" generically. New messages will show names.

### Issue: Can't access dashboard
**Solution:** Only Teacher account can access dashboard. Login as "Teacher".

### Issue: Frontend shows "Loading..." forever
**Solution:** 
1. Check backend is running
2. Clear browser localStorage: `localStorage.clear()`
3. Refresh page and login again

## Testing Checklist

- [ ] Teacher can login with name "Teacher"
- [ ] Students can signup with any name
- [ ] Student names appear in duplicate signup
- [ ] Uploaded lectures appear on homepage
- [ ] Teacher sees "Upload" and "Dashboard" buttons
- [ ] Students don't see teacher-only buttons
- [ ] Messages show actual student names
- [ ] AI responds as "TA" for students
- [ ] AI responds as "Assistant" for teacher
- [ ] Thread history is included in AI context
- [ ] Dashboard shows overall statistics
- [ ] Logout works correctly

## Support

For issues:
1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify database migration completed
4. Review this migration guide

---

**Migration completed successfully! Your forum now has user authentication and role-based features.**

