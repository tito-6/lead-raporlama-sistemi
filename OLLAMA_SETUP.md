# 🚀 Ollama Setup Guide for AI Assistant

## Quick Setup Steps

### 1. Install Ollama
```bash
# For Linux/macOS
curl -fsSL https://ollama.ai/install.sh | sh

# For Windows
# Download from: https://ollama.ai/download
```

### 2. Start Ollama Service
```bash
# Start the Ollama service (runs in background)
ollama serve
```

### 3. Pull the AI Model
```bash
# Download the Llama 3.2 3B model (this will take a few minutes)
ollama pull llama3.2:3b-instruct-q4_0
```

### 4. Verify Installation
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# List available models
ollama list
```

## Using the Development Script

For the easiest setup, use our integrated development script:

```bash
# This script will automatically:
# - Check if Ollama is installed
# - Start the Ollama service
# - Pull the required model
# - Start the application
./scripts/dev-ai.sh
```

## Alternative Models

If you want to use a different model, you can modify the configuration:

```bash
# Smaller model (faster, less accurate)
ollama pull llama3.2:1b-instruct-q4_0

# Larger model (slower, more accurate)
ollama pull llama3.2:8b-instruct-q4_0
```

Then update `server/llm/ollama.ts`:
```typescript
const DEFAULT_CONFIG: OllamaConfig = {
  model: 'llama3.2:1b-instruct-q4_0', // or your preferred model
  baseUrl: 'http://localhost:11434',
  temperature: 0.1,
};
```

## Troubleshooting

### Port 11434 Already in Use
```bash
# Kill any existing Ollama processes
pkill -f ollama

# Start Ollama again
ollama serve
```

### Model Download Issues
- Ensure you have a stable internet connection
- The 3B model is approximately 2GB in size
- Check available disk space (need at least 4GB free)

### Performance Issues
- Minimum 8GB RAM recommended
- For better performance, use a model size that fits your system:
  - 4GB RAM: Use 1B model
  - 8GB RAM: Use 3B model
  - 16GB+ RAM: Use 8B model

## Testing the AI Assistant

Once Ollama is running, you can test these Turkish queries:

1. **Lead Source Analysis**: "Instagram'dan gelen leadlerin durumu nasıl?"
2. **Sales Performance**: "Satış yapılan leadlerin sayısı nedir?"
3. **Personnel Analysis**: "Hangi personel en çok lead alıyor?"
4. **Project Distribution**: "Proje bazında lead dağılımı göster"

## System Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 4GB free space for models
- **CPU**: Multi-core processor recommended
- **Network**: Internet connection for initial model download

## Security Notes

- All AI processing happens locally on your machine
- No data is sent to external servers
- Ollama runs only on localhost (127.0.0.1)
- Complete data privacy and security