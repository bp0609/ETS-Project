import requests
import json
from typing import List
import re

OLLAMA_API_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "llama3.1:8b"

def get_model_response_limit(model: str) -> int:
    """
    Get appropriate response length based on model size
    
    Args:
        model: Model name
        
    Returns:
        Maximum number of tokens for response
    """
    # Extract model size from name (e.g., "llama3.1:8b" -> "8b")
    model_lower = model.lower()
    
    if "70b" in model_lower or "405b" in model_lower:
        return 3000  # Large models can generate longer, more detailed responses
    elif "8b" in model_lower or "13b" in model_lower:
        return 2000  # Medium models - good balance
    elif "3b" in model_lower:
        return 1500  # Small models
    else:
        return 1000  # Very small models (1b) or unknown

def call_ollama(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """
    Call Ollama API to generate response
    
    Args:
        prompt: Prompt to send to the model
        model: Model name to use
        
    Returns:
        Generated response text
    """
    try:
        # Get appropriate response limit based on model size
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
        raise Exception("Cannot connect to Ollama. Make sure Ollama is running on localhost:11434")
    except requests.exceptions.Timeout:
        raise Exception("Ollama request timed out. Try using a faster model.")
    except Exception as e:
        raise Exception(f"Error calling Ollama: {str(e)}")

def extract_topics(course_text: str) -> List[str]:
    """
    Extract key topics from course text using LLM
    
    Args:
        course_text: Full course text
        
    Returns:
        List of 5-10 topic strings
    """
    # Limit course text to avoid token limits (8b model has 128K context window)
    truncated_text = course_text[:25000] if len(course_text) > 25000 else course_text
    
    prompt = f"""Given this course text, extract exactly 5-10 core topics that capture the main ideas. 

IMPORTANT: Each topic name must be SHORT - between 1 to 5 words maximum.
Output only the topic names as a numbered list. No explanations or descriptions.

Examples of good topic names:
- TCP vs UDP
- OSI Model
- Network Security
- Routing Protocols

Course text:
{truncated_text}

Topics (1-5 words each):"""
    
    try:
        response = call_ollama(prompt)
        
        # Parse numbered list
        topics = []
        lines = response.split("\n")
        for line in lines:
            line = line.strip()
            # Match patterns like "1. Topic" or "1) Topic" or "- Topic"
            match = re.match(r'^[\d\-\*\•]+[\.\)]\s*(.+)$', line)
            if match:
                topic = match.group(1).strip()
                if topic and len(topic) > 3:  # Avoid very short entries
                    topics.append(topic)
        
        # If parsing failed, try splitting by newlines
        if not topics:
            topics = [line.strip() for line in lines if line.strip() and len(line.strip()) > 3]
        
        # Limit to 5-10 topics and trim to 5 words max
        shortened_topics = []
        for topic in topics:
            words = topic.split()
            if len(words) > 5:
                topic = ' '.join(words[:5])
            shortened_topics.append(topic)
        
        if len(shortened_topics) < 5:
            # Add generic topics if we didn't get enough
            generic_topics = [
                "Introduction",
                "Key Concepts",
                "Applications",
                "Definitions",
                "Summary"
            ]
            shortened_topics.extend(generic_topics[:5 - len(shortened_topics)])
        
        return shortened_topics[:10]  # Max 10 topics
    
    except Exception as e:
        # Fallback to generic topics if LLM fails
        print(f"Error extracting topics: {str(e)}")
        return [
            "Introduction",
            "Core Concepts",
            "Definitions",
            "Applications",
            "Summary"
        ]

def format_thread_history(thread_history: List[dict]) -> str:
    """
    Format thread history for context in prompt
    
    Args:
        thread_history: List of message dictionaries
        
    Returns:
        Formatted history string
    """
    if not thread_history:
        return ""
    
    history_lines = []
    for msg in thread_history:
        # Determine sender name
        if msg.get("user_name"):
            sender = msg["user_name"]
        elif msg["sender_type"] == "ai":
            sender = "AI TA" if msg.get("user_role") != "teacher" else "AI Assistant"
        elif msg["sender_type"] == "teacher":
            sender = "Teacher"
        else:
            sender = "Student"
        
        # Truncate long messages
        content = msg["content"][:300] if len(msg["content"]) > 300 else msg["content"]
        history_lines.append(f"{sender}: {content}")
    
    return "\n".join(history_lines)

def get_student_prompt(thread_topic: str, course_text: str, question: str, thread_history: List[dict]) -> str:
    """
    Generate prompt for student questions - AI acts as Teaching Assistant
    """
    truncated_text = course_text[:20000] if len(course_text) > 20000 else course_text
    
    history_str = format_thread_history(thread_history)
    
    # Structure: Role -> Course Material -> CURRENT QUESTION (emphasized) -> History as context -> Instructions
    prompt = f"""You are a friendly and helpful Teaching Assistant (TA) for a college course.

Thread topic: {thread_topic}

Course material:
{truncated_text}

=== CURRENT QUESTION (ANSWER THIS) ===
{question}
==================================="""

    # Add history AFTER the question to make it clear it's just context
    if history_str:
        prompt += f"""

Previous conversation (for context only - focus on answering the CURRENT QUESTION above):
{history_str}"""
    
    prompt += """

Instructions for your answer:
- Your PRIMARY task is to answer the CURRENT QUESTION above
- Use ONLY the course material provided
- Be clear, friendly, and beginner-friendly
- The previous conversation is just for context - don't repeat previous answers
- If the current question refers to previous messages, use that context appropriately
- Keep your answer focused (2-4 paragraphs)
- Use markdown formatting for better readability (bold, lists, code blocks if needed)

Your answer to the CURRENT QUESTION:"""
    
    return prompt

def get_teacher_prompt(course_text: str, request: str, thread_history: List[dict]) -> str:
    """
    Generate prompt for teacher requests - AI acts as Educational Assistant
    """
    truncated_text = course_text[:20000] if len(course_text) > 20000 else course_text
    
    history_str = format_thread_history(thread_history)
    
    # Structure: Role -> Course Material -> CURRENT REQUEST (emphasized) -> History as context -> Instructions
    prompt = f"""You are an intelligent Educational Assistant helping a teacher prepare course materials and assessments.

Course material:
{truncated_text}

=== CURRENT REQUEST (FULFILL THIS) ===
{request}
======================================"""

    # Add history AFTER the request
    if history_str:
        prompt += f"""

Previous conversation (for context only - focus on the CURRENT REQUEST above):
{history_str}"""
    
    prompt += """

You can help with:
- Creating quizzes and exam questions (with separate answer keys)
- Generating summaries and study guides
- Explaining concepts in different ways
- Creating assignments and problem sets
- Suggesting teaching strategies
- Analyzing course content

Instructions for your response:
- Your PRIMARY task is to fulfill the CURRENT REQUEST above
- Use the course material as your primary reference
- Be professional and thorough
- For quiz/test questions, provide answers separately at the end
- Use markdown formatting for clarity (headers, lists, bold, code blocks)
- The previous conversation is context only - focus on the NEW request
- If the request builds on previous discussion, acknowledge that appropriately

Your response to the CURRENT REQUEST:"""
    
    return prompt

def answer_question(thread_topic: str, course_text: str, question: str, 
                   user_role: str = "student", thread_history: List[dict] = None) -> str:
    """
    Answer question with role-based prompt and thread history context
    
    Args:
        thread_topic: Topic of the thread
        course_text: Full course text
        question: User's question or request
        user_role: 'student' or 'teacher'
        thread_history: List of previous messages in thread
        
    Returns:
        AI-generated answer
    """
    try:
        # Get thread history (last 5 messages for context - not too much to avoid overwhelming)
        history = thread_history[-5:] if thread_history and len(thread_history) > 5 else (thread_history or [])
        
        # Generate role-appropriate prompt
        if user_role == "teacher":
            prompt = get_teacher_prompt(course_text, question, history)
        else:  # student or any other role defaults to student
            prompt = get_student_prompt(thread_topic, course_text, question, history)
        
        # Limit total prompt length to avoid token issues
        if len(prompt) > 30000:
            prompt = prompt[:30000] + "\n\n[Content truncated for length]\n\nYour answer:"
        
        response = call_ollama(prompt)
        
        # Clean up the response
        if not response or len(response) < 10:
            return "I apologize, but I'm having trouble generating a response. Please try rephrasing your question."
        
        return response
    
    except Exception as e:
        return f"Error generating response: {str(e)}. Please make sure Ollama is running."

def summarize_thread(messages: List[dict]) -> str:
    """
    Generate summary of thread messages
    
    Args:
        messages: List of message dictionaries
        
    Returns:
        Summary text
    """
    if not messages:
        return "No messages in this thread yet."
    
    # Format messages for summary
    conversation = []
    for msg in messages[:10]:  # Limit to last 10 messages
        sender = "Student" if msg["sender_type"] == "student" else "AI Assistant"
        conversation.append(f"{sender}: {msg['content'][:200]}")
    
    conversation_text = "\n".join(conversation)
    
    prompt = f"""Summarize this discussion thread in 2-3 sentences, highlighting the main questions and key points:

{conversation_text}

Summary:"""
    
    try:
        response = call_ollama(prompt)
        return response if response else "Unable to generate summary."
    except Exception as e:
        return f"Summary unavailable: {str(e)}"

