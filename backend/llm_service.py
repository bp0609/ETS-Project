"""
LLM Service - Handles all Ollama AI interactions
Provides topic extraction, question answering, and thread summarization
"""

import requests
import re
from typing import List, Optional, Dict
import prompts

# Configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "llama3.2:1b"  # Fast model for development


# ========================================
# CORE OLLAMA INTERACTION
# ========================================

def get_model_response_limit(model: str) -> int:
    """Get appropriate response length based on model size"""
    model_lower = model.lower()
    
    for size, limit in prompts.MODEL_RESPONSE_LIMITS.items():
        if size in model_lower:
            return limit
    
    return prompts.MODEL_RESPONSE_LIMITS['default']


def call_ollama(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """
    Call Ollama API to generate response
    
    Args:
        prompt: Prompt to send to model
        model: Model name to use
        
    Returns:
        Generated response text
        
    Raises:
        Exception: If Ollama connection fails or times out
    """
    try:
        response_limit = get_model_response_limit(model)
        
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "num_predict": response_limit
            }
        }
        
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=120)
        response.raise_for_status()
        
        result = response.json()
        return result.get("response", "").strip()
    
    except requests.exceptions.ConnectionError:
        raise Exception("Cannot connect to Ollama. Ensure it's running: ollama serve")
    except requests.exceptions.Timeout:
        raise Exception("Ollama request timed out. Try a faster model.")
    except Exception as e:
        raise Exception(f"Ollama error: {str(e)}")


# ========================================
# TOPIC EXTRACTION
# ========================================

def parse_topics(response: str) -> List[str]:
    """Parse numbered list from LLM response"""
    topics = []
    lines = response.split("\n")
    
    for line in lines:
        line = line.strip()
        # Match: "1. Topic" or "1) Topic" or "- Topic"
        match = re.match(r'^[\d\-\*\•]+[\.\)]\s*(.+)$', line)
        if match:
            topic = match.group(1).strip()
            if topic and len(topic) > 3:
                topics.append(topic)
    
    # Fallback: split by newlines if parsing failed
    if not topics:
        topics = [line.strip() for line in lines if line.strip() and len(line.strip()) > 3]
    
    return topics


def trim_topics(topics: List[str], max_words: int = 6) -> List[str]:
    """Trim topics to maximum word count"""
    trimmed = []
    for topic in topics:
        words = topic.split()
        if len(words) > max_words:
            topic = ' '.join(words[:max_words])
        trimmed.append(topic)
    return trimmed


def extract_topics(course_text: str) -> List[str]:
    """
    Extract 2-6 key topics from course text
    
    Args:
        course_text: Full course text
        
    Returns:
        List of 2-6 topic strings (2-6 words each)
    """
    # Truncate if too long
    truncated_text = course_text[:25000] if len(course_text) > 25000 else course_text
    
    try:
        prompt = prompts.get_topic_extraction_prompt(truncated_text)
        response = call_ollama(prompt)
        
        topics = parse_topics(response)
        topics = trim_topics(topics, max_words=6)
        
        # Ensure 2-6 topics
        if len(topics) < 2:
            topics.extend(["Core Concepts", "Key Topics"][:2 - len(topics)])
        
        return topics[:6]  # Max 6 topics
    
    except Exception as e:
        print(f"Error extracting topics: {str(e)}")
        return ["Core Concepts", "Key Topics", "Main Ideas"]  # Fallback


# ========================================
# CONVERSATION HISTORY FORMATTING
# ========================================

def format_sender_name(message: Dict) -> str:
    """Format sender name with role context"""
    if message["sender_type"] == "ai":
        return "AI TA"
    elif message.get("user_name"):
        role = message.get("user_role", "student")
        name = message["user_name"]
        return f"{name} (Teacher)" if role == "teacher" else f"{name} (Student)"
    elif message["sender_type"] == "teacher":
        return "Teacher"
    else:
        return "Student"


def format_thread_history(thread_history: List[Dict]) -> str:
    """
    Format thread history with clear attribution
    
    Args:
        thread_history: List of message dictionaries
        
    Returns:
        Formatted history string
    """
    if not thread_history:
        return ""
    
    history_lines = []
    for msg in thread_history:
        sender = format_sender_name(msg)
        content = msg["content"][:prompts.MAX_MESSAGE_HISTORY_LENGTH] \
                  if len(msg["content"]) > prompts.MAX_MESSAGE_HISTORY_LENGTH \
                  else msg["content"]
        history_lines.append(f"[{sender}]: {content}")
    
    return "\n".join(history_lines)


# ========================================
# QUESTION ANSWERING
# ========================================

def answer_question(thread_topic: str, course_text: str, question: str, 
                   user_role: str = "student", 
                   thread_history: Optional[List[Dict]] = None,
                   asker_name: str = "Student") -> str:
    """
    Answer question with role-based prompt and thread history context
    
    Args:
        thread_topic: Topic of the discussion thread
        course_text: Full course text for reference
        question: User's question or request
        user_role: 'student' or 'teacher'
        thread_history: List of previous messages
        asker_name: Name of person asking
        
    Returns:
        AI-generated answer
    """
    try:
        # Truncate course text
        truncated_text = course_text[:prompts.MAX_COURSE_TEXT_LENGTH] \
                        if len(course_text) > prompts.MAX_COURSE_TEXT_LENGTH \
                        else course_text
        
        # Get last N messages for context
        history = thread_history[-prompts.MAX_HISTORY_MESSAGES:] \
                 if thread_history and len(thread_history) > prompts.MAX_HISTORY_MESSAGES \
                 else (thread_history or [])
        
        history_str = format_thread_history(history)
        
        # Generate role-appropriate prompt
        if user_role == "teacher":
            prompt = prompts.get_teacher_prompt(
                truncated_text, question, history_str, thread_topic, asker_name
            )
        else:  # Default to student
            prompt = prompts.get_student_prompt(
                thread_topic, truncated_text, question, history_str, asker_name
            )
        
        # Truncate if too long
        if len(prompt) > prompts.MAX_TOTAL_PROMPT_LENGTH:
            prompt = prompt[:prompts.MAX_TOTAL_PROMPT_LENGTH] + \
                    "\n\n[Content truncated]\n\nYour answer:"
        
        response = call_ollama(prompt)
        
        # Validate response
        if not response or len(response) < 10:
            return "I'm having trouble generating a response. Please try rephrasing."
        
        return response
    
    except Exception as e:
        return f"Error: {str(e)}. Ensure Ollama is running."


# ========================================
# @AI MENTION DETECTION
# ========================================

def should_ai_respond(message: str) -> bool:
    """
    Check if AI should respond (contains @AI mention)
    
    Args:
        message: The message content
        
    Returns:
        True if @AI mentioned, False otherwise
    """
    message_lower = message.lower()
    return any(trigger in message_lower for trigger in prompts.AI_TRIGGERS)


# ========================================
# THREAD SUMMARIZATION
# ========================================

def summarize_thread(messages: List[Dict]) -> str:
    """
    Generate summary of thread messages
    
    Args:
        messages: List of message dictionaries
        
    Returns:
        Summary text
    """
    if not messages:
        return "No messages in this thread yet."
    
    # Format messages for summary (limit to last 10)
    conversation_lines = []
    for msg in messages[:10]:
        sender = format_sender_name(msg)
        content = msg["content"][:200]  # Shorter for summary
        conversation_lines.append(f"{sender}: {content}")
    
    conversation_text = "\n".join(conversation_lines)
    
    try:
        prompt = prompts.get_summarization_prompt(conversation_text)
        response = call_ollama(prompt)
        return response if response else "Unable to generate summary."
    except Exception as e:
        return f"Summary unavailable: {str(e)}"
