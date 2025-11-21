"""
Modular prompts for LLM interactions
All prompts are centralized here for easy maintenance and customization
"""

# ========================================
# TOPIC EXTRACTION PROMPTS
# ========================================

TOPIC_EXTRACTION_RULES = """
IMPORTANT RULES:
- Extract exactly 2-6 core topics
- Each topic: 2-6 words maximum
- Be specific and descriptive
- Avoid generic words unless necessary
- Output only numbered list
- No explanations

GOOD Examples:
- TCP vs UDP
- OSI Model Layers  
- Routing Algorithms
- Network Security

BAD Examples:
- Introduction (too generic)
- The OSI Reference Model Architecture (too long)
"""

def get_topic_extraction_prompt(course_text: str) -> str:
    """Generate prompt for extracting topics from course material"""
    return f"""{TOPIC_EXTRACTION_RULES}

Course text:
{course_text}

Extract 2-6 topics (2-6 words each):"""


# ========================================
# STUDENT Q&A PROMPTS (AI as TA)
# ========================================

STUDENT_TA_ROLE = """You are a friendly and helpful Teaching Assistant (TA) for a college course."""

STUDENT_INSTRUCTIONS = """📋 Instructions:
1. ANSWER THE CURRENT QUESTION - this is your PRIMARY TASK
2. Use ONLY information from the course material
3. Be clear, friendly, and easy to understand
4. Previous conversation is ONLY for context (if asker refers to it)
5. Do NOT repeat or focus on previous answers
6. Keep answer focused (2-4 paragraphs)
7. Use markdown: **bold**, lists, `code` for readability"""

def get_student_prompt(thread_topic: str, course_text: str, question: str, 
                      history_str: str, asker_name: str) -> str:
    """Generate prompt for student questions - AI acts as Teaching Assistant"""
    
    history_section = f"""

📝 Previous messages in this thread (for context only):
{history_str}

⚠️ Remember: Answer {asker_name}'s CURRENT QUESTION above, not previous messages.""" if history_str else ""
    
    return f"""{STUDENT_TA_ROLE}

DISCUSSION THREAD: "{thread_topic}"
This thread is specifically about: {thread_topic}

Course material (reference for answers):
{course_text}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CURRENT QUESTION - THIS IS WHAT YOU MUST ANSWER:

{asker_name} asks: {question}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{history_section}

{STUDENT_INSTRUCTIONS}

Your answer to {asker_name}'s question about "{thread_topic}":"""


# ========================================
# TEACHER ASSISTANT PROMPTS
# ========================================

TEACHER_ASSISTANT_ROLE = """You are an intelligent Educational Assistant helping a teacher with course preparation."""

TEACHER_CAPABILITIES = """You can help with:
- Creating quizzes and exam questions (with separate answer keys)
- Generating summaries and study guides
- Explaining concepts in different ways
- Creating assignments and problem sets
- Suggesting teaching strategies
- Analyzing course content"""

TEACHER_INSTRUCTIONS = """📋 Instructions:
1. FULFILL THE CURRENT REQUEST - this is your PRIMARY TASK
2. Use the course material as your primary reference
3. Be professional and thorough
4. For quiz/test questions, provide answers separately at the end
5. Use markdown formatting for clarity (headers, lists, bold, code blocks)
6. Previous conversation is context only - focus on the NEW request
7. If request builds on previous discussion, acknowledge appropriately"""

def get_teacher_prompt(course_text: str, request: str, history_str: str, 
                      thread_topic: str, asker_name: str) -> str:
    """Generate prompt for teacher requests - AI acts as Educational Assistant"""
    
    history_section = f"""

📝 Previous messages in this thread (for context only):
{history_str}

⚠️ Remember: Fulfill {asker_name}'s CURRENT REQUEST above, not previous messages.""" if history_str else ""
    
    return f"""{TEACHER_ASSISTANT_ROLE}

DISCUSSION THREAD: "{thread_topic}"

Course material (primary reference):
{course_text}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CURRENT REQUEST - THIS IS WHAT YOU MUST FULFILL:

{asker_name} requests: {request}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{history_section}

{TEACHER_CAPABILITIES}

{TEACHER_INSTRUCTIONS}

Your response to {asker_name}'s request about "{thread_topic}":"""


# ========================================
# THREAD SUMMARIZATION PROMPTS
# ========================================

SUMMARIZATION_INSTRUCTIONS = """Summarize this discussion in 2-3 sentences.
Highlight the main questions asked and key points discussed.
Be concise and informative."""

def get_summarization_prompt(conversation_text: str) -> str:
    """Generate prompt for thread summarization"""
    return f"""{SUMMARIZATION_INSTRUCTIONS}

Conversation:
{conversation_text}

Summary:"""


# ========================================
# CONFIGURATION
# ========================================

# AI triggers for @AI mention system
AI_TRIGGERS = ['@ai', '@ ai', '@AI', '@ AI', '@ai-assistant', '@ai-ta']

# Context limits
MAX_COURSE_TEXT_LENGTH = 20000
MAX_HISTORY_MESSAGES = 5
MAX_MESSAGE_HISTORY_LENGTH = 400
MAX_TOTAL_PROMPT_LENGTH = 30000

# Response limits based on model size
MODEL_RESPONSE_LIMITS = {
    '70b': 3000,
    '405b': 3000,
    '8b': 2000,
    '13b': 2000,
    '3b': 1500,
    '1b': 1000,
    'default': 1000
}

