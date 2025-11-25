import sqlite3
import os
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional

DATABASE_PATH = "data.db"

# IST timezone offset
IST = timezone(timedelta(hours=5, minutes=30))

def get_ist_time():
    """Get current time in IST"""
    return datetime.now(IST).strftime('%Y-%m-%d %H:%M:%S')

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
            email TEXT,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Migrate existing users table to add email and phone columns if they don't exist
    try:
        cursor.execute("SELECT email FROM users LIMIT 1")
    except sqlite3.OperationalError:
        # Column doesn't exist, add it
        cursor.execute("ALTER TABLE users ADD COLUMN email TEXT")
        print("✅ Added email column to users table")
    
    try:
        cursor.execute("SELECT phone FROM users LIMIT 1")
    except sqlite3.OperationalError:
        # Column doesn't exist, add it
        cursor.execute("ALTER TABLE users ADD COLUMN phone TEXT")
        print("✅ Added phone column to users table")
    
    # Create announcements table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            pdf_text TEXT,
            pdf_path TEXT,
            pdf_filename TEXT,
            has_topics BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES users (id)
        )
    """)
    
    # Create threads table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS threads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            announcement_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            topic TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (announcement_id) REFERENCES announcements (id)
        )
    """)
    
    # Create messages table
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
    
    # Create topic_polls table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS topic_polls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            thread_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            understanding_level TEXT NOT NULL CHECK(understanding_level IN ('complete', 'partial', 'none')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(thread_id, student_id),
            FOREIGN KEY (thread_id) REFERENCES threads (id),
            FOREIGN KEY (student_id) REFERENCES users (id)
        )
    """)
    
    # Seed teacher account if not exists
    cursor.execute("SELECT * FROM users WHERE name = 'Teacher'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO users (name, role) VALUES ('Teacher', 'teacher')")
    
    conn.commit()
    conn.close()

# Announcement operations
def create_announcement(teacher_id: int, title: str, content: str, pdf_text: Optional[str] = None, pdf_path: Optional[str] = None, pdf_filename: Optional[str] = None, has_topics: bool = False) -> int:
    """Create a new announcement"""
    conn = get_connection()
    cursor = conn.cursor()
    ist_time = get_ist_time()
    cursor.execute(
        "INSERT INTO announcements (teacher_id, title, content, pdf_text, pdf_path, pdf_filename, has_topics, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (teacher_id, title, content, pdf_text, pdf_path, pdf_filename, has_topics, ist_time)
    )
    announcement_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return announcement_id

def get_announcement(announcement_id: int) -> Optional[Dict]:
    """Get announcement by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.*, u.name as teacher_name
        FROM announcements a
        LEFT JOIN users u ON a.teacher_id = u.id
        WHERE a.id = ?
    """, (announcement_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None

def get_all_announcements() -> List[Dict]:
    """Get all announcements"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.*, u.name as teacher_name
        FROM announcements a
        LEFT JOIN users u ON a.teacher_id = u.id
        ORDER BY a.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_threads_by_announcement(announcement_id: int) -> List[Dict]:
    """Get all threads for an announcement"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.*, COUNT(m.id) as message_count
        FROM threads t
        LEFT JOIN messages m ON t.id = m.thread_id
        WHERE t.announcement_id = ?
        GROUP BY t.id
        ORDER BY t.created_at ASC
    """, (announcement_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Thread operations
def create_thread(title: str, topic: str, announcement_id: int) -> int:
    """Create a new thread linked to an announcement"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO threads (announcement_id, title, topic) VALUES (?, ?, ?)",
        (announcement_id, title, topic)
    )
    thread_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return thread_id

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
def create_user(name: str, role: str, email: Optional[str] = None, phone: Optional[str] = None) -> int:
    """Create a new user"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (name, role, email, phone) VALUES (?, ?, ?, ?)",
            (name, role, email, phone)
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

# Topic poll operations
def create_or_update_poll(thread_id: int, student_id: int, understanding_level: str) -> int:
    """Create or update a student's poll response for a topic"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if poll already exists
    cursor.execute(
        "SELECT id FROM topic_polls WHERE thread_id = ? AND student_id = ?",
        (thread_id, student_id)
    )
    existing = cursor.fetchone()
    
    if existing:
        # Update existing poll
        cursor.execute(
            "UPDATE topic_polls SET understanding_level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (understanding_level, existing["id"])
        )
        poll_id = existing["id"]
    else:
        # Create new poll
        cursor.execute(
            "INSERT INTO topic_polls (thread_id, student_id, understanding_level) VALUES (?, ?, ?)",
            (thread_id, student_id, understanding_level)
        )
        poll_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    return poll_id

def get_poll_results(thread_id: int) -> Dict:
    """Get poll results for a topic"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            understanding_level,
            COUNT(*) as count
        FROM topic_polls
        WHERE thread_id = ?
        GROUP BY understanding_level
    """, (thread_id,))
    
    results = {"complete": 0, "partial": 0, "none": 0}
    for row in cursor.fetchall():
        results[row["understanding_level"]] = row["count"]
    
    conn.close()
    return results

def get_student_poll(thread_id: int, student_id: int) -> Optional[str]:
    """Get a student's poll response for a topic"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT understanding_level FROM topic_polls WHERE thread_id = ? AND student_id = ?",
        (thread_id, student_id)
    )
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return row["understanding_level"]
    return None

def get_students_who_understand(thread_id: int) -> List[Dict]:
    """Get list of students who understand the topic completely"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id, u.name, u.email, u.phone
        FROM topic_polls tp
        JOIN users u ON tp.student_id = u.id
        WHERE tp.thread_id = ? AND tp.understanding_level = 'complete'
        ORDER BY u.name ASC
    """, (thread_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_students_by_understanding_level(thread_id: int, understanding_level: str) -> List[Dict]:
    """Get list of students who selected a specific understanding level for a topic"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.id, u.name, u.email, u.phone
        FROM topic_polls tp
        JOIN users u ON tp.student_id = u.id
        WHERE tp.thread_id = ? AND tp.understanding_level = ?
        ORDER BY u.name ASC
    """, (thread_id, understanding_level))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_all_threads_with_polls() -> List[Dict]:
    """Get all threads with their poll statistics"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            t.id,
            t.announcement_id,
            t.title,
            t.topic,
            t.created_at,
            COUNT(DISTINCT m.id) as message_count,
            COUNT(DISTINCT CASE WHEN tp.understanding_level = 'complete' THEN tp.student_id END) as complete_count,
            COUNT(DISTINCT CASE WHEN tp.understanding_level = 'partial' THEN tp.student_id END) as partial_count,
            COUNT(DISTINCT CASE WHEN tp.understanding_level = 'none' THEN tp.student_id END) as none_count,
            COUNT(DISTINCT tp.student_id) as total_votes
        FROM threads t
        LEFT JOIN messages m ON t.id = m.thread_id
        LEFT JOIN topic_polls tp ON t.id = tp.thread_id
        WHERE t.announcement_id IS NOT NULL
        GROUP BY t.id
        ORDER BY t.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_analytics_data() -> Dict:
    """Get comprehensive analytics data for teacher dashboard"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Get total counts
    cursor.execute("SELECT COUNT(DISTINCT id) FROM users WHERE role = 'student'")
    total_students = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM announcements")
    total_announcements = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM threads WHERE announcement_id IS NOT NULL")
    total_threads = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(DISTINCT student_id) FROM topic_polls")
    students_participated = cursor.fetchone()[0]
    
    # Get per-topic breakdown with all metrics
    cursor.execute("""
        SELECT 
            t.id as thread_id,
            t.topic,
            t.title,
            a.title as announcement_title,
            a.id as announcement_id,
            COUNT(DISTINCT m.id) as message_count,
            COUNT(DISTINCT CASE WHEN tp.understanding_level = 'complete' THEN tp.student_id END) as complete_count,
            COUNT(DISTINCT CASE WHEN tp.understanding_level = 'partial' THEN tp.student_id END) as partial_count,
            COUNT(DISTINCT CASE WHEN tp.understanding_level = 'none' THEN tp.student_id END) as none_count,
            COUNT(DISTINCT tp.student_id) as total_votes
        FROM threads t
        LEFT JOIN announcements a ON t.announcement_id = a.id
        LEFT JOIN messages m ON t.id = m.thread_id
        LEFT JOIN topic_polls tp ON t.id = tp.thread_id
        WHERE t.announcement_id IS NOT NULL
        GROUP BY t.id, t.topic, t.title, a.title, a.id
        ORDER BY t.created_at DESC
    """)
    
    topics_data = []
    total_complete = 0
    total_partial = 0
    total_none = 0
    total_votes = 0
    
    for row in cursor.fetchall():
        topic = dict(row)
        votes = topic['total_votes']
        
        # Calculate clarity score
        if votes > 0:
            clarity_score = (topic['complete_count'] / votes) * 100
        else:
            clarity_score = 0
        
        # Calculate participation rate
        if total_students > 0:
            participation_rate = (votes / total_students) * 100
        else:
            participation_rate = 0
        
        topic['clarity_score'] = round(clarity_score, 1)
        topic['participation_rate'] = round(participation_rate, 1)
        
        # Determine if needs attention (clarity < 50% OR none_votes > 30% of total)
        needs_attention = False
        if votes > 0:
            none_percentage = (topic['none_count'] / votes) * 100
            if clarity_score < 50 or none_percentage > 30:
                needs_attention = True
        
        topic['needs_attention'] = needs_attention
        topics_data.append(topic)
        
        # Accumulate totals
        total_complete += topic['complete_count']
        total_partial += topic['partial_count']
        total_none += topic['none_count']
        total_votes += votes
    
    # Calculate overall understanding rate
    if total_votes > 0:
        overall_understanding_rate = (total_complete / total_votes) * 100
    else:
        overall_understanding_rate = 0
    
    # Find most and least understood topics
    topics_with_votes = [t for t in topics_data if t['total_votes'] > 0]
    
    most_understood = None
    least_understood = None
    if topics_with_votes:
        most_understood = max(topics_with_votes, key=lambda x: x['clarity_score'])
        least_understood = min(topics_with_votes, key=lambda x: x['clarity_score'])
    
    # Find most and least active threads
    most_active = None
    least_active = None
    if topics_data:
        most_active = max(topics_data, key=lambda x: x['message_count'])
        if len(topics_data) > 1:
            least_active = min(topics_data, key=lambda x: x['message_count'])
    
    # Topics needing attention
    topics_needing_attention = [t for t in topics_data if t['needs_attention']]
    
    # Calculate average participation rate
    if topics_data:
        avg_participation = sum(t['participation_rate'] for t in topics_data) / len(topics_data)
    else:
        avg_participation = 0
    
    conn.close()
    
    return {
        'summary': {
            'total_students': total_students,
            'students_participated': students_participated,
            'total_announcements': total_announcements,
            'total_threads': total_threads,
            'total_votes': total_votes,
            'overall_understanding_rate': round(overall_understanding_rate, 1),
            'topics_needing_attention_count': len(topics_needing_attention),
            'avg_participation_rate': round(avg_participation, 1)
        },
        'topics': topics_data,
        'topics_needing_attention': topics_needing_attention,
        'most_understood': most_understood,
        'least_understood': least_understood,
        'most_active_thread': most_active,
        'least_active_thread': least_active,
        'overall_distribution': {
            'complete': total_complete,
            'partial': total_partial,
            'none': total_none
        }
    }

