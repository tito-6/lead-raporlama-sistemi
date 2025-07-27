# LeadTrackerPro 🏢

A comprehensive **Real Estate Lead Management & Analytics System** built with modern web technologies. Features advanced lead tracking, AI-powered analytics, dynamic color customization, and comprehensive reporting dashboards.

## 🚀 Features

### 📊 Advanced Analytics Dashboard
- **Interactive Charts**: Real-time pie charts, bar charts, and trend analysis
- **Lead Performance Metrics**: Comprehensive sales funnel analytics
- **Negative Reasons Analysis**: Detailed chart showing most common rejection reasons
- **Personnel Performance Tracking**: Individual salesperson analytics and KPIs

### 🎨 Dynamic Color System
- **Customizable Color Themes**: Personalize colors for personnel, statuses, and categories
- **Consistent Coloring**: Same personnel/status appears with same color across all tabs
- **Real-time Updates**: Colors sync instantly across all components
- **Smart Color Assignment**: Automatic color assignment for new data

### 🤖 AI Integration
- **Local AI Assistant**: Ollama integration for lead analysis
- **Smart Data Processing**: AI-powered insights and recommendations
- **Natural Language Queries**: Ask questions about your lead data

### 📁 Data Management
- **Excel/CSV Import**: Seamless data import with validation
- **Export Capabilities**: Export filtered data to Excel/CSV
- **Data Validation**: Automatic data cleaning and validation
- **Real-time Filtering**: Advanced filtering and search capabilities

### 📱 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Themes**: Customizable appearance
- **Interactive Components**: Hover effects, tooltips, and smooth animations
- **Accessible**: Built with accessibility best practices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui (Radix UI + Tailwind CSS)
- **Charts**: Recharts for data visualization
- **State Management**: React Query for server state
- **Backend**: Node.js, Express
- **Database**: File-based storage with JSON
- **AI**: Ollama for local AI processing

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Git

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/LeadTrackerPro.git
   cd LeadTrackerPro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🚀 Quick Start

1. **Import Data**: Use the "Excel Girişi" tab to import your lead data
2. **Customize Colors**: Go to Settings → Color Settings to personalize colors
3. **View Analytics**: Explore the "Genel Görünüm" dashboard for insights
4. **Track Performance**: Use "Satış Temsilcisi Raporu" for individual performance
5. **Analyze Negatives**: Check "Olumsuz Analizi" for rejection patterns

## 📖 Documentation

- [AI Assistant Guide](./AI-ASSISTANT-GUIDE.md) - How to use the AI features
- [User Guide](./AI-USER-GUIDE.md) - Complete user documentation
- [Implementation Guide](./AI-IMPLEMENTATION-COMPLETE.md) - Technical implementation details

## 🔄 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start backend server only

## 📊 Data Format

The system accepts Excel/CSV files with the following columns:
- Customer ID, Contact ID, Customer Name
- Phone, Email, Lead Type, Customer Source
- Office, Salesperson, Status, Meeting Type
- Dates, Notes, and custom fields

## 🎨 Customization

### Color System
- Navigate to Settings → Color Settings
- Customize colors for personnel, statuses, and categories
- Colors automatically sync across all components
- Export/import color configurations

### AI Configuration
- Local Ollama setup for privacy-focused AI
- Configurable AI models and prompts
- Real-time lead analysis and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/) for fast development
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
- AI integration with [Ollama](https://ollama.ai/)

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**LeadTrackerPro** - Transforming lead management with modern technology and AI-powered insights.
