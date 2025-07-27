#!/bin/bash

# Development script to start Ollama and then the main app
echo "🚀 Starting AI-powered Lead Assistant Development Environment"

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Please install Ollama first:"
    echo "   curl -fsSL https://ollama.ai/install.sh | sh"
    exit 1
fi

# Start Ollama service in background if not running
if ! pgrep -x "ollama" > /dev/null; then
    echo "🔄 Starting Ollama service..."
    ollama serve &
    OLLAMA_PID=$!
    
    # Wait for Ollama to start
    echo "⏳ Waiting for Ollama to initialize..."
    sleep 5
fi

# Pull the required model if not available
echo "📦 Checking for required AI model..."
if ! ollama list | grep -q "llama3.2:3b-instruct-q4_0"; then
    echo "⬇️ Pulling Llama 3.2 3B Instruct model (this may take a few minutes)..."
    ollama pull llama3.2:3b-instruct-q4_0
fi

echo "✅ AI model ready!"

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    if [ ! -z "$OLLAMA_PID" ]; then
        kill $OLLAMA_PID 2>/dev/null
    fi
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

echo "🌟 Starting the Lead Tracking Application with AI Assistant..."
echo "💡 The AI chat button will appear in the bottom-right corner"
echo "🔗 Access the app at: http://localhost:5000"
echo ""
echo "📝 Example AI queries you can try:"
echo "   • 'Instagram'dan gelen leadlerin kaç tanesi satış yapıldı?"
echo "   • 'Bu ay kiralık leadlerin durum dağılımını göster'"
echo "   • 'Hangi personel en çok lead alıyor?'"
echo "   • 'Proje bazında lead sayıları nasıl?'"
echo ""

# Start the main application
npm run dev