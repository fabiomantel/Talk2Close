---
title: Hebrew Sales Call Analysis System - Complete System Design Specification
description: Comprehensive system design specification serving as a living document for feature development and system evolution
feature: Hebrew Sales Call Analysis System
last-updated: 2024-12-19
version: 2.0
related-files: 
  - architecture-output.md
  - product-manager-output.md
  - product-backlog.md
dependencies: None
status: active
---

# Hebrew Sales Call Analysis System - Complete System Design Specification

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Overview](#architecture-overview)
4. [Current Implementation Status](#current-implementation-status)
5. [Database Design](#database-design)
6. [API Design](#api-design)
7. [Frontend Architecture](#frontend-architecture)
8. [Core Services](#core-services)
9. [Security & Performance](#security--performance)
10. [Deployment Architecture](#deployment-architecture)
11. [Feature Roadmap](#feature-roadmap)
12. [Development Guidelines](#development-guidelines)
13. [Testing Strategy](#testing-strategy)
14. [Monitoring & Observability](#monitoring--observability)
15. [Configuration Management](#configuration-management)

---

## Executive Summary

### System Purpose
The Hebrew Sales Call Analysis System is an AI-powered platform designed to analyze Hebrew voice recordings of real estate sales calls, automatically score customer potential, and prioritize follow-up efforts to increase deal closure rates.

### Key Value Propositions
- **80% reduction** in manual analysis time
- **20% improvement** in deal closure rates through better prioritization
- **Hebrew-specific** AI analysis with cultural context understanding
- **Real-time insights** for sales team decision making

### Target Users
- **Primary**: Real estate sales agents and managers in Israel
- **Secondary**: Sales team leaders and operations managers
- **Demographics**: Hebrew-speaking sales professionals, 25-55 years old

---

## System Overview

### Core Functionality
1. **Audio Processing**: Upload and transcribe Hebrew sales calls
2. **AI Analysis**: Multi-factor scoring algorithm with Hebrew language understanding
3. **Customer Management**: Complete CRM functionality for sales leads
4. **Prioritization Engine**: Automated customer ranking based on analysis results
5. **Dashboard Analytics**: Real-time insights and performance metrics
6. **Configuration Management**: Dynamic system configuration without redeployment

### System Boundaries
- **Input**: Hebrew audio files (MP3, WAV, M4A, AAC, OGG)
- **Processing**: AI-powered transcription and analysis
- **Output**: Customer scores, prioritization rankings, and actionable insights
- **Integration**: RESTful API for frontend and potential third-party integrations

---

## Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend                                 │
│                    (React/TypeScript)                           │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Dashboard │  │    Upload   │  │  Customers  │            │
│  │   Analytics │  │   Analysis  │  │ Management  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend                                  │
│                      (Node.js)                                  │
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
│  │  │Configuration│ │    Debug    │ │   File      │          │ │
│  │  │   Service   │ │  Tracking   │ │ Processing  │          │ │
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

### Technology Stack

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 12+ with Prisma ORM
- **AI Services**: OpenAI Whisper API
- **File Storage**: Local storage (S3-ready for production)
- **Security**: Helmet, CORS, Rate limiting
- **Testing**: Jest, Supertest

#### Frontend
- **Framework**: React 19+ with TypeScript
- **State Management**: TanStack React Query
- **UI Framework**: Tailwind CSS
- **Routing**: React Router DOM
- **Audio**: React H5 Audio Player
- **Charts**: Recharts
- **Icons**: Heroicons, Lucide React

#### Infrastructure
- **Containerization**: Docker
- **Deployment**: Fly.io
- **Database Hosting**: Fly.io PostgreSQL
- **Frontend Hosting**: Vercel
- **CI/CD**: GitHub Actions (planned)

---

## Current Implementation Status

### ✅ **Fully Implemented Features**

#### 1. Core Backend Infrastructure
- **Server Setup**: Express.js with comprehensive middleware stack
- **Database Integration**: PostgreSQL with Prisma ORM
- **API Structure**: RESTful endpoints with proper error handling
- **Security**: Helmet, CORS, rate limiting, input validation
- **File Upload**: Multer middleware with validation and processing

#### 2. AI & Analysis Services
- **Whisper Integration**: Hebrew language transcription
- **Scoring Algorithm**: 4-factor analysis (Urgency, Budget, Interest, Engagement)
- **Enhanced Analysis**: GPT-4 powered detailed analysis
- **Configuration Service**: Dynamic scoring weights and phrases

#### 3. Database Schema
```sql
-- Core tables implemented
customers (id, name, phone, email, created_at)
sales_calls (id, customer_id, audio_file_path, transcript, scores, analysis_data)
customer_priorities (customer_id, total_calls, avg_score, priority_rank)
scoring_configurations (id, name, weights, phrases, is_active)
```

#### 4. API Endpoints
- **File Upload**: `POST /api/upload`
- **Analysis**: `POST /api/analyze`
- **Customers**: `GET/POST/PUT/DELETE /api/customers`
- **Dashboard**: `GET /api/dashboard/*`
- **Audio**: `GET /api/audio/*`
- **Configuration**: `GET/POST/PUT /api/configuration`
- **Debug**: `GET /api/debug/*` (development only)

#### 5. Frontend Components
- **Pages**: Dashboard, Upload, Customers, Analysis, Configuration, Debug
- **Components**: Modular architecture with proper separation
- **State Management**: React Query for server state
- **UI**: Responsive design with Tailwind CSS

### 🔄 **Partially Implemented Features**

#### 1. User Experience
- Basic error handling implemented
- Progress indicators for file upload
- Responsive design foundation
- **Missing**: Advanced error recovery, user onboarding, mobile optimization

#### 2. Analytics & Reporting
- Basic dashboard statistics
- Customer prioritization
- **Missing**: Advanced analytics, export functionality, custom reports

#### 3. Security
- Basic authentication structure
- Input validation
- **Missing**: User authentication, role-based access, audit logging

### ❌ **Not Yet Implemented Features**

#### 1. User Research & Validation (P0)
- User interviews and persona development
- Workflow analysis and pain point identification
- MVP scope refinement based on user feedback

#### 2. Advanced Features (P1-P2)
- User authentication and authorization
- Advanced analytics and reporting
- Mobile application
- CRM integrations
- Multi-language support

---

## Database Design

### Schema Overview

#### Core Tables

```sql
-- Customer management
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sales call records
CREATE TABLE sales_calls (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  audio_file_path VARCHAR(255) NOT NULL,
  transcript TEXT,
  urgency_score INTEGER,
  budget_score INTEGER,
  interest_score INTEGER,
  engagement_score INTEGER,
  overall_score INTEGER,
  analysis_notes TEXT,
  sentiment_score DECIMAL(3,2),
  conversation_phases JSONB,
  speaker_analysis JSONB,
  objection_analysis JSONB,
  context_insights JSONB,
  analysis_confidence DECIMAL(3,2),
  enhanced_notes TEXT,
  analysis_version VARCHAR(20),
  gpt4_analysis_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer prioritization
CREATE TABLE customer_priorities (
  customer_id INTEGER PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  total_calls INTEGER NOT NULL,
  avg_overall_score DECIMAL(5,2) NOT NULL,
  last_call_date TIMESTAMP NOT NULL,
  priority_rank INTEGER NOT NULL
);

-- Dynamic configuration
CREATE TABLE scoring_configurations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  weights JSONB NOT NULL,
  phrases JSONB NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Data Relationships
- **One-to-Many**: Customer → Sales Calls
- **One-to-One**: Customer → Customer Priority
- **Independent**: Scoring Configurations

### Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX idx_sales_calls_customer_id ON sales_calls(customer_id);
CREATE INDEX idx_sales_calls_created_at ON sales_calls(created_at);
CREATE INDEX idx_sales_calls_overall_score ON sales_calls(overall_score);
CREATE INDEX idx_customer_priorities_rank ON customer_priorities(priority_rank);
```

---

## API Design

### RESTful API Structure

#### Base URL
```
Production: https://talk2close.fly.dev/api
Development: http://localhost:3000/api
```

#### Authentication
```http
Authorization: Bearer <token>
Content-Type: application/json
```

#### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-12-19T10:00:00Z"
}
```

### Core Endpoints

#### 1. File Upload
```http
POST /api/upload
Content-Type: multipart/form-data

{
  "audio": <file>,
  "customerName": "שם הלקוח",
  "customerPhone": "050-1234567",
  "customerEmail": "customer@example.com"
}
```

#### 2. Analysis
```http
POST /api/analyze
Content-Type: application/json

{
  "salesCallId": 1,
  "useEnhancedAnalysis": true
}
```

#### 3. Customers
```http
GET /api/customers
GET /api/customers/prioritized
GET /api/customers/:id
POST /api/customers
PUT /api/customers/:id
DELETE /api/customers/:id
```

#### 4. Dashboard
```http
GET /api/dashboard/stats
GET /api/dashboard/analytics?period=30
GET /api/dashboard/export?format=csv
```

#### 5. Configuration
```http
GET /api/configuration
POST /api/configuration
PUT /api/configuration/:id
```

### Error Handling
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file format",
    "details": {
      "field": "audio",
      "value": "document.pdf",
      "expected": "audio/*"
    }
  },
  "timestamp": "2024-12-19T10:00:00Z"
}
```

---

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── common/           # Reusable components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── upload/           # Upload-specific components
│   │   ├── FileUpload.tsx
│   │   ├── CustomerForm.tsx
│   │   └── UploadProgress.tsx
│   ├── analysis/         # Analysis components
│   │   ├── AnalysisList.tsx
│   │   ├── AnalysisDetails.tsx
│   │   └── ScoreBreakdown.tsx
│   ├── customers/        # Customer management
│   │   ├── CustomerList.tsx
│   │   ├── CustomerCard.tsx
│   │   └── CustomerFilters.tsx
│   └── dashboard/        # Dashboard components
│       ├── StatsCards.tsx
│       ├── ScoreChart.tsx
│       └── RecentActivity.tsx
├── pages/                # Page components
│   ├── Dashboard.tsx
│   ├── Upload.tsx
│   ├── Customers.tsx
│   ├── Analysis.tsx
│   └── Configuration.tsx
├── services/             # API services
│   └── api.ts
├── hooks/                # Custom hooks
├── utils/                # Utility functions
└── config/               # Configuration
    └── environment.ts
```

### State Management
- **Server State**: TanStack React Query
- **Local State**: React useState/useReducer
- **Form State**: React Hook Form (planned)
- **Global State**: Context API (if needed)

### Routing
```typescript
// Route structure
/                    # Dashboard
/upload             # File upload
/customers          # Customer management
/analysis           # Analysis results
/configuration      # System configuration
/debug              # Debug dashboard (dev only)
```

---

## Core Services

### 1. Whisper Service
**Purpose**: Hebrew audio transcription
**Key Features**:
- Hebrew language specification
- Audio format validation
- Error handling and retry logic
- Transcription quality assessment

### 2. Scoring Service
**Purpose**: Multi-factor customer analysis
**Algorithm**:
```javascript
Overall Score = (Urgency × 0.3) + (Budget × 0.25) + (Interest × 0.25) + (Engagement × 0.2)
```

**Factors**:
- **Urgency (30%)**: Time pressure indicators
- **Budget (25%)**: Financial readiness signals
- **Interest (25%)**: Property engagement level
- **Engagement (20%)**: Overall participation

### 3. Enhanced Analysis Service
**Purpose**: GPT-4 powered detailed analysis
**Features**:
- Conversation phase identification
- Speaker analysis and sentiment
- Objection detection and analysis
- Context insights and recommendations

### 4. Configuration Service
**Purpose**: Dynamic system configuration
**Features**:
- Scoring weights management
- Hebrew phrase libraries
- System parameters
- A/B testing support

### 5. Debug Tracking Service
**Purpose**: Development and debugging support
**Features**:
- Request/response logging
- Performance metrics
- Error tracking
- System health monitoring

---

## Security & Performance

### Security Measures

#### 1. Input Validation
- Express-validator for all inputs
- File type and size validation
- SQL injection prevention via Prisma
- XSS protection via Helmet

#### 2. Rate Limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

#### 3. CORS Configuration
```javascript
const corsOptions = {
  origin: ['https://talk2close.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

#### 4. File Upload Security
- File type validation
- Size limits
- Virus scanning (planned)
- Secure storage paths

### Performance Optimization

#### 1. Database
- Connection pooling
- Query optimization
- Proper indexing
- Caching strategy (planned)

#### 2. API
- Response compression
- Pagination for large datasets
- Efficient error handling
- Request/response logging

#### 3. Frontend
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization

---

## Deployment Architecture

### Production Environment

#### Backend (Fly.io)
```yaml
# fly.toml configuration
app = "talk2close"
primary_region = "fra"

[env]
  NODE_ENV = "production"
  PORT = "3000"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512

[mounts]
  source = "talk2close_data"
  destination = "/app/uploads"
```

#### Frontend (Vercel)
- Automatic deployments from main branch
- Preview deployments for pull requests
- Global CDN distribution
- Automatic HTTPS

#### Database (Fly.io PostgreSQL)
- Managed PostgreSQL instance
- Automated backups
- Connection pooling
- Monitoring and alerting

### Development Environment
- Local development with Docker Compose
- Hot reloading for both frontend and backend
- Local PostgreSQL database
- Environment-specific configurations

### CI/CD Pipeline (Planned)
```yaml
# GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Fly.io
        run: fly deploy
```

---

## Feature Roadmap

### Phase 1: Foundation (✅ Complete)
- [x] Core backend infrastructure
- [x] Database schema and migrations
- [x] Basic API endpoints
- [x] File upload and processing
- [x] Hebrew transcription
- [x] Basic scoring algorithm
- [x] Frontend foundation
- [x] Deployment setup

### Phase 2: User Research & Validation (🔄 In Progress)
- [ ] **BL-001**: User Research & Validation (P0)
- [ ] **BL-002**: MVP Scope Refinement (P0)
- [ ] **BL-003**: Enhanced Error Handling (P1)
- [ ] **BL-004**: User Authentication (P1)

### Phase 3: Enhanced User Experience (📋 Planned)
- [ ] **BL-005**: Advanced Analytics Dashboard (P1)
- [ ] **BL-006**: Mobile Responsive Design (P1)
- [ ] **BL-007**: Export & Reporting (P2)
- [ ] **BL-008**: User Onboarding (P2)

### Phase 4: Advanced Features (📋 Planned)
- [ ] **BL-009**: CRM Integration (P2)
- [ ] **BL-010**: Multi-language Support (P3)
- [ ] **BL-011**: Advanced AI Features (P2)
- [ ] **BL-012**: Performance Optimization (P2)

### Phase 5: Scale & Enterprise (📋 Future)
- [ ] **BL-013**: Multi-tenant Architecture (P3)
- [ ] **BL-014**: Advanced Security Features (P3)
- [ ] **BL-015**: API Rate Limiting & Billing (P3)
- [ ] **BL-016**: Enterprise Integrations (P3)

---

## Development Guidelines

### Code Standards

#### Backend (Node.js/Express)
```javascript
// File naming: camelCase
// Functions: camelCase
// Constants: UPPER_SNAKE_CASE
// Classes: PascalCase

// Example structure
const express = require('express');
const { validateInput } = require('../middleware/validation');
const { processAudio } = require('../services/whisperService');

const router = express.Router();

router.post('/upload', validateInput, async (req, res) => {
  try {
    const result = await processAudio(req.file);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

#### Frontend (React/TypeScript)
```typescript
// File naming: PascalCase for components, camelCase for utilities
// Components: PascalCase
// Hooks: camelCase starting with 'use'
// Types: PascalCase

// Example component
interface CustomerCardProps {
  customer: Customer;
  onEdit: (id: number) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onEdit }) => {
  const { data, isLoading } = useCustomer(customer.id);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="customer-card">
      <h3>{customer.name}</h3>
      <p>{customer.phone}</p>
      <button onClick={() => onEdit(customer.id)}>Edit</button>
    </div>
  );
};
```

### Git Workflow
```bash
# Branch naming
feature/BL-001-user-research
bugfix/upload-error-handling
hotfix/security-patch

# Commit messages
feat: add user authentication system
fix: resolve file upload timeout issue
docs: update API documentation
test: add unit tests for scoring service
```

### Testing Strategy
- **Unit Tests**: Jest for backend, React Testing Library for frontend
- **Integration Tests**: API endpoint testing with Supertest
- **E2E Tests**: Playwright (planned)
- **Coverage Target**: 80% minimum

---

## Testing Strategy

### Test Structure
```
tests/
├── unit/              # Unit tests
│   ├── services/
│   ├── middleware/
│   └── utils/
├── integration/       # Integration tests
│   ├── api/
│   └── database/
├── e2e/              # End-to-end tests (planned)
└── setup.js          # Test configuration
```

### Test Examples

#### Backend Unit Test
```javascript
// tests/unit/services/scoringService.test.js
const { calculateScore } = require('../../../src/services/scoringService');

describe('Scoring Service', () => {
  test('should calculate overall score correctly', () => {
    const scores = {
      urgency: 80,
      budget: 70,
      interest: 90,
      engagement: 85
    };
    
    const result = calculateScore(scores);
    expect(result).toBe(81.5);
  });
});
```

#### Frontend Component Test
```typescript
// tests/components/CustomerCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerCard } from '../src/components/customers/CustomerCard';

describe('CustomerCard', () => {
  test('should display customer information', () => {
    const customer = {
      id: 1,
      name: 'John Doe',
      phone: '050-1234567'
    };
    
    render(<CustomerCard customer={customer} onEdit={jest.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('050-1234567')).toBeInTheDocument();
  });
});
```

---

## Monitoring & Observability

### Health Checks
```http
GET /health
GET /api/health
```

### Logging Strategy
```javascript
// Structured logging
const logger = {
  info: (message, meta = {}) => console.log(JSON.stringify({ level: 'info', message, ...meta })),
  error: (message, meta = {}) => console.error(JSON.stringify({ level: 'error', message, ...meta })),
  warn: (message, meta = {}) => console.warn(JSON.stringify({ level: 'warn', message, ...meta }))
};
```

### Metrics (Planned)
- Request/response times
- Error rates
- File upload success rates
- Analysis processing times
- Database query performance

### Alerting (Planned)
- High error rates
- Service downtime
- Performance degradation
- Security incidents

---

## Configuration Management

### Environment Variables
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@host:5432/database"

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/mp3

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Debug Configuration
DEBUG_TRACKING=true
```

### Dynamic Configuration
```javascript
// Database-stored configuration
const config = {
  scoring: {
    weights: {
      urgency: 0.3,
      budget: 0.25,
      interest: 0.25,
      engagement: 0.2
    },
    phrases: {
      urgency: ['דחוף', 'מהר', 'עכשיו'],
      budget: ['תקציב', 'מחיר', 'כמה'],
      interest: ['אוהב', 'מתאים', 'מושלם'],
      engagement: ['כן', 'בסדר', 'אני מעוניין']
    }
  }
};
```

---

## Maintenance & Updates

### Database Migrations
```bash
# Create migration
npx prisma migrate dev --name add_new_feature

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Dependency Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions (careful!)
npx npm-check-updates -u
```

### Backup Strategy
- Automated daily backups
- Point-in-time recovery
- Cross-region replication (planned)
- Disaster recovery plan

---

## Troubleshooting Guide

### Common Issues

#### 1. File Upload Failures
**Symptoms**: 413 Payload Too Large, 415 Unsupported Media Type
**Solutions**:
- Check file size limits
- Verify file type configuration
- Ensure proper multipart/form-data encoding

#### 2. Database Connection Issues
**Symptoms**: Connection timeout, Pool exhausted
**Solutions**:
- Check DATABASE_URL configuration
- Verify network connectivity
- Review connection pool settings

#### 3. OpenAI API Errors
**Symptoms**: 401 Unauthorized, 429 Rate Limited
**Solutions**:
- Verify API key configuration
- Check API usage limits
- Implement retry logic with exponential backoff

#### 4. Frontend Build Issues
**Symptoms**: Build failures, TypeScript errors
**Solutions**:
- Clear node_modules and reinstall
- Check TypeScript configuration
- Verify React version compatibility

---

## Future Considerations

### Scalability
- Horizontal scaling with load balancers
- Database read replicas
- CDN for static assets
- Microservices architecture (if needed)

### Security Enhancements
- OAuth 2.0 integration
- Two-factor authentication
- Audit logging
- Data encryption at rest

### Performance Optimization
- Redis caching layer
- Database query optimization
- Frontend code splitting
- Image and asset optimization

### Integration Opportunities
- CRM systems (Salesforce, HubSpot)
- Communication platforms (Slack, Teams)
- Analytics platforms (Google Analytics, Mixpanel)
- Payment processors (Stripe, PayPal)

---

*This system design specification serves as a living document that should be updated whenever features are added, removed, or modified. It provides a comprehensive overview of the current implementation and serves as a guide for future development decisions.*

**Last Updated**: December 19, 2024
**Version**: 2.0
**Next Review**: January 19, 2025
