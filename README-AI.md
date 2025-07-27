# 🤖 AI Assistant Integration - İNNO Gayrimenkul Lead Reporter

## Overview

The Lead Reporter App now includes a fully-local, open-source AI assistant that provides natural language querying capabilities for lead data analysis and automatic Chart.js visualization generation.

## Features

### 🧠 Natural Language Queries
- Ask questions in Turkish or English about your lead data
- Get instant analysis and insights
- Automatic chart generation for visual data representation

### 📊 Intelligent Visualizations  
- Pie charts for distributions (lead sources, status breakdown)
- Bar charts for comparisons (personnel performance, project stats)
- Line charts for trends (monthly lead patterns)
- Real-time data visualization with Chart.js integration

### 🔒 Fully Local & Private
- No external API calls or data sharing
- Runs entirely on your local machine using Ollama
- Complete data privacy and security

## Quick Start

### Prerequisites
1. **Ollama Installation**: Install Ollama on your machine
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **AI Model**: The system uses Llama 3.2 3B Instruct model (automatically downloaded)

### Development Setup

#### Option 1: Using the AI Development Script (Recommended)
```bash
# Run the integrated AI development environment
./scripts/dev-ai.sh
```

This script will:
- Start Ollama service
- Download the required AI model (if not present)
- Launch the application with AI capabilities enabled

#### Option 2: Manual Setup
```bash
# Start Ollama service
ollama serve &

# Pull the AI model
ollama pull llama3.2:3b-instruct-q4_0

# Start the application
npm run dev
```

### Using the AI Assistant

1. **Access**: Click the purple chat button in the bottom-right corner
2. **Query**: Type natural language questions about your lead data
3. **Analyze**: View AI-generated insights and interactive charts

### Example Queries

#### Turkish Examples:
- `"Instagram'dan gelen leadlerin kaç tanesi satış yapıldı?"`
- `"Bu ay kiralık leadlerin durum dağılımını göster"`
- `"Hangi personel en çok lead alıyor?"`
- `"Proje bazında lead sayıları nasıl?"`
- `"Son hafta Facebook leadlerinin analizi"`

#### English Examples:
- `"Show me sales conversion rate by source"`
- `"What's the rental vs sales lead distribution?"`
- `"Which sales rep has the highest performance?"`
- `"Monthly lead trends for this year"`

## Technical Architecture

### Backend Integration
- **Ollama Service** (`server/llm/ollama.ts`): Local AI model management
- **AI Routes** (`server/routes/ai.ts`): Server-sent events for streaming responses  
- **Schema Helper** (`server/llm/schema-helper.ts`): Database context for AI queries

### Frontend Components
- **ChatDrawer** (`client/src/components/ChatDrawer.tsx`): Main chat interface
- **Real-time Streaming**: Server-sent events for live AI responses
- **Chart Integration**: Automatic Chart.js visualization rendering

### API Endpoints
- `POST /api/ai/query`: Stream AI responses with charts and analysis

## Configuration

### Environment Variables
No additional environment variables required - the system runs entirely locally.

### Model Configuration
Default model: `llama3.2:3b-instruct-q4_0` (optimized for performance)

To use a different model, modify `server/llm/ollama.ts`:
```typescript
const DEFAULT_CONFIG: OllamaConfig = {
  model: 'your-preferred-model',
  baseUrl: 'http://localhost:11434',
  temperature: 0.1,
};
```

## Troubleshooting

### Common Issues

1. **"AI service unavailable" Error**
   - Ensure Ollama is running: `ollama serve`
   - Check if the model is available: `ollama list`
   - Pull the model if missing: `ollama pull llama3.2:3b-instruct-q4_0`

2. **No Response from AI**
   - Verify Ollama service is accessible at `http://localhost:11434`
   - Check browser console for network errors
   - Restart Ollama service

3. **Model Download Issues**
   - Ensure stable internet connection for initial model download
   - Model size is approximately 2GB for the 3B parameter version
   - Check available disk space

### Performance Optimization

- **Memory**: 8GB+ RAM recommended for optimal performance
- **CPU**: Multi-core processor recommended for faster inference
- **Model Size**: The 3B model provides a good balance of performance and accuracy

## Development

### Adding New Query Types
1. Extend `executeGroupByQuery()` and `executeSelectQuery()` in `server/routes/ai.ts`
2. Add new schema patterns in `server/llm/schema-helper.ts`
3. Update example queries in `ChatDrawer.tsx`

### Custom Chart Types
Modify the `renderChart()` function in `ChatDrawer.tsx` to support additional Chart.js chart types.

### Model Customization
Replace the default model with specialized models for better Turkish language support or domain-specific knowledge.

## Security Considerations

- All AI processing happens locally - no data leaves your machine
- No API keys or external services required
- Complete control over data privacy and model behavior
- Ollama service runs on localhost only

## Performance Metrics

- **Response Time**: 2-5 seconds for typical queries
- **Model Size**: 2GB for llama3.2:3b-instruct-q4_0
- **Memory Usage**: ~4GB during active inference
- **Accuracy**: High for Turkish real estate terminology and SQL generation

## Future Enhancements

- [ ] Custom model fine-tuning for real estate domain
- [ ] Multi-language support expansion
- [ ] Advanced chart types and visualizations
- [ ] Voice input capability
- [ ] Export AI analysis reports
- [ ] Predictive analytics features

## Support

For AI-specific issues:
1. Check Ollama documentation: https://ollama.ai/
2. Verify model compatibility
3. Review console logs for detailed error messages
4. Ensure sufficient system resources

The AI assistant enhances your lead analysis workflow by providing instant insights and visualizations through natural language interaction, all while maintaining complete data privacy.