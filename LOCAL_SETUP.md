# İNNO Gayrimenkul Lead Reporter - Local Development Setup

## 🚀 Quick Setup for VS Code

This application is configured to run completely locally in VS Code using in-memory storage. No database setup required!

### Prerequisites

- Node.js 18+
- VS Code
- Git

### Installation Steps

1. **Clone the repository:**

   ```bash
   git clone [your-repo-url]
   cd inno-lead-reporter
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5000
   ```

## 📊 Features Ready for Local Use

### ✅ Core Functionality

- **Memory Storage**: All data stored in application memory
- **Excel/CSV Import**: Upload lead files directly
- **Real-time Analytics**: Interactive dashboards and charts
- **Export System**: PDF reports with embedded charts
- **Turkish Language Support**: Full UTF-8 support for Turkish characters

### ✅ Advanced Features

- **Dual File Upload**: Main leads + Takipte follow-up files
- **Chart Export**: 10 comprehensive sections with chart capture
- **Personnel Management**: Track sales rep performance
- **Project Analytics**: Intelligent project detection
- **Status Tracking**: 37+ Turkish real estate columns

## 💾 Data Persistence

### Memory Storage

- Data persists while the application is running
- Data is reset when you restart the server
- Perfect for development and testing

### Sample Data Import

1. Go to **🧠 Akıllı Veri Girişi** tab
2. Upload your Excel/CSV files
3. The system automatically processes and stores data in memory

## 📈 Export System

### Available Export Formats

- **PDF**: Comprehensive reports with charts
- **Excel**: Structured data export
- **JSON**: Raw data for external processing

### Chart Sections Available for Export

1. 👥 Personel Atama ve Durum Özeti
2. 📊 Lead Durum Dağılımı
3. 🏠 Lead Tipi Dağılımı
4. 📈 Durum Analizi
5. ⭐ Personel Performansı
6. 🎯 Kaynak Analizi
7. 🧠 Gelişmiş Analiz
8. ❌ Olumsuz Analizi
9. Unified Takip Analizi
10. 🔍 Duplicate Analizi

## 🛠️ Development Configuration

### Environment Variables (Optional)

```bash
# For local development, these are optional
NODE_ENV=development
STORAGE_TYPE=memory
```

### File Structure

```
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared types and schema
├── LOCAL_SETUP.md         # This file
└── replit.md              # Project documentation
```

## 🔧 VS Code Configuration

### Recommended Extensions

- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint

### Launch Configuration (.vscode/launch.json)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.ts",
      "env": {
        "NODE_ENV": "development",
        "STORAGE_TYPE": "memory"
      },
      "runtimeArgs": ["-r", "tsx/cjs"],
      "console": "integratedTerminal"
    }
  ]
}
```

## 🚨 Important Notes

### Memory Storage Limitations

- Data is lost when server restarts
- Not suitable for production
- Perfect for development and testing

### Performance

- Fast startup (no database connection)
- Immediate data access
- Suitable for datasets up to 10,000 records

### Turkish Character Support

- Full UTF-8 encoding
- Proper handling of Turkish characters in filters
- Export maintains character encoding

## 📱 Application Usage

### 1. Import Data

- Use **🧠 Akıllı Veri Girişi** for dual file upload
- Main lead file + Takipte follow-up file
- System auto-detects columns and processes data

### 2. Analyze Data

- **Proje Bazlı Analiz**: Overview with key metrics
- **📊 Raporlar**: Detailed analytics and filtering
- **❌ Olumsuz Analizi**: Negative lead analysis
- **Unified Takip Analizi**: Follow-up tracking

### 3. Export Reports

- Go to **📤 Veri Aktarımı** tab
- Select **Kapsamlı İndir** for full PDF export
- Choose sections to include in report
- Download comprehensive PDF with charts

## 🆘 Troubleshooting

### Common Issues

1. **Port 5000 in use**: Change port in server/index.ts
2. **Turkish characters not showing**: Ensure UTF-8 encoding
3. **Charts not exporting**: Install canvas dependencies

### Support

- Check console for error messages
- Verify Node.js version (18+)
- Ensure all dependencies installed

## 🎯 Next Steps

1. Import your lead data files
2. Explore the dashboard analytics
3. Test the export functionality
4. Customize settings in **⚙️ Ayarlar** tab

Ready to analyze your real estate leads locally! 🏠📊
