import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Optional

DATABASE_PATH = "data.db"

def get_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize database with required tables"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create courses table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            pdf_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create threads table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS threads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            topic TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )
    """)
    
    # Check if messages table needs migration
    cursor.execute("PRAGMA table_info(messages)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'user_id' not in columns and columns:
        # Messages table exists but doesn't have user_id - need migration
        # Create new table with correct schema
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                thread_id INTEGER NOT NULL,
                user_id INTEGER,
                sender_type TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (thread_id) REFERENCES threads (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # Copy data from old table
        cursor.execute("""
            INSERT INTO messages_new (id, thread_id, user_id, sender_type, content, created_at)
            SELECT id, thread_id, NULL, sender_type, content, created_at FROM messages
        """)
        
        # Drop old table and rename new one
        cursor.execute("DROP TABLE messages")
        cursor.execute("ALTER TABLE messages_new RENAME TO messages")
    elif not columns:
        # Messages table doesn't exist, create it
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                thread_id INTEGER NOT NULL,
                user_id INTEGER,
                sender_type TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (thread_id) REFERENCES threads (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
    
    # Seed teacher account if not exists
    cursor.execute("SELECT * FROM users WHERE name = 'Teacher'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO users (name, role) VALUES ('Teacher', 'teacher')")
    
    conn.commit()
    conn.close()

# Course operations
def create_course(name: str, pdf_text: str) -> int:
    """Create a new course"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO courses (name, pdf_text) VALUES (?, ?)",
        (name, pdf_text)
    )
    course_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return course_id

def get_course(course_id: int) -> Optional[Dict]:
    """Get course by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None

def get_all_courses() -> List[Dict]:
    """Get all courses"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM courses ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Thread operations
def create_thread(course_id: int, title: str, topic: str) -> int:
    """Create a new thread"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO threads (course_id, title, topic) VALUES (?, ?, ?)",
        (course_id, title, topic)
    )
    thread_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return thread_id

def get_threads_by_course(course_id: int) -> List[Dict]:
    """Get all threads for a course"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.*, COUNT(m.id) as message_count
        FROM threads t
        LEFT JOIN messages m ON t.id = m.thread_id
        WHERE t.course_id = ?
        GROUP BY t.id
        ORDER BY t.created_at DESC
    """, (course_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_thread(thread_id: int) -> Optional[Dict]:
    """Get thread by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM threads WHERE id = ?", (thread_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None

# User operations
def create_user(name: str, role: str) -> int:
    """Create a new user"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (name, role) VALUES (?, ?)",
            (name, role)
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        conn.close()
        raise ValueError(f"User with name '{name}' already exists")

def get_user_by_name(name: str) -> Optional[Dict]:
    """Get user by name"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE name = ?", (name,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None

def get_user_by_id(user_id: int) -> Optional[Dict]:
    """Get user by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None

# Message operations
def create_message(thread_id: int, sender_type: str, content: str, user_id: Optional[int] = None) -> int:
    """Create a new message"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (thread_id, user_id, sender_type, content) VALUES (?, ?, ?, ?)",
        (thread_id, user_id, sender_type, content)
    )
    message_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return message_id

def get_messages_by_thread(thread_id: int) -> List[Dict]:
    """Get all messages in a thread with user information"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT m.*, u.name as user_name, u.role as user_role
        FROM messages m
        LEFT JOIN users u ON m.user_id = u.id
        WHERE m.thread_id = ?
        ORDER BY m.created_at ASC
    """, (thread_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Dashboard operations
def get_dashboard_data(course_id: int) -> Dict:
    """Get dashboard statistics for a course"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Total threads
    cursor.execute("SELECT COUNT(*) as count FROM threads WHERE course_id = ?", (course_id,))
    total_threads = cursor.fetchone()["count"]
    
    # Total questions (student messages)
    cursor.execute("""
        SELECT COUNT(*) as count FROM messages m
        JOIN threads t ON m.thread_id = t.id
        WHERE t.course_id = ? AND m.sender_type = 'student'
    """, (course_id,))
    total_questions = cursor.fetchone()["count"]
    
    # Most active thread
    cursor.execute("""
        SELECT t.id, t.title, t.topic, COUNT(m.id) as message_count
        FROM threads t
        LEFT JOIN messages m ON t.id = m.thread_id
        WHERE t.course_id = ?
        GROUP BY t.id
        ORDER BY message_count DESC
        LIMIT 1
    """, (course_id,))
    most_active = cursor.fetchone()
    
    conn.close()
    
    return {
        "total_threads": total_threads,
        "total_questions": total_questions,
        "most_active_thread": dict(most_active) if most_active else None
    }

