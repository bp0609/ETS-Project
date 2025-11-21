from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from typing import List, Optional

import database as db
import pdf_processor
import llm_service

# Initialize FastAPI app
app = FastAPI(title="IITGN Discussion Forum API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite and React default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    db.init_database()
    print("✅ Database initialized")
    print("✅ Server ready at http://localhost:8000")

# Pydantic models
class LoginRequest(BaseModel):
    name: str

class SignupRequest(BaseModel):
    name: str

class UserResponse(BaseModel):
    id: int
    name: str
    role: str

class AskQuestionRequest(BaseModel):
    question: str
    user_id: int

class MessageResponse(BaseModel):
    id: int
    thread_id: int
    sender_type: str
    content: str
    created_at: str

class ThreadResponse(BaseModel):
    id: int
    course_id: int
    title: str
    topic: str
    created_at: str
    message_count: int

class CourseResponse(BaseModel):
    id: int
    name: str
    created_at: str

class DashboardResponse(BaseModel):
    total_threads: int
    total_questions: int
    most_active_thread: Optional[dict]

# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "IITGN Discussion Forum API is running",
        "version": "1.0.0"
    }

# Authentication Endpoints

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """
    Login endpoint - checks if user exists and returns user data
    """
    try:
        user = db.get_user_by_name(request.name)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found. Please sign up first.")
        
        return {
            "success": True,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "role": user["role"]
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@app.post("/api/auth/signup")
async def signup(request: SignupRequest):
    """
    Signup endpoint - creates new student account
    """
    try:
        # Validate name
        if not request.name or len(request.name.strip()) < 2:
            raise HTTPException(status_code=400, detail="Name must be at least 2 characters")
        
        # Create new student user
        user_id = db.create_user(request.name.strip(), "student")
        user = db.get_user_by_id(user_id)
        
        return {
            "success": True,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "role": user["role"]
            }
        }
    
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup error: {str(e)}")

@app.get("/api/auth/users/{name}")
async def get_user(name: str):
    """
    Check if user exists by name
    """
    try:
        user = db.get_user_by_name(name)
        
        if not user:
            return {"exists": False}
        
        return {
            "exists": True,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "role": user["role"]
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking user: {str(e)}")

@app.post("/api/courses/upload")
async def upload_course(file: UploadFile = File(...)):
    """
    Upload a PDF course file, extract topics, and create threads
    """
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Save uploaded file temporarily
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract text from PDF
        print(f"📄 Extracting text from {file.filename}...")
        pdf_text = pdf_processor.extract_text_from_pdf(temp_file_path)
        
        if not pdf_text or len(pdf_text) < 100:
            os.remove(temp_file_path)
            raise HTTPException(status_code=400, detail="PDF appears to be empty or text could not be extracted")
        
        # Clean up temp file
        os.remove(temp_file_path)
        
        # Create course in database
        course_name = file.filename.replace('.pdf', '')
        course_id = db.create_course(course_name, pdf_text)
        print(f"✅ Course created with ID: {course_id}")
        
        # Extract topics using LLM
        print("🤖 Extracting topics with AI...")
        topics = llm_service.extract_topics(pdf_text)
        print(f"✅ Extracted {len(topics)} topics")
        
        # Create threads for each topic
        thread_ids = []
        for i, topic in enumerate(topics, 1):
            thread_id = db.create_thread(
                course_id=course_id,
                title=f"Discussion: {topic}",
                topic=topic
            )
            thread_ids.append(thread_id)
        
        print(f"✅ Created {len(thread_ids)} threads")
        
        return {
            "course_id": course_id,
            "course_name": course_name,
            "topics_extracted": len(topics),
            "threads_created": len(thread_ids),
            "topics": topics
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.get("/api/courses/{course_id}/threads")
async def get_course_threads(course_id: int):
    """
    Get all threads for a specific course
    """
    try:
        # Verify course exists
        course = db.get_course(course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get threads
        threads = db.get_threads_by_course(course_id)
        
        return {
            "course_id": course_id,
            "course_name": course["name"],
            "threads": threads
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching threads: {str(e)}")

@app.get("/api/threads/{thread_id}/messages")
async def get_thread_messages(thread_id: int):
    """
    Get all messages in a specific thread
    """
    try:
        # Verify thread exists
        thread = db.get_thread(thread_id)
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        # Get messages
        messages = db.get_messages_by_thread(thread_id)
        
        return {
            "thread_id": thread_id,
            "thread_title": thread["title"],
            "thread_topic": thread["topic"],
            "messages": messages
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching messages: {str(e)}")

@app.post("/api/threads/{thread_id}/ask")
async def ask_question(thread_id: int, request: AskQuestionRequest):
    """
    Post a question and get AI response (role-based)
    """
    try:
        # Verify thread exists
        thread = db.get_thread(thread_id)
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        # Get course text
        course = db.get_course(thread["course_id"])
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get user information
        user = db.get_user_by_id(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get thread history (last 10 messages for context)
        all_messages = db.get_messages_by_thread(thread_id)
        thread_history = all_messages[-10:] if len(all_messages) > 10 else all_messages
        
        # Save user's question/request
        user_msg_id = db.create_message(
            thread_id=thread_id,
            user_id=user["id"],
            sender_type=user["role"],
            content=request.question
        )
        print(f"💬 {user['role'].capitalize()} message saved (ID: {user_msg_id})")
        
        # Generate AI answer with role-based prompt
        print(f"🤖 Generating AI response for {user['role']}...")
        ai_answer = llm_service.answer_question(
            thread_topic=thread["topic"],
            course_text=course["pdf_text"],
            question=request.question,
            user_role=user["role"],
            thread_history=thread_history
        )
        
        # Save AI response (no user_id for AI messages)
        ai_msg_id = db.create_message(
            thread_id=thread_id,
            user_id=None,
            sender_type="ai",
            content=ai_answer
        )
        print(f"✅ AI response saved (ID: {ai_msg_id})")
        
        # Get updated messages
        messages = db.get_messages_by_thread(thread_id)
        
        return {
            "success": True,
            "user_message_id": user_msg_id,
            "ai_message_id": ai_msg_id,
            "messages": messages
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@app.get("/api/courses/{course_id}/dashboard")
async def get_dashboard(course_id: int):
    """
    Get dashboard statistics for a course
    """
    try:
        # Verify course exists
        course = db.get_course(course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get dashboard data
        dashboard_data = db.get_dashboard_data(course_id)
        
        return {
            "course_id": course_id,
            "course_name": course["name"],
            **dashboard_data
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard data: {str(e)}")

@app.get("/api/courses")
async def get_all_courses():
    """
    Get all courses
    """
    try:
        courses = db.get_all_courses()
        return {"courses": courses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching courses: {str(e)}")

@app.get("/api/lectures")
async def get_all_lectures():
    """
    Get all lectures (courses) with thread count for homepage
    """
    try:
        courses = db.get_all_courses()
        
        # Add thread count for each course/lecture
        lectures = []
        for course in courses:
            threads = db.get_threads_by_course(course["id"])
            lectures.append({
                "id": course["id"],
                "name": course["name"],
                "created_at": course["created_at"],
                "thread_count": len(threads)
            })
        
        return {"lectures": lectures}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching lectures: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

