#!/bin/bash

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating new virtual environment..."
    python3 -m venv venv
    echo "Created virtual environment"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Find an available port (trying 5001, 5002, etc.)
PORT=5001
while netstat -tuln | grep -q ":$PORT "; do
  echo "Port $PORT is in use, trying next port..."
  PORT=$((PORT+1))
done

# Start the server on the available port
echo "Starting Flask API server on port $PORT"
gunicorn -w 1 scholar_service:app -b 0.0.0.0:$PORT