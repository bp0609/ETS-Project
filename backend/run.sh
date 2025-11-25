#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Get local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

# Run the FastAPI server
echo "🚀 Starting IITGN Discussion Forum Backend..."
echo ""
echo "📡 Server available at:"
echo "   Local:   http://localhost:8000"
if [ ! -z "$LOCAL_IP" ]; then
    echo "   Network: http://$LOCAL_IP:8000"
fi
echo ""
echo "💡 Share the Network URL with others on the same WiFi!"
echo ""
python main.py

