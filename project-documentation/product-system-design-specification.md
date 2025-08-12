---
title: Hebrew Sales Call Analysis System - Complete System Design Specification
description: Comprehensive system design specification serving as a living document for feature development and system evolution
feature: Hebrew Sales Call Analysis System
last-updated: 2024-12-19
version: 3.0
related-files: 
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
11. [Feature Roadmap & Implementation Strategy](#feature-roadmap--implementation-strategy)
12. [User Research & Validation Framework](#user-research--validation-framework)
13. [Development Guidelines](#development-guidelines)
14. [Testing Strategy](#testing-strategy)
15. [Monitoring & Observability](#monitoring--observability)
16. [Configuration Management](#configuration-management)
17. [Troubleshooting Guide](#troubleshooting-guide)
18. [Future Considerations](#future-considerations)

---

## Executive Summary

### System Purpose
The Hebrew Sales Call Analysis System is an AI-powered platform designed to analyze Hebrew voice recordings of real estate sales calls, automatically score customer potential, and prioritize follow-up efforts to increase deal closure rates.

### Problem Statement
Real estate sales teams manually analyze 200+ Hebrew voice recordings of sales calls (2-3 minutes each), which is time-consuming, inconsistent, and often misses critical buying signals. This leads to poor prioritization of follow-up efforts and lost opportunities.

### Key Value Propositions
- **80% reduction** in manual analysis time
- **20% improvement** in deal closure rates through better prioritization
- **Hebrew-specific** AI analysis with cultural context understanding
- **Real-time insights** for sales team decision making

### Target Users
- **Primary**: Real estate sales agents and managers in Israel
- **Secondary**: Sales team leaders and operations managers
- **Demographics**: Hebrew-speaking sales professionals, 25-55 years old, working with residential real estate

### Unique Selling Proposition
The only AI-powered system specifically designed for Hebrew sales call analysis with built-in understanding of Israeli real estate market dynamics and Hebrew language nuances.

### Success Metrics
- **Technical Metrics**: 99%+ system uptime, <5 minutes processing per file, 80%+ accuracy rate, <5% error rate
- **Business Metrics**: 90%+ user adoption, 80% reduction in manual analysis time, 20%+ improvement in deal closure rates
- **User Experience Metrics**: 95%+ task completion rate, <10% user error rate, 80%+ feature usage

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

### System Flow Diagram

#### System Overview Flow

```mermaid
graph TB
    %% Actors
    subgraph "External Actors"
        A[Sales Agent] 
        B[Sales Manager]
        C[System Administrator]
    end
    
    %% Frontend Layer
    subgraph "Frontend Application (React/TypeScript)"
        D[Dashboard Page]
        E[Upload Page]
        F[Customers Page]
        G[Analysis Page]
        H[Configuration Page]
    end
    
    %% Backend API Layer
    subgraph "Backend API (Node.js/Express)"
        I[File Upload API]
        J[Analysis API]
        K[Customers API]
        L[Dashboard API]
        M[Configuration API]
        N[Audio API]
    end
    
    %% Core Services
    subgraph "Core Services"
        O[Whisper Service]
        P[Scoring Service]
        Q[Enhanced Analysis Service]
        R[Configuration Service]
        S[Debug Tracking Service]
    end
    
    %% Database
    subgraph "Database (PostgreSQL)"
        T[Customers Table]
        U[Sales Calls Table]
        V[Customer Priorities Table]
        W[Scoring Configurations Table]
    end
    
    %% External Services
    subgraph "External Services"
        X[OpenAI Whisper API]
        Y[OpenAI GPT-4 API]
    end
    
    %% File Storage
    subgraph "File Storage"
        Z[Audio Files Storage]
    end
    
    %% Connections - User Interactions
    A --> D
    A --> E
    A --> F
    A --> G
    B --> D
    B --> F
    C --> H
    
    %% Frontend to API
    E --> I
    G --> J
    F --> K
    D --> L
    H --> M
    G --> N
    
    %% API to Services
    I --> O
    I --> S
    J --> P
    J --> Q
    J --> S
    L --> S
    M --> R
    
    %% Services to External APIs
    O --> X
    Q --> Y
    
    %% Services to Database
    I --> T
    I --> U
    J --> U
    K --> T
    K --> V
    L --> T
    L --> U
    L --> V
    M --> W
    
    %% Services to File Storage
    I --> Z
    N --> Z
    
    %% Database Relationships
    T -.-> U
    U -.-> V
    W -.-> P
    
    %% Styling
    classDef actor fill:#e1f5fe
    classDef frontend fill:#f3e5f5
    classDef api fill:#e8f5e8
    classDef service fill:#fff3e0
    classDef database fill:#fce4ec
    classDef external fill:#f1f8e9
    classDef storage fill:#e0f2f1
    
    class A,B,C actor
    class D,E,F,G,H frontend
    class I,J,K,L,M,N api
    class O,P,Q,R,S service
    class T,U,V,W database
    class X,Y external
    class Z storage
```

#### Detailed Process Flows

##### 1. File Upload & Analysis Flow

```mermaid
sequenceDiagram
    participant SA as Sales Agent
    participant FE as Frontend
    participant API as Backend API
    participant WS as Whisper Service
    participant SS as Scoring Service
    participant EAS as Enhanced Analysis
    participant DB as Database
    participant FS as File Storage
    participant OA as OpenAI APIs

    SA->>FE: Upload audio file + customer info
    FE->>API: POST /api/upload
    API->>FS: Store audio file
    API->>DB: Create customer record
    API->>DB: Create sales call record
    API->>WS: Process audio transcription
    WS->>OA: OpenAI Whisper API call
    OA-->>WS: Hebrew transcript
    WS-->>API: Transcription result
    API->>SS: Calculate basic scores
    SS-->>API: Urgency, Budget, Interest, Engagement scores
    API->>EAS: Enhanced analysis (optional)
    EAS->>OA: OpenAI GPT-4 API call
    OA-->>EAS: Detailed analysis
    EAS-->>API: Enhanced analysis results
    API->>DB: Update sales call with scores & analysis
    API->>DB: Update customer priorities
    API-->>FE: Analysis complete
    FE-->>SA: Show results & customer score
```

##### 2. Customer Management Flow

```mermaid
sequenceDiagram
    participant SM as Sales Manager
    participant FE as Frontend
    participant API as Backend API
    participant DB as Database

    SM->>FE: View customers page
    FE->>API: GET /api/customers
    API->>DB: Query customers with priorities
    DB-->>API: Customer data
    API-->>FE: Prioritized customer list
    FE-->>SM: Display customer cards

    SM->>FE: Filter/search customers
    FE->>API: GET /api/customers?filter=...
    API->>DB: Filtered query
    DB-->>API: Filtered results
    API-->>FE: Filtered customer list
    FE-->>SM: Updated display

    SM->>FE: Edit customer details
    FE->>API: PUT /api/customers/:id
    API->>DB: Update customer record
    DB-->>API: Update confirmation
    API-->>FE: Success response
    FE-->>SM: Updated customer info
```

##### 3. Dashboard Analytics Flow

```mermaid
sequenceDiagram
    participant SM as Sales Manager
    participant FE as Frontend
    participant API as Backend API
    participant DB as Database

    SM->>FE: Access dashboard
    FE->>API: GET /api/dashboard/stats
    API->>DB: Aggregate statistics
    DB-->>API: Stats data
    API-->>FE: Dashboard statistics
    FE-->>SM: Display stats cards

    SM->>FE: View analytics
    FE->>API: GET /api/dashboard/analytics?period=30
    API->>DB: Time-based analytics
    DB-->>API: Analytics data
    API-->>FE: Chart data
    FE-->>SM: Display charts

    SM->>FE: Export data
    FE->>API: GET /api/dashboard/export?format=csv
    API->>DB: Export query
    DB-->>API: Export data
    API-->>FE: CSV file
    FE-->>SM: Download file
```

##### 4. Configuration Management Flow

```mermaid
sequenceDiagram
    participant SA as System Administrator
    participant FE as Frontend
    participant API as Backend API
    participant CS as Configuration Service
    participant DB as Database

    SA->>FE: Access configuration page
    FE->>API: GET /api/configuration
    API->>CS: Get current config
    CS->>DB: Query scoring configurations
    DB-->>CS: Configuration data
    CS-->>API: Current settings
    API-->>FE: Configuration data
    FE-->>SA: Display config form

    SA->>FE: Update scoring weights
    FE->>API: PUT /api/configuration/:id
    API->>CS: Update configuration
    CS->>DB: Update scoring config
    DB-->>CS: Update confirmation
    CS-->>API: Success response
    API-->>FE: Configuration updated
    FE-->>SA: Success notification
```

#### System Architecture Layers

##### Layer 1: Presentation Layer (Frontend)
- **Technology**: React 19+ with TypeScript
- **Components**: Dashboard, Upload, Customers, Analysis, Configuration
- **State Management**: TanStack React Query
- **UI Framework**: Tailwind CSS

##### Layer 2: API Gateway Layer (Backend)
- **Technology**: Node.js with Express.js
- **Responsibilities**: Request routing, validation, authentication
- **Endpoints**: RESTful API with proper error handling

##### Layer 3: Business Logic Layer (Services)
- **Whisper Service**: Hebrew audio transcription
- **Scoring Service**: Multi-factor customer analysis
- **Enhanced Analysis Service**: GPT-4 powered insights
- **Configuration Service**: Dynamic system configuration
- **Debug Tracking Service**: Development support

##### Layer 4: Data Access Layer
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Local storage (S3-ready)
- **External APIs**: OpenAI Whisper & GPT-4

#### Key Data Flows

##### 1. Audio Processing Pipeline
```
Audio File → Validation → Storage → Transcription → Analysis → Scoring → Database
```

##### 2. Customer Prioritization Pipeline
```
Sales Calls → Score Aggregation → Priority Calculation → Ranking → Dashboard
```

##### 3. Configuration Update Pipeline
```
Admin Input → Validation → Database Update → Service Reload → Active Configuration
```

#### Performance Characteristics

##### Processing Times
- **Audio Upload**: 1-5 seconds (depending on file size)
- **Transcription**: 30-120 seconds (depending on audio length)
- **Basic Scoring**: 1-3 seconds
- **Enhanced Analysis**: 10-30 seconds
- **Dashboard Loading**: 1-2 seconds

##### Scalability Considerations
- **Horizontal Scaling**: Load balancer ready
- **Database**: Connection pooling, proper indexing
- **File Storage**: S3 migration path
- **Caching**: Redis integration planned

#### Security Flow

```mermaid
graph LR
    subgraph "Security Measures"
        A[Input Validation]
        B[Rate Limiting]
        C[CORS Protection]
        D[File Type Validation]
        E[SQL Injection Prevention]
        F[XSS Protection]
    end
    
    subgraph "Data Flow"
        G[User Input] --> A
        A --> B
        B --> C
        C --> D
        D --> E
        E --> F
        F --> H[Processed Data]
    end
```

#### Error Handling Flow

```mermaid
graph TD
    A[Error Occurs] --> B{Error Type?}
    B -->|Validation| C[Return 400 with details]
    B -->|Authentication| D[Return 401]
    B -->|Authorization| E[Return 403]
    B -->|Not Found| F[Return 404]
    B -->|Server Error| G[Return 500 with logging]
    
    C --> H[Client handles gracefully]
    D --> I[Redirect to login]
    E --> J[Show access denied]
    F --> K[Show not found page]
    G --> L[Show generic error]
    
    H --> M[User can retry]
    I --> M
    J --> M
    K --> M
    L --> M
```

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
- **Whisper Integration**: Hebrew language transcription (`language: "he"`)
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

#### 1. User Research & Validation (P0 - Critical)
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

### Future Schema Additions (Planned)

#### User Management Tables
```sql
-- User management
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'agent',
  created_at TIMESTAMP DEFAULT NOW()
);

-- User sessions
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit trail
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id INTEGER,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  dashboard_layout JSONB,
  notification_settings JSONB,
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

### Future API Endpoints (Planned)

#### Authentication Endpoints
```javascript
// Authentication routes
POST /api/auth/register
{
  "email": "string",
  "password": "string",
  "name": "string",
  "role": "agent|manager"
}

POST /api/auth/login
{
  "email": "string",
  "password": "string"
}

POST /api/auth/logout
{
  "token": "string"
}

GET /api/auth/me
// Returns current user profile
```

#### Analytics API Endpoints
```javascript
// Analytics endpoints
GET /api/analytics/trends?period=30d
GET /api/analytics/performance?team_id=123
GET /api/analytics/predictions?customer_id=456
GET /api/analytics/team-stats?date_range=last_month

// Export endpoints
GET /api/export/customers?format=csv
GET /api/export/analyses?format=excel
GET /api/export/reports?type=monthly&format=pdf
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
    },
    "suggestion": "Please upload an audio file (MP3, WAV, M4A, AAC, OGG)",
    "retryable": true
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

### Future Frontend Components (Planned)

#### Authentication Components
```typescript
// Login component
interface LoginForm {
  email: string;
  password: string;
}

// User context
interface UserContext {
  user: User | null;
  login: (credentials: LoginForm) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  role: 'agent' | 'manager';
}
```

#### Enhanced Dashboard Components
```typescript
// Analytics components
interface TrendData {
  period: string;
  score: number;
  calls: number;
  conversions: number;
}

interface PerformanceMetrics {
  teamAverage: number;
  individualScores: ScoreBreakdown[];
  topPerformers: User[];
  improvementAreas: string[];
}
```

---

## Core Services

### 1. Whisper Service
**Purpose**: Hebrew audio transcription
**Key Features**:
- Hebrew language specification (`language: "he"`)
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

### Future Security Enhancements (Planned)
- User authentication and authorization
- Data encryption at rest and in transit
- GDPR compliance measures for Israeli market
- Data retention and deletion policies
- Audit trail and access logging

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

## Feature Roadmap & Implementation Strategy

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
- [ ] **BL-001**: User Research & Validation (P0 - Critical)
- [ ] **BL-002**: MVP Scope Refinement (P0 - Critical)
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

### Detailed Implementation Roadmap

#### Phase 1: Foundation & Validation (Weeks 1-2) - **CRITICAL**

##### 1.1 User Research & Validation
**Priority**: P0 (Critical for success)
**Timeline**: Week 1-2
**Dependencies**: Access to sales team members

**Implementation Tasks**:
- [ ] **User Interview Planning**
  - Identify 5-10 sales team members for interviews
  - Create structured interview questions
  - Schedule and conduct interviews
  - Document findings and insights

- [ ] **Workflow Analysis**
  - Map current sales call analysis workflow
  - Identify pain points and inefficiencies
  - Document feature priorities and success criteria
  - Validate scoring algorithm assumptions

- [ ] **Requirement Updates**
  - Update MVP scope based on user feedback
  - Refine scoring algorithm based on real sales criteria
  - Prioritize features by user impact
  - Create user personas and journey maps

**Technical Requirements**:
- No technical implementation needed
- Focus on documentation and analysis
- Prepare for Phase 2 development

##### 1.2 MVP Scope Refinement
**Priority**: P0 (Critical for success)
**Timeline**: Week 2
**Dependencies**: User research completion

**Implementation Tasks**:
- [ ] **Feature Prioritization**
  - Define must-have vs nice-to-have features
  - Create detailed user stories with acceptance criteria
  - Estimate development effort and timelines
  - Define success metrics for each feature

- [ ] **Technical Planning**
  - Update technical architecture based on user feedback
  - Plan database schema changes if needed
  - Define API contract updates
  - Plan frontend component modifications

**Deliverables**:
- Updated feature specifications
- Revised technical architecture
- Development timeline and milestones

#### Phase 2: Enhanced User Experience (Weeks 3-4) - **HIGH PRIORITY**

##### 2.1 User Authentication & Role Management
**Priority**: P1 (High priority for production)
**Timeline**: Week 3
**Dependencies**: Basic system functionality (✅ Complete)

**Implementation Tasks**:
- [ ] **Authentication System**
  ```javascript
  // New API endpoints needed:
  POST /api/auth/register
  POST /api/auth/login
  POST /api/auth/logout
  GET /api/auth/me
  ```

- [ ] **Database Schema Updates**
  ```sql
  -- New tables needed:
  users (id, email, password_hash, role, created_at)
  user_sessions (id, user_id, token, expires_at)
  ```

- [ ] **Frontend Authentication**
  - Login/register forms
  - Protected route components
  - User context and state management
  - Role-based UI rendering

**Technical Implementation**:
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Session management

##### 2.2 Enhanced Error Handling & User Feedback
**Priority**: P1 (High priority for user satisfaction)
**Timeline**: Week 4
**Dependencies**: Core upload and processing functionality (✅ Complete)

**Implementation Tasks**:
- [ ] **Error Handling Improvements**
  ```javascript
  // Enhanced error responses:
  {
    error: true,
    code: 'FILE_TOO_LARGE',
    message: 'File size exceeds 50MB limit',
    suggestion: 'Please compress your audio file or use a shorter recording',
    retryable: true
  }
  ```

- [ ] **Progress Indicators**
  - Real-time upload progress
  - Analysis status updates
  - Estimated completion times
  - Success/failure notifications

- [ ] **User-Friendly Messages**
  - Non-technical error descriptions
  - Clear next steps and solutions
  - Contextual help and guidance

**Technical Implementation**:
- WebSocket connections for real-time updates
- Enhanced error categorization
- User-friendly message mapping
- Progressive enhancement

#### Phase 3: Business Intelligence & Analytics (Weeks 5-6) - **HIGH PRIORITY**

##### 3.1 Advanced Analytics Dashboard
**Priority**: P1 (High value for management)
**Timeline**: Week 5
**Dependencies**: Sufficient call data and analysis results (✅ Available)

**Implementation Tasks**:
- [ ] **Enhanced Dashboard Components**
  ```javascript
  // New dashboard features:
  - Trend analysis charts
  - Performance comparison tools
  - Team productivity metrics
  - Deal closure predictions
  ```

- [ ] **Analytics API Endpoints**
  ```javascript
  // New API endpoints:
  GET /api/analytics/trends
  GET /api/analytics/performance
  GET /api/analytics/predictions
  GET /api/analytics/team-stats
  ```

- [ ] **Data Visualization**
  - Interactive charts and graphs
  - Real-time data updates
  - Customizable dashboards
  - Export capabilities

**Technical Implementation**:
- Chart.js or D3.js for visualizations
- Real-time data aggregation
- Caching for performance
- Responsive design

##### 3.2 Export & Integration Capabilities
**Priority**: P2 (Medium priority, nice-to-have)
**Timeline**: Week 6
**Dependencies**: Core analysis functionality (✅ Complete)

**Implementation Tasks**:
- [ ] **Export Functionality**
  ```javascript
  // New API endpoints:
  GET /api/export/customers
  GET /api/export/analyses
  GET /api/export/reports
  ```

- [ ] **Integration APIs**
  ```javascript
  // Webhook endpoints:
  POST /api/webhooks/analysis-complete
  POST /api/webhooks/customer-updated
  ```

- [ ] **Data Formats**
  - CSV export for Excel compatibility
  - JSON API for external integrations
  - PDF reports for management
  - Webhook notifications

**Technical Implementation**:
- CSV generation library
- PDF generation with templates
- Webhook management system
- API rate limiting and security

#### Phase 4: Security & Compliance (Weeks 7-8) - **HIGH PRIORITY**

##### 4.1 Security Framework Implementation
**Priority**: P1 (Critical for production)
**Timeline**: Week 7
**Dependencies**: Authentication system (Phase 2.1)

**Implementation Tasks**:
- [ ] **Data Protection**
  ```javascript
  // Security measures:
  - File encryption at rest
  - HTTPS enforcement
  - Input validation and sanitization
  - SQL injection prevention
  ```

- [ ] **Privacy Compliance**
  ```javascript
  // GDPR compliance:
  - Data retention policies
  - User consent management
  - Data deletion capabilities
  - Privacy policy integration
  ```

- [ ] **Audit Trail**
  ```javascript
  // New database table:
  audit_logs (id, user_id, action, resource, timestamp, ip_address)
  ```

**Technical Implementation**:
- Encryption libraries (crypto-js)
- GDPR compliance framework
- Audit logging system
- Security headers and policies

##### 4.2 Compliance & Legal Framework
**Priority**: P1 (Required for Israeli market)
**Timeline**: Week 8
**Dependencies**: Security framework (Phase 4.1)

**Implementation Tasks**:
- [ ] **Israeli Privacy Law Compliance**
  - Data localization requirements
  - Consent management
  - Right to be forgotten
  - Data breach notification

- [ ] **Legal Documentation**
  - Privacy policy
  - Terms of service
  - Data processing agreements
  - Cookie consent

**Technical Implementation**:
- Privacy policy pages
- Consent management UI
- Data deletion workflows
- Legal document templates

### Implementation Strategy

#### 1. User-Centric Development
- Start with user research to validate assumptions
- Build features based on real user needs
- Iterate based on user feedback
- Focus on user experience over technical complexity

#### 2. Incremental Implementation
- Implement features in small, testable increments
- Deploy frequently to gather feedback
- Maintain backward compatibility
- Use feature flags for gradual rollouts

#### 3. Quality-First Approach
- Comprehensive testing at each phase
- Security review for all new features
- Performance monitoring and optimization
- Documentation updates with each release

### Risk Mitigation

#### 1. Technical Risks
- **Hebrew Language Processing**: Already implemented and tested
- **API Dependencies**: Implement fallback mechanisms for Whisper API
- **Performance**: Monitor and optimize based on real usage
- **Scalability**: Design for horizontal scaling from the start

#### 2. User Adoption Risks
- **Resistance to Change**: Involve users in design and testing
- **Poor User Experience**: Focus on simplicity and usability
- **Training Requirements**: Create comprehensive onboarding
- **Support Needs**: Establish clear support channels

#### 3. Business Risks
- **Competition**: Focus on Hebrew-specific features
- **Market Validation**: Conduct thorough user research
- **ROI Measurement**: Establish clear success metrics
- **Compliance**: Ensure legal compliance from the start

### Implementation Strategy

#### 1. User-Centric Development
- Start with user research to validate assumptions
- Build features based on real user needs
- Iterate based on user feedback
- Focus on user experience over technical complexity

#### 2. Incremental Implementation
- Implement features in small, testable increments
- Deploy frequently to gather feedback
- Maintain backward compatibility
- Use feature flags for gradual rollouts

#### 3. Quality-First Approach
- Comprehensive testing at each phase
- Security review for all new features
- Performance monitoring and optimization
- Documentation updates with each release

### Risk Mitigation

#### 1. Technical Risks
- **Hebrew Language Processing**: Already implemented and tested
- **API Dependencies**: Implement fallback mechanisms for Whisper API
- **Performance**: Monitor and optimize based on real usage
- **Scalability**: Design for horizontal scaling from the start

#### 2. User Adoption Risks
- **Resistance to Change**: Involve users in design and testing
- **Poor User Experience**: Focus on simplicity and usability
- **Training Requirements**: Create comprehensive onboarding
- **Support Needs**: Establish clear support channels

#### 3. Business Risks
- **Competition**: Focus on Hebrew-specific features
- **Market Validation**: Conduct thorough user research
- **ROI Measurement**: Establish clear success metrics
- **Compliance**: Ensure legal compliance from the start

---

## User Research & Validation Framework

### Feature: User Research & Validation Framework
**User Story**: As a product manager, I want to validate our assumptions with real users, so that we build features that actually solve their problems.

**Acceptance Criteria**:
- Given access to 5-10 sales team members, when we conduct structured interviews, then we have documented insights about their current workflow and pain points
- Given the interview findings, when we analyze the data, then we have validated or invalidated our scoring algorithm assumptions
- Given the research results, when we update the MVP scope, then we have prioritized features by user impact and business value

**Priority**: P0 (Critical) - Blocking success of the entire project
**Dependencies**: Access to sales team members, scheduling coordination
**Technical Constraints**: None (research phase)

### Implementation Plan

#### Phase 1: Preparation (Week 1)
**Tasks**:
- [ ] Identify 5-10 sales team members from different companies
- [ ] Create participant criteria (active sales professionals, Hebrew speakers, real estate focus)
- [ ] Develop recruitment script and materials
- [ ] Set up scheduling system
- [ ] Create structured interview questions
- [ ] Develop workflow mapping template
- [ ] Design pain point identification framework
- [ ] Prepare feature prioritization exercise

#### Phase 2: Data Collection (Week 2-3)
**Tasks**:
- [ ] Conduct 5-10 structured interviews
- [ ] Record all interviews with permission
- [ ] Take detailed notes during interviews
- [ ] Follow up with participants for clarification
- [ ] Map current sales call analysis workflow for each participant
- [ ] Identify common patterns and variations
- [ ] Document specific pain points and inefficiencies
- [ ] Capture feature priorities and success criteria

#### Phase 3: Analysis (Week 4)
**Tasks**:
- [ ] Analyze interview transcripts and notes
- [ ] Identify common themes and patterns
- [ ] Validate or invalidate scoring algorithm assumptions
- [ ] Prioritize features by user impact and business value
- [ ] Create detailed user personas based on research
- [ ] Develop user journey maps
- [ ] Define user goals and motivations
- [ ] Document user pain points and needs

#### Phase 4: Documentation (Week 5)
**Tasks**:
- [ ] Update MVP scope based on user feedback
- [ ] Refine feature specifications
- [ ] Adjust technical requirements
- [ ] Update success metrics
- [ ] Compile all research findings
- [ ] Create executive summary
- [ ] Prepare stakeholder presentation
- [ ] Document next steps and recommendations

### Interview Guide Template

#### Introduction (5 minutes)
- Welcome and thank participant
- Explain research purpose and goals
- Review consent and recording permission
- Set expectations for interview duration

#### Current Workflow (15 minutes)
**Questions**:
1. "Walk me through your typical day when you have sales calls to analyze"
2. "How do you currently decide which customers to follow up with first?"
3. "What tools or systems do you use for call analysis?"
4. "How much time do you spend analyzing each call?"
5. "What information are you looking for when you analyze a call?"

#### Pain Points and Challenges (15 minutes)
**Questions**:
1. "What's the most frustrating part of analyzing sales calls?"
2. "What takes up the most time in your analysis process?"
3. "What mistakes do you commonly make when prioritizing customers?"
4. "What would make your job easier when analyzing calls?"
5. "What features would you want in an ideal call analysis system?"

#### Feature Prioritization (10 minutes)
**Exercise**: Present list of potential features and ask participants to:
1. Rank features by importance (1-5 scale)
2. Explain why each feature is important or not
3. Suggest additional features not on the list
4. Identify which features they would pay for

#### Closing (5 minutes)
- Thank participant
- Ask for any additional thoughts or suggestions
- Explain next steps and how they'll hear about results
- Provide contact information for follow-up questions

### Success Criteria

#### Quantitative Metrics
- [ ] 5-10 interviews completed within 3 weeks
- [ ] 100% of interviews recorded and transcribed
- [ ] 80%+ participant satisfaction with interview process
- [ ] Clear consensus on top 3 pain points identified

#### Qualitative Metrics
- [ ] Rich insights about current workflow
- [ ] Validated or invalidated scoring algorithm assumptions
- [ ] Clear feature priorities established
- [ ] User personas and journey maps created

---

## User Research & Validation Framework

### Feature: User Research & Validation Framework
**User Story**: As a product manager, I want to validate our assumptions with real users, so that we build features that actually solve their problems.

**Acceptance Criteria**:
- Given access to 5-10 sales team members, when we conduct structured interviews, then we have documented insights about their current workflow and pain points
- Given the interview findings, when we analyze the data, then we have validated or invalidated our scoring algorithm assumptions
- Given the research results, when we update the MVP scope, then we have prioritized features by user impact and business value

**Priority**: P0 (Critical) - Blocking success of the entire project
**Dependencies**: Access to sales team members, scheduling coordination
**Technical Constraints**: None (research phase)

### Implementation Plan

#### Phase 1: Preparation (Week 1)
**Tasks**:
- [ ] Identify 5-10 sales team members from different companies
- [ ] Create participant criteria (active sales professionals, Hebrew speakers, real estate focus)
- [ ] Develop recruitment script and materials
- [ ] Set up scheduling system
- [ ] Create structured interview questions
- [ ] Develop workflow mapping template
- [ ] Design pain point identification framework
- [ ] Prepare feature prioritization exercise

#### Phase 2: Data Collection (Week 2-3)
**Tasks**:
- [ ] Conduct 5-10 structured interviews
- [ ] Record all interviews with permission
- [ ] Take detailed notes during interviews
- [ ] Follow up with participants for clarification
- [ ] Map current sales call analysis workflow for each participant
- [ ] Identify common patterns and variations
- [ ] Document specific pain points and inefficiencies
- [ ] Capture feature priorities and success criteria

#### Phase 3: Analysis (Week 4)
**Tasks**:
- [ ] Analyze interview transcripts and notes
- [ ] Identify common themes and patterns
- [ ] Validate or invalidate scoring algorithm assumptions
- [ ] Prioritize features by user impact and business value
- [ ] Create detailed user personas based on research
- [ ] Develop user journey maps
- [ ] Define user goals and motivations
- [ ] Document user pain points and needs

#### Phase 4: Documentation (Week 5)
**Tasks**:
- [ ] Update MVP scope based on user feedback
- [ ] Refine feature specifications
- [ ] Adjust technical requirements
- [ ] Update success metrics
- [ ] Compile all research findings
- [ ] Create executive summary
- [ ] Prepare stakeholder presentation
- [ ] Document next steps and recommendations

### Interview Guide Template

#### Introduction (5 minutes)
- Welcome and thank participant
- Explain research purpose and goals
- Review consent and recording permission
- Set expectations for interview duration

#### Current Workflow (15 minutes)
**Questions**:
1. "Walk me through your typical day when you have sales calls to analyze"
2. "How do you currently decide which customers to follow up with first?"
3. "What tools or systems do you use for call analysis?"
4. "How much time do you spend analyzing each call?"
5. "What information are you looking for when you analyze a call?"

#### Pain Points and Challenges (15 minutes)
**Questions**:
1. "What's the most frustrating part of analyzing sales calls?"
2. "What takes up the most time in your analysis process?"
3. "What mistakes do you commonly make when prioritizing customers?"
4. "What would make your job easier when analyzing calls?"
5. "What features would you want in an ideal call analysis system?"

#### Feature Prioritization (10 minutes)
**Exercise**: Present list of potential features and ask participants to:
1. Rank features by importance (1-5 scale)
2. Explain why each feature is important or not
3. Suggest additional features not on the list
4. Identify which features they would pay for

#### Closing (5 minutes)
- Thank participant
- Ask for any additional thoughts or suggestions
- Explain next steps and how they'll hear about results
- Provide contact information for follow-up questions

### Success Criteria

#### Quantitative Metrics
- [ ] 5-10 interviews completed within 3 weeks
- [ ] 100% of interviews recorded and transcribed
- [ ] 80%+ participant satisfaction with interview process
- [ ] Clear consensus on top 3 pain points identified

#### Qualitative Metrics
- [ ] Rich insights about current workflow
- [ ] Validated or invalidated scoring algorithm assumptions
- [ ] Clear feature priorities established
- [ ] User personas and journey maps created

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

### Maintenance & Updates

#### Database Migrations
```bash
# Create migration
npx prisma migrate dev --name add_new_feature

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

#### Dependency Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions (careful!)
npx npm-check-updates -u
```

#### Backup Strategy
- Automated daily backups
- Point-in-time recovery
- Cross-region replication (planned)
- Disaster recovery plan

---

## Conclusion

The Hebrew Sales Call Analysis System has a strong technical foundation with core functionality implemented. The system provides:

- **Solid Technical Foundation**: Complete backend infrastructure, database schema, and frontend architecture
- **Hebrew Language Support**: Specialized AI analysis with Hebrew transcription and cultural context
- **Scalable Architecture**: Designed for growth with proper separation of concerns
- **Comprehensive Documentation**: Detailed specifications for all system components

**Key Next Steps**:
1. **Prioritize User Research** - Conduct thorough user interviews before any further development
2. **Implement Authentication** - Add user management and role-based access control
3. **Enhance User Experience** - Improve error handling, feedback, and mobile responsiveness
4. **Add Business Intelligence** - Implement advanced analytics and export capabilities
5. **Strengthen Security** - Add comprehensive security and compliance measures

The system has excellent potential but requires focused development on user experience and business intelligence features to achieve the strategic goals outlined in the product roadmap.

---

*This system design specification serves as a living document that should be updated whenever features are added, removed, or modified. It provides a comprehensive overview of the current implementation and serves as a guide for future development decisions.*

**Last Updated**: December 19, 2024
**Version**: 3.0
**Next Review**: January 19, 2025
