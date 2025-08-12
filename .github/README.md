# Talk2Close - Hebrew Sales Call Analysis System

An AI-powered platform for analyzing Hebrew voice recordings of real estate sales calls to prioritize customers for deal closure. The system provides comprehensive analysis, scoring, and customer management capabilities with advanced GPT-4 integration.

## 🚀 Current Status

**Production Deployment**: ✅ Live at [https://talk2close.fly.dev](https://talk2close.fly.dev)  
**Frontend**: ✅ Deployed on Vercel  
**Database**: ✅ PostgreSQL on Fly.io  
**Status**: Phase 2 Complete - Enhanced Analysis & Configuration Management

## ✨ Implemented Features

### Core System ✅
- **Hebrew Speech-to-Text**: OpenAI Whisper API with Hebrew language optimization
- **File Upload System**: Secure audio file upload with validation and processing
- **Customer Management**: Complete CRM functionality with edit/delete capabilities
- **Audio Playback**: Integrated audio player for call review
- **Dashboard Analytics**: Real-time statistics and performance insights
- **RESTful API**: Comprehensive API with 20+ endpoints

### Enhanced Analysis System ✅
- **GPT-4 Integration**: Advanced context-aware analysis with Hebrew language understanding
- **Multi-Factor Scoring**: 4-factor algorithm (Urgency, Budget, Interest, Engagement)
- **Sentiment Analysis**: Hebrew-specific sentiment detection with confidence scoring
- **Conversation Flow Analysis**: Phase identification and speaker role detection
- **Objection Analysis**: Automatic objection detection and strength categorization
- **Context Insights**: AI-powered recommendations and insights

### Configuration Management ✅
- **Dynamic Scoring Weights**: Real-time adjustment of scoring algorithm parameters
- **Hebrew Phrase Management**: Custom phrase libraries for different scoring categories
- **Configuration Versioning**: Save, load, and manage multiple configurations
- **Import/Export**: Configuration backup and sharing capabilities

### Debug & Monitoring ✅
- **Debug Dashboard**: Real-time pipeline monitoring and performance tracking
- **Session Tracking**: Complete analysis session lifecycle monitoring
- **Performance Metrics**: Detailed timing and resource usage analytics
- **Error Tracking**: Comprehensive error logging and debugging tools

### Frontend Interface ✅
- **React 19 + TypeScript**: Modern, type-safe frontend architecture
- **Responsive Design**: Mobile-first design with Hebrew RTL support
- **Real-time Updates**: Live data updates and progress indicators
- **Enhanced Analysis Display**: Rich visualization of GPT-4 analysis results
- **Configuration Panel**: Intuitive interface for system configuration

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+ with Express.js
- **Database**: PostgreSQL 12+ with Prisma ORM
- **AI Services**: OpenAI Whisper API + GPT-4 API
- **File Storage**: Local storage with S3-ready architecture
- **Security**: Helmet, CORS, Rate limiting, Input validation
- **Testing**: Jest with comprehensive test suite

### Frontend
- **Framework**: React 19+ with TypeScript
- **State Management**: TanStack React Query
- **UI Framework**: Tailwind CSS with Headless UI
- **Routing**: React Router DOM
- **Audio**: React H5 Audio Player
- **Charts**: Recharts for data visualization
- **Icons**: Heroicons + Lucide React

### Infrastructure
- **Backend Hosting**: Fly.io with Docker containerization
- **Frontend Hosting**: Vercel with automatic deployments
- **Database**: Fly.io PostgreSQL with automated backups
- **File Storage**: Fly.io persistent volumes
- **CI/CD**: GitHub Actions (configured)

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Vercel)                       │
│                    React 19 + TypeScript                        │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Dashboard │  │    Upload   │  │  Customers  │            │
│  │   Analytics │  │   Analysis  │  │ Management  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Analysis   │  │Configuration│  │    Debug    │            │
│  │   Results   │  │  Management │  │  Dashboard  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend (Fly.io)                        │
│                      Node.js + Express                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    API Layer                                │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │ File Upload │ │  Analysis   │ │  Customers  │          │ │
│  │  │   Routes    │ │   Routes    │ │   Routes    │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │  Dashboard  │ │Configuration│ │    Audio    │          │ │
│  │  │   Routes    │ │   Routes    │ │   Routes    │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  Core Services                              │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │   Whisper   │ │   Scoring   │ │  Enhanced   │          │ │
│  │  │   Service   │ │   Service   │ │  Analysis   │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │Configuration│ │    Debug    │ │   GPT-4     │          │ │
│  │  │   Service   │ │  Tracking   │ │  Analysis   │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Database                                 │ │
│  │                  (PostgreSQL)                               │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │  Customers  │ │ Sales Calls │ │  Customer   │          │ │
│  │  │    Table    │ │   Table     │ │ Priorities  │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  │  ┌─────────────┐                                          │ │
│  │  │Scoring Config│                                          │ │
│  │  │   Table     │                                          │ │
│  │  └─────────────┘                                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   External      │
                       │   Services      │
                       │   (OpenAI)      │
                       └─────────────────┘
```

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- OpenAI API key (for Whisper and GPT-4)
- Fly.io account (for deployment)
- Vercel account (for frontend deployment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd Talk2Close
npm install
cd frontend && npm install
```

### 2. Environment Setup

Copy the environment templates and configure your settings:

```bash
# Backend environment
cp env.example .env

# Frontend environment
cd frontend
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@your-db-host:5432/talk2close"

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/mp3,audio/mp4

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Debug Configuration
DEBUG_TRACKING=true
```

Edit `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_BACKEND_URL=http://localhost:3000
REACT_APP_NAME=Hebrew Sales Call Analysis
REACT_APP_ENVIRONMENT=development
REACT_APP_DEFAULT_LOCALE=he-IL
REACT_APP_RTL_SUPPORT=true
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed
```

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm start
```

The backend will start on port 3000 and frontend on port 3001.

## 📚 API Documentation

### Core Endpoints

#### Health Check
```http
GET /health
GET /api/health
```

#### File Upload
```http
POST /api/upload
Content-Type: multipart/form-data

{
  "audio": <audio_file>,
  "customerName": "שם הלקוח",
  "customerPhone": "050-1234567",
  "customerEmail": "customer@example.com"
}
```

#### Analysis
```http
POST /api/analyze
Content-Type: application/json

{
  "salesCallId": 1,
  "useEnhancedAnalysis": true
}
```

#### Customers
```http
GET /api/customers
GET /api/customers/prioritized
GET /api/customers/:id
POST /api/customers
PUT /api/customers/:id
DELETE /api/customers/:id
```

#### Configuration
```http
GET /api/configuration
POST /api/configuration
PUT /api/configuration/:id
DELETE /api/configuration/:id
POST /api/configuration/:id/activate
```

#### Dashboard
```http
GET /api/dashboard/stats
GET /api/dashboard/analytics?period=30
GET /api/dashboard/export?format=csv
```

#### Audio
```http
GET /api/audio/:salesCallId
```

#### Debug (Development Only)
```http
GET /api/debug/sessions
GET /api/debug/metrics
GET /api/debug/status
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/analysis.test.js
```

**Current Test Status**: 88 passed, 53 failed (test suite needs maintenance)

## 📁 Project Structure

```
Talk2Close/
├── src/                          # Backend source code
│   ├── server.js                 # Main server file
│   ├── database/
│   │   └── connection.js         # Database connection
│   ├── middleware/
│   │   └── fileUpload.js         # File upload middleware
│   ├── routes/                   # API routes
│   │   ├── fileUpload.js         # File upload routes
│   │   ├── analysis.js           # Analysis routes
│   │   ├── customers.js          # Customer routes
│   │   ├── dashboard.js          # Dashboard routes
│   │   ├── configuration.js      # Configuration routes
│   │   ├── audio.js              # Audio serving routes
│   │   └── debug.js              # Debug routes
│   └── services/                 # Core services
│       ├── whisperService.js     # Whisper API service
│       ├── scoringService.js     # Scoring algorithm
│       ├── enhancedScoringService.js # Enhanced scoring
│       ├── gpt4AnalysisService.js # GPT-4 analysis
│       ├── configurationService.js # Configuration management
│       └── debugTrackingService.js # Debug tracking
├── frontend/                     # Frontend application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── common/           # Shared components
│   │   │   ├── upload/           # Upload components
│   │   │   ├── analysis/         # Analysis components
│   │   │   ├── customers/        # Customer components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   └── configuration/    # Configuration components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API services
│   │   ├── hooks/                # Custom hooks
│   │   └── utils/                # Utility functions
│   ├── package.json
│   └── vercel.json               # Vercel deployment config
├── prisma/
│   └── schema.prisma             # Database schema
├── tests/                        # Test files
├── uploads/                      # Audio file storage
├── project-documentation/        # Project documentation
├── fly.toml                      # Fly.io deployment config
├── Dockerfile                    # Docker configuration
├── package.json
└── README.md
```

## 🔧 Development

### Available Scripts

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

#### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: This will delete all data)
npx prisma migrate reset

# Open Prisma Studio for database management
npm run db:studio
```

## 🔒 Security Features

- **Input Validation**: Express-validator for all inputs
- **File Upload Security**: File type and size validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Error Handling**: Comprehensive error handling without exposing sensitive data
- **Environment Protection**: Debug endpoints only available in development

## 📊 Enhanced Scoring System

The system analyzes sales calls using an advanced 4-factor algorithm with GPT-4 enhancement:

### Traditional Scoring
1. **Urgency Score (30%)**: Time pressure indicators
2. **Budget Clarity Score (25%)**: Financial readiness signals
3. **Property Interest Score (25%)**: Engagement with specific properties
4. **Engagement Score (20%)**: Overall participation level

### Enhanced Analysis (GPT-4)
- **Sentiment Analysis**: Hebrew-specific sentiment detection
- **Conversation Flow**: Phase identification and progression
- **Speaker Analysis**: Customer vs agent role identification
- **Objection Analysis**: Automatic objection detection and categorization
- **Context Insights**: AI-powered recommendations and insights

### Scoring Formula
```
Enhanced Score = Traditional Score × Context Multiplier × Confidence Multiplier
```

## 🌐 Hebrew Language Support

- **Whisper API**: Configured for Hebrew language (`language: "he"`)
- **GPT-4 Analysis**: Hebrew-specific prompts and context understanding
- **RTL Support**: Complete Right-to-Left text display support
- **Hebrew Phrases**: Comprehensive phrase library for scoring
- **Cultural Context**: Hebrew-specific conversation patterns and cultural nuances

## 🚀 Deployment

### Production Environment

#### Backend (Fly.io)
- **URL**: https://talk2close.fly.dev
- **Region**: Frankfurt (fra)
- **Resources**: 1 CPU, 512MB RAM
- **Storage**: Persistent volume for uploads
- **Database**: Fly.io PostgreSQL

#### Frontend (Vercel)
- **URL**: https://talk2close-frontend.vercel.app
- **Framework**: Create React App
- **Build**: Automatic from main branch
- **Environment**: Production configuration

### Deployment Commands

```bash
# Deploy backend to Fly.io
fly deploy

# Deploy frontend to Vercel
cd frontend
vercel --prod
```

## 📈 Monitoring & Analytics

- **Health Checks**: `/health` and `/api/health` endpoints
- **Debug Dashboard**: Real-time pipeline monitoring
- **Performance Metrics**: Detailed timing and resource usage
- **Error Tracking**: Comprehensive error logging
- **Session Tracking**: Complete analysis session lifecycle

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run the test suite (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the system design documents in `project-documentation/`
- Check the debug dashboard for system status

## 🔄 Development Roadmap

### ✅ Completed Phases
- **Phase 1**: Core system with basic scoring
- **Phase 2**: Enhanced analysis with GPT-4 integration
- **Phase 2.5**: Configuration management system
- **Phase 2.6**: Debug and monitoring system

### 🔄 Current Development
- **Phase 3**: User research and validation (P0 priority)
- **Phase 4**: User authentication and security (P1 priority)
- **Phase 5**: Advanced analytics and reporting (P1 priority)

### 📋 Planned Features
- **User Authentication**: JWT-based authentication system
- **Advanced Analytics**: Trend analysis and predictive insights
- **Mobile Application**: React Native mobile app
- **CRM Integration**: Salesforce, HubSpot integrations
- **Multi-language Support**: Additional language support
- **API Rate Limiting**: Advanced rate limiting and billing
- **Enterprise Features**: Multi-tenant architecture

## 📊 Project Metrics

- **Lines of Code**: ~15,000+ (Backend: ~8,000, Frontend: ~7,000)
- **API Endpoints**: 20+ RESTful endpoints
- **Database Tables**: 4 core tables with relationships
- **Test Coverage**: 88 passing tests (needs maintenance)
- **Deployment**: Production-ready on Fly.io and Vercel
- **Documentation**: Comprehensive system design and implementation docs

---

**Current Version**: 2.0  
**Last Updated**: December 19, 2024  
**Status**: Production Ready with Enhanced Analysis Features  
**Next Milestone**: User Research & Validation (P0 Priority) 