# Hebrew Sales Call Analysis System - System Flow Diagram

## System Overview Flow

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

## Detailed Process Flow

### 1. File Upload & Analysis Flow

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

### 2. Customer Management Flow

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

### 3. Dashboard Analytics Flow

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

### 4. Configuration Management Flow

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

## System Architecture Layers

### Layer 1: Presentation Layer (Frontend)
- **Technology**: React 19+ with TypeScript
- **Components**: Dashboard, Upload, Customers, Analysis, Configuration
- **State Management**: TanStack React Query
- **UI Framework**: Tailwind CSS

### Layer 2: API Gateway Layer (Backend)
- **Technology**: Node.js with Express.js
- **Responsibilities**: Request routing, validation, authentication
- **Endpoints**: RESTful API with proper error handling

### Layer 3: Business Logic Layer (Services)
- **Whisper Service**: Hebrew audio transcription
- **Scoring Service**: Multi-factor customer analysis
- **Enhanced Analysis Service**: GPT-4 powered insights
- **Configuration Service**: Dynamic system configuration
- **Debug Tracking Service**: Development support

### Layer 4: Data Access Layer
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Local storage (S3-ready)
- **External APIs**: OpenAI Whisper & GPT-4

## Key Data Flows

### 1. Audio Processing Pipeline
```
Audio File → Validation → Storage → Transcription → Analysis → Scoring → Database
```

### 2. Customer Prioritization Pipeline
```
Sales Calls → Score Aggregation → Priority Calculation → Ranking → Dashboard
```

### 3. Configuration Update Pipeline
```
Admin Input → Validation → Database Update → Service Reload → Active Configuration
```

## System Boundaries

### Input Boundaries
- **Audio Files**: MP3, WAV, M4A, AAC, OGG (max 10MB)
- **Customer Data**: Name, phone, email
- **Configuration**: Scoring weights, Hebrew phrases

### Output Boundaries
- **Customer Scores**: 0-100 scale with breakdown
- **Prioritization**: Ranked customer list
- **Analytics**: Performance metrics and trends
- **Reports**: Exportable data formats

### External Dependencies
- **OpenAI Whisper API**: Audio transcription
- **OpenAI GPT-4 API**: Enhanced analysis
- **PostgreSQL Database**: Data persistence
- **File Storage**: Audio file management

## Performance Characteristics

### Processing Times
- **Audio Upload**: 1-5 seconds (depending on file size)
- **Transcription**: 30-120 seconds (depending on audio length)
- **Basic Scoring**: 1-3 seconds
- **Enhanced Analysis**: 10-30 seconds
- **Dashboard Loading**: 1-2 seconds

### Scalability Considerations
- **Horizontal Scaling**: Load balancer ready
- **Database**: Connection pooling, proper indexing
- **File Storage**: S3 migration path
- **Caching**: Redis integration planned

## Security Flow

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

## Error Handling Flow

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

---

*This flow diagram provides a comprehensive view of the Hebrew Sales Call Analysis System, showing all actors, processes, and data flows from initial file upload through final analysis and reporting. The system is designed to be scalable, secure, and user-friendly for real estate sales professionals in Israel.*
