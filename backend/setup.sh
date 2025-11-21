#!/bin/bash

echo "🔧 Setting up IITGN Discussion Forum Backend..."

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Backend setup complete!"
echo ""
echo "To start the backend, run:"
echo "  source venv/bin/activate"
echo "  python main.py"

