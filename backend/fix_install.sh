#!/bin/bash

echo "🔧 Fixing Python dependencies installation..."
echo ""

# Check Python version
PYTHON_VERSION=$(python3 --version)
echo "Python version: $PYTHON_VERSION"
echo ""

# Deactivate if in venv
deactivate 2>/dev/null || true

# Remove old venv
echo "Removing old virtual environment..."
rm -rf venv

# Check if we have a compatible Python version
if command -v python3.11 &> /dev/null; then
    echo "✅ Found Python 3.11 - using it for better compatibility"
    PYTHON_CMD=python3.11
elif command -v python3.10 &> /dev/null; then
    echo "✅ Found Python 3.10 - using it for better compatibility"
    PYTHON_CMD=python3.10
elif command -v python3.9 &> /dev/null; then
    echo "✅ Found Python 3.9 - using it for better compatibility"
    PYTHON_CMD=python3.9
else
    echo "⚠️  Using default python3 (may have compatibility issues with Python 3.14)"
    PYTHON_CMD=python3
fi

# Create new venv with compatible Python
echo "Creating new virtual environment with $PYTHON_CMD..."
$PYTHON_CMD -m venv venv

# Activate
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip setuptools wheel

# Try installing with pre-built wheels only
echo "Installing dependencies (using pre-built wheels)..."
pip install --only-binary=:all: fastapi uvicorn requests python-multipart pdfplumber 2>/dev/null

# If that fails, try normal install
if [ $? -ne 0 ]; then
    echo "Trying standard installation..."
    pip install -r requirements.txt
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the backend:"
echo "  source venv/bin/activate"
echo "  python main.py"

