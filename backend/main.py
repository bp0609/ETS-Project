from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import shutil
from typing import List, Optional

import database as db
import pdf_processor
import llm_service

# Initialize FastAPI app
app = FastAPI(title="IITGN Discussion Forum API", version="1.0.0")

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploaded_pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for network access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    db.init_database()
    print("✅ Database initialized")
    print("✅ Server ready and accepting connections from all network interfaces")

# Pydantic models
class LoginRequest(BaseModel):
    name: str

class SignupRequest(BaseModel):
    name: str
    email: str
    phone: str

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

class CreateAnnouncementRequest(BaseModel):
    teacher_id: int
    title: str
    content: str

class PollVoteRequest(BaseModel):
    student_id: int
    understanding_level: str

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
        
        # Validate email
        if not request.email or len(request.email.strip()) < 3 or '@' not in request.email:
            raise HTTPException(status_code=400, detail="Please provide a valid email address")
        
        # Validate phone
        if not request.phone or len(request.phone.strip()) < 10:
            raise HTTPException(status_code=400, detail="Please provide a valid phone number (at least 10 digits)")
        
        # Create new student user
        user_id = db.create_user(
            request.name.strip(), 
            "student", 
            email=request.email.strip(),
            phone=request.phone.strip()
        )
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

# Announcement Endpoints

@app.post("/api/announcements")
async def create_announcement(request: CreateAnnouncementRequest):
    """
    Create a new announcement (text only, no PDF)
    """
    try:
        # Verify teacher exists
        user = db.get_user_by_id(request.teacher_id)
        if not user or user["role"] != "teacher":
            raise HTTPException(status_code=403, detail="Only teachers can create announcements")
        
        # Create announcement
        announcement_id = db.create_announcement(
            teacher_id=request.teacher_id,
            title=request.title,
            content=request.content,
            pdf_text=None,
            has_topics=False
        )
        
        announcement = db.get_announcement(announcement_id)
        
        return {
            "success": True,
            "announcement": announcement
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating announcement: {str(e)}")

@app.post("/api/announcements/with-pdf")
async def create_announcement_with_pdf(
    teacher_id: int = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Create an announcement with a PDF file that generates topics
    """
    try:
        # Verify teacher exists
        user = db.get_user_by_id(teacher_id)
        if not user or user["role"] != "teacher":
            raise HTTPException(status_code=403, detail="Only teachers can create announcements")
        
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Save uploaded file temporarily for processing
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract text from PDF
        print(f"📄 Extracting text from {file.filename}...")
        pdf_text = pdf_processor.extract_text_from_pdf(temp_file_path)
        
        if not pdf_text or len(pdf_text) < 100:
            os.remove(temp_file_path)
            raise HTTPException(status_code=400, detail="PDF appears to be empty or text could not be extracted")
        
        # Extract topics using LLM
        print("🤖 Extracting topics with AI...")
        topics = llm_service.extract_topics(pdf_text)
        print(f"✅ Extracted {len(topics)} topics")
        
        # Save PDF permanently
        import time
        timestamp = int(time.time())
        safe_filename = f"{timestamp}_{file.filename}"
        pdf_path = os.path.join(UPLOAD_DIR, safe_filename)
        shutil.move(temp_file_path, pdf_path)
        print(f"✅ PDF saved to {pdf_path}")
        
        # Create announcement with PDF info
        announcement_id = db.create_announcement(
            teacher_id=teacher_id,
            title=title,
            content=content,
            pdf_text=pdf_text,
            pdf_path=pdf_path,
            pdf_filename=file.filename,
            has_topics=True
        )
        
        # Create threads for each topic
        thread_ids = []
        for i, topic in enumerate(topics, 1):
            thread_id = db.create_thread(
                title=f"Discussion: {topic}",
                topic=topic,
                announcement_id=announcement_id
            )
            thread_ids.append(thread_id)
        
        print(f"✅ Created {len(thread_ids)} threads for announcement")
        
        announcement = db.get_announcement(announcement_id)
        threads = db.get_threads_by_announcement(announcement_id)
        
        return {
            "success": True,
            "announcement": announcement,
            "topics": topics,
            "threads": threads
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating announcement with PDF: {str(e)}")

@app.get("/api/announcements")
async def get_announcements():
    """
    Get all announcements
    """
    try:
        announcements = db.get_all_announcements()
        
        # For each announcement, get its threads if it has topics
        for announcement in announcements:
            if announcement.get("has_topics"):
                threads = db.get_threads_by_announcement(announcement["id"])
                announcement["threads"] = threads
            else:
                announcement["threads"] = []
        
        return {"announcements": announcements}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching announcements: {str(e)}")

@app.get("/api/announcements/{announcement_id}")
async def get_announcement(announcement_id: int):
    """
    Get a specific announcement
    """
    try:
        announcement = db.get_announcement(announcement_id)
        if not announcement:
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        # Get threads if announcement has topics
        if announcement.get("has_topics"):
            threads = db.get_threads_by_announcement(announcement_id)
            announcement["threads"] = threads
        else:
            announcement["threads"] = []
        
        return {"announcement": announcement}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching announcement: {str(e)}")

@app.get("/api/announcements/{announcement_id}/pdf")
async def get_pdf(announcement_id: int, download: bool = False):
    """
    View or download PDF attached to an announcement
    download=true for download, false for inline viewing
    """
    try:
        announcement = db.get_announcement(announcement_id)
        if not announcement:
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        if not announcement.get("pdf_path"):
            raise HTTPException(status_code=404, detail="No PDF attached to this announcement")
        
        pdf_path = announcement["pdf_path"]
        
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=404, detail="PDF file not found on server")
        
        # Return the PDF file
        # If download=true, set filename to trigger download
        # If download=false, don't set filename to display inline
        if download:
            return FileResponse(
                path=pdf_path,
                media_type="application/pdf",
                filename=announcement.get("pdf_filename", "document.pdf")
            )
        else:
            # For inline viewing, don't set filename
            return FileResponse(
                path=pdf_path,
                media_type="application/pdf"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error accessing PDF: {str(e)}")

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
    Post a message. AI responds only if @AI is mentioned
    """
    try:
        # Verify thread exists
        thread = db.get_thread(thread_id)
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        # Get user information
        user = db.get_user_by_id(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Save user's message
        user_msg_id = db.create_message(
            thread_id=thread_id,
            user_id=user["id"],
            sender_type=user["role"],
            content=request.question
        )
        print(f"💬 {user['name']} ({user['role']}) message saved (ID: {user_msg_id})")
        
        # Check if AI should respond (if @AI is mentioned)
        should_respond = llm_service.should_ai_respond(request.question)
        
        ai_msg_id = None
        if should_respond:
            # Get PDF text from announcement
            if not thread.get("announcement_id"):
                raise HTTPException(status_code=404, detail="No announcement linked to this thread")
            
            announcement = db.get_announcement(thread["announcement_id"])
            if not announcement or not announcement.get("pdf_text"):
                raise HTTPException(status_code=404, detail="No course material found for this topic")
            
            pdf_text = announcement["pdf_text"]
            
            # Get thread history (last 10 messages for context)
            all_messages = db.get_messages_by_thread(thread_id)
            thread_history = all_messages[-10:] if len(all_messages) > 10 else all_messages
            
            # Remove @AI mention from the question for cleaner processing
            clean_question = request.question
            for trigger in ['@AI', '@ai', '@ AI', '@ ai']:
                clean_question = clean_question.replace(trigger, '').strip()
            
            # Generate AI answer with role-based prompt
            print(f"🤖 @AI mentioned - Generating AI response for {user['name']}...")
            ai_answer = llm_service.answer_question(
                thread_topic=thread["topic"],
                course_text=pdf_text,
                question=clean_question,
                user_role=user["role"],
                thread_history=thread_history,
                asker_name=user["name"]
            )
            
            # Save AI response (no user_id for AI messages)
            ai_msg_id = db.create_message(
                thread_id=thread_id,
                user_id=None,
                sender_type="ai",
                content=ai_answer
            )
            print(f"✅ AI response saved (ID: {ai_msg_id})")
        else:
            print(f"📝 No @AI mention - message posted without AI response")
        
        # Get updated messages
        messages = db.get_messages_by_thread(thread_id)
        
        return {
            "success": True,
            "user_message_id": user_msg_id,
            "ai_message_id": ai_msg_id,
            "ai_responded": should_respond,
            "messages": messages
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

# Polling Endpoints

@app.post("/api/topics/{thread_id}/poll")
async def vote_on_topic(thread_id: int, request: PollVoteRequest):
    """
    Student votes on their understanding level for a topic
    """
    try:
        # Verify thread exists
        thread = db.get_thread(thread_id)
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        # Verify student exists
        user = db.get_user_by_id(request.student_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user["role"] != "student":
            raise HTTPException(status_code=403, detail="Only students can vote on polls")
        
        # Validate understanding level
        if request.understanding_level not in ['complete', 'partial', 'none']:
            raise HTTPException(status_code=400, detail="Invalid understanding level")
        
        # Create or update poll
        poll_id = db.create_or_update_poll(thread_id, request.student_id, request.understanding_level)
        
        # Get updated results
        results = db.get_poll_results(thread_id)
        
        return {
            "success": True,
            "poll_id": poll_id,
            "results": results
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error voting on poll: {str(e)}")

@app.get("/api/topics/{thread_id}/poll")
async def get_poll_results(thread_id: int, student_id: Optional[int] = None):
    """
    Get poll results for a topic
    Optionally include student_id to get their current vote
    """
    try:
        # Verify thread exists
        thread = db.get_thread(thread_id)
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        # Get poll results
        results = db.get_poll_results(thread_id)
        
        response = {
            "thread_id": thread_id,
            "results": results
        }
        
        # If student_id provided, get their vote
        if student_id:
            student_vote = db.get_student_poll(thread_id, student_id)
            response["student_vote"] = student_vote
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching poll results: {str(e)}")

@app.get("/api/topics/{thread_id}/helpers")
async def get_topic_helpers(thread_id: int):
    """
    Get list of students who understand the topic completely
    """
    try:
        # Verify thread exists
        thread = db.get_thread(thread_id)
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        # Get students who understand completely
        helpers = db.get_students_who_understand(thread_id)
        
        return {
            "thread_id": thread_id,
            "topic": thread["topic"],
            "helpers": helpers
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching helpers: {str(e)}")

@app.get("/api/topics/{thread_id}/students/{understanding_level}")
async def get_students_by_level(thread_id: int, understanding_level: str):
    """
    Get list of students who selected a specific understanding level
    """
    try:
        # Verify thread exists
        thread = db.get_thread(thread_id)
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        # Validate understanding level
        if understanding_level not in ['complete', 'partial', 'none']:
            raise HTTPException(status_code=400, detail="Invalid understanding level")
        
        # Get students with specified understanding level
        students = db.get_students_by_understanding_level(thread_id, understanding_level)
        
        return {
            "thread_id": thread_id,
            "topic": thread["topic"],
            "understanding_level": understanding_level,
            "students": students
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching students: {str(e)}")

# Analytics Endpoint

@app.get("/api/analytics")
async def get_analytics():
    """
    Get comprehensive analytics data for teacher dashboard
    Returns aggregated statistics on student understanding and engagement
    """
    try:
        analytics_data = db.get_analytics_data()
        return analytics_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

