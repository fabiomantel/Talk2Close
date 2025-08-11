# Hebrew Sales Call Analysis System

An AI-powered system for analyzing Hebrew voice recordings of real estate sales calls to prioritize customers for deal closure.

## 🚀 Features

- **Hebrew Speech-to-Text**: OpenAI Whisper API integration with Hebrew language support
- **File Upload System**: Secure audio file upload with validation
- **Customer Management**: Complete CRM functionality for sales leads
- **Scoring Algorithm**: Multi-factor analysis (Urgency, Budget, Interest, Engagement)
- **Dashboard Analytics**: Real-time statistics and insights
- **Data Export**: CSV and JSON export capabilities
- **RESTful API**: Complete API for frontend integration

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Prisma ORM
- **AI/ML**: OpenAI Whisper API
- **File Storage**: Local storage (S3 ready for production)
- **Testing**: Jest for unit and integration tests
- **Security**: Helmet, CORS, Rate limiting

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- OpenAI API key

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd hebrew-sales-call-analysis
npm install
```

### 2. Environment Setup

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@your-db-host:5432/hebrew_sales_analysis"

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/mp3,audio/mp4

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
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

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on the configured port (default: 3000). Check the console output for the exact URL.

## 📚 API Documentation

### Health Check
```http
GET /health
```

### File Upload
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

### Analysis
```http
POST /api/analyze
Content-Type: application/json

{
  "salesCallId": 1
}
```

### Customers
```http
GET /api/customers
GET /api/customers/prioritized
GET /api/customers/:id
POST /api/customers
PUT /api/customers/:id
DELETE /api/customers/:id
```

### Dashboard
```http
GET /api/dashboard/stats
GET /api/dashboard/export?format=csv
GET /api/dashboard/analytics?period=30
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📁 Project Structure

```
├── src/
│   ├── server.js              # Main server file
│   ├── database/
│   │   └── connection.js      # Database connection
│   ├── middleware/
│   │   └── fileUpload.js      # File upload middleware
│   ├── routes/
│   │   ├── fileUpload.js      # File upload routes
│   │   ├── analysis.js        # Analysis routes
│   │   ├── customers.js       # Customer routes
│   │   └── dashboard.js       # Dashboard routes
│   └── services/
│       └── whisperService.js  # Whisper API service
├── prisma/
│   └── schema.prisma          # Database schema
├── tests/
│   ├── setup.js              # Test setup
│   └── basic.test.js         # Basic tests
├── uploads/                  # Audio file storage
├── package.json
├── jest.config.js
└── README.md
```

## 🔧 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

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

## 📊 Scoring System

The system analyzes sales calls using four weighted factors:

1. **Urgency Score (30%)**: Time pressure indicators
2. **Budget Clarity Score (25%)**: Financial readiness signals
3. **Property Interest Score (25%)**: Engagement with specific properties
4. **Engagement Score (20%)**: Overall participation level

Overall Score = (Urgency × 0.3) + (Budget × 0.25) + (Interest × 0.25) + (Engagement × 0.2)

## 🌐 Hebrew Language Support

- **Whisper API**: Configured for Hebrew language (`language: "he"`)
- **RTL Support**: Ready for Right-to-Left text display
- **Hebrew Phrases**: Pre-configured Hebrew phrase detection for scoring

## 🚀 Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up file storage (S3 recommended)
4. Configure environment variables
5. Set up reverse proxy (nginx)
6. Configure SSL certificates

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Monitoring

- **Health Check**: `/health` endpoint for monitoring
- **Logging**: Morgan for HTTP request logging
- **Error Tracking**: Comprehensive error logging
- **Performance**: Response time monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the system design document

## 🔄 Roadmap

- [ ] Phase 2: Advanced scoring algorithm
- [ ] Phase 3: Machine learning integration
- [ ] Phase 4: CRM system integration
- [ ] Phase 5: Mobile application
- [ ] Phase 6: Multi-language support

---

**Note**: This is Phase 1 implementation. See `SYSTEM_DESIGN.md` for complete system architecture and future phases. 