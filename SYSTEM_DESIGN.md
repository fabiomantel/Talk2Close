# Hebrew Sales Call Analysis System - System Design

## Project Overview

**System Name**: Hebrew Sales Call Analysis System  
**Purpose**: Analyze Hebrew voice recordings of real estate sales calls to prioritize customers for deal closure  
**Language**: Hebrew (RTL support)  
**Target Users**: Real estate sales teams  

---

## Business Problem

- **Input**: 200+ voice recordings of sales calls (Hebrew, 2-3 minutes average)
- **Challenge**: Manual analysis is time-consuming and inconsistent
- **Goal**: Automatically identify which customers are most likely to close deals
- **Output**: Prioritized customer list with closing probability scores

---

## Technical Architecture

### Tech Stack (MVP)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **File Storage**: Local storage (S3 for production)
- **AI/ML**: OpenAI Whisper API
- **Frontend**: React (simple dashboard)
- **Authentication**: None for MVP

### System Components
1. **File Upload System** - Accept MP3/WAV files
2. **Audio Processing Pipeline** - Whisper API integration
3. **Analysis Engine** - Hebrew text analysis and scoring
4. **Database Layer** - Customer and call data storage
5. **Dashboard** - Results visualization and prioritization

---

## Database Schema

### Core Tables

```sql
-- Customers table
customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
)

-- Sales calls table
sales_calls (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  audio_file_path VARCHAR(255),
  transcript TEXT,
  urgency_score INTEGER,
  budget_score INTEGER,
  interest_score INTEGER,
  engagement_score INTEGER,
  overall_score INTEGER,
  analysis_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Customer priorities (aggregated view)
customer_priorities (
  customer_id INTEGER PRIMARY KEY REFERENCES customers(id),
  total_calls INTEGER,
  avg_overall_score DECIMAL(5,2),
  last_call_date TIMESTAMP,
  priority_rank INTEGER
)
```

---

## Scoring System

### Scoring Factors & Weights

#### 1. **Urgency Score (0-100) - Weight: 30%**
**High Score Indicators:**
- "אני צריך לעבור עד החודש הבא" (I need to move by next month)
- "זה דחוף מאוד" (This is very urgent)
- "השכירות שלי נגמרת בעוד חודש" (My lease ends in a month)
- "האישה דוחפת לקנות" (My wife is pushing to buy)
- "יש לי דדליין" (I have a deadline)

#### 2. **Budget Clarity Score (0-100) - Weight: 25%**
**High Score Indicators:**
- "התקציב שלי הוא 800 אלף שקל" (My budget is 800k shekels)
- "יש לי 600-900 אלף" (I have 600-900k)
- "יש לי משכנתא מאושרת" (I have an approved mortgage)
- "יש לי כסף מזומן" (I have cash)
- "המשכנתא שלי מאושרת ל-70%" (My mortgage is approved for 70%)

#### 3. **Property Interest Score (0-100) - Weight: 25%**
**High Score Indicators:**
- "זה בדיוק מה שחיפשתי" (This is exactly what I was looking for)
- "אני אוהב את המיקום" (I love the location)
- "מתי אפשר לראות את הנכס?" (When can I see the property?)
- "מה השטח המדויק?" (What's the exact area?)
- "איך נראה הנוף?" (How does the view look?)

#### 4. **Engagement Score (0-100) - Weight: 20%**
**High Score Indicators:**
- Multiple questions asked
- Long call duration (>2 minutes)
- Active participation in conversation
- "תשלח לי פרטים נוספים" (Send me more details)
- "אני רוצה לשמוע עוד" (I want to hear more)

### Scoring Algorithm
```
Overall Score = (Urgency × 0.3) + (Budget × 0.25) + (Interest × 0.25) + (Engagement × 0.2)
```

---

## Hebrew Language Support

### Language Processing
- **Whisper API**: Hebrew language specification (`language: "he"`)
- **UI Support**: RTL (Right-to-Left) text display
- **Text Analysis**: Hebrew-specific phrase detection

### Common Hebrew Sales Phrases

#### Positive Buying Signals
- "אני מעוניין" (I'm interested)
- "זה נשמע טוב" (This sounds good)
- "אני רוצה להמשיך" (I want to continue)
- "מה השלב הבא?" (What's the next step?)

#### Objection Phrases
- "זה יקר מדי" (It's too expensive)
- "אני צריך לחשוב" (I need to think)
- "אני אחזור אליך" (I'll get back to you)
- "יש לי עוד אפשרויות" (I have other options)

#### Urgency Phrases
- "דחוף" (Urgent)
- "צריך מהר" (Need quickly)
- "יש לי לחץ זמן" (I have time pressure)
- "המשפחה דוחפת" (Family is pushing)

---

## System Flow

```
1. Upload Audio File (MP3/WAV)
   ↓
2. Store File Locally
   ↓
3. Send to Whisper API (Hebrew)
   ↓
4. Receive Hebrew Transcript
   ↓
5. Analyze Text for Key Phrases
   ↓
6. Calculate Individual Scores
   ↓
7. Compute Overall Score
   ↓
8. Store Results in Database
   ↓
9. Update Customer Priority List
   ↓
10. Display in Dashboard
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Backend setup (Node.js + Express)
- [ ] Database schema and setup
- [ ] File upload system
- [ ] Whisper API integration
- [ ] Basic error handling

### Phase 2: Analysis Engine (Week 2-3)
- [ ] Hebrew text processing
- [ ] Scoring algorithm implementation
- [ ] Key phrase extraction
- [ ] Score calculation system

### Phase 3: User Interface (Week 3-4)
- [ ] File upload interface
- [ ] Dashboard with customer list
- [ ] Score visualization
- [ ] Search and filter functionality

### Phase 4: Enhanced Features (Week 4-5)
- [ ] Advanced analysis features
- [ ] Export functionality
- [ ] Performance optimization
- [ ] Error recovery mechanisms

---

## API Endpoints (Planned)

### File Management
- `POST /api/upload` - Upload audio file
- `GET /api/files` - List uploaded files
- `DELETE /api/files/:id` - Delete file

### Analysis
- `POST /api/analyze` - Analyze uploaded file
- `GET /api/analysis/:id` - Get analysis results
- `GET /api/analysis` - List all analyses

### Customers
- `GET /api/customers` - List customers with scores
- `GET /api/customers/:id` - Get customer details
- `GET /api/customers/prioritized` - Get prioritized list

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/export` - Export data

---

## Cost Estimation

### Whisper API Costs
- **Per minute**: ~$0.006
- **200 recordings (2-3 min each)**: ~$2-5
- **Monthly budget**: $10-20 for 1000 recordings

### Infrastructure Costs
- **Development**: Free tier hosting
- **Production**: $20-50/month (VPS + database)

---

## Success Metrics

### Technical Metrics
- **Processing Speed**: <5 minutes per file
- **Accuracy**: 80%+ correct prioritization
- **Uptime**: 99%+ availability
- **Error Rate**: <5% processing failures

### Business Metrics
- **Time Saved**: 80% reduction in manual analysis
- **Deal Closure Rate**: 20%+ improvement
- **User Adoption**: 90%+ team usage
- **ROI**: Positive within 3 months

---

## Risk Mitigation

### Technical Risks
- **Hebrew Accuracy**: Test with various accents/dialects
- **API Costs**: Implement usage monitoring and alerts
- **Data Security**: Local file storage initially
- **Scalability**: Design for 1000+ recordings

### Business Risks
- **User Adoption**: Simple, intuitive interface
- **Data Quality**: Validation and error handling
- **Competition**: Focus on Hebrew-specific features
- **Regulatory**: Ensure data privacy compliance

---

## Future Enhancements

### Phase 2 Features
- Machine learning for better scoring
- CRM system integration
- Real-time processing
- Mobile app

### Phase 3 Features
- Multi-language support
- Advanced analytics
- Team collaboration features
- Automated follow-up system

---

## Development Guidelines

### Code Standards
- **Language**: JavaScript/TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest for unit/integration tests
- **Documentation**: JSDoc comments

### Security Considerations
- File upload validation
- SQL injection prevention
- Input sanitization
- Error message security

---

## Areas for Improvement (Final Review Items)

### Security & Authentication
- [ ] **Authentication System**: Implement basic user authentication even for MVP
- [ ] **Data Privacy**: Add GDPR compliance and data protection measures
- [ ] **File Upload Security**: Implement file type validation and virus scanning
- [ ] **API Security**: Add rate limiting and input validation
- [ ] **Error Message Security**: Ensure error messages don't expose sensitive information

### Technical Infrastructure
- [ ] **File Size Limits**: Define maximum audio file size restrictions
- [ ] **Concurrent Processing**: Plan for handling multiple simultaneous uploads
- [ ] **Backup Strategy**: Implement database and file backup procedures
- [ ] **Monitoring & Logging**: Add comprehensive logging and performance monitoring
- [ ] **Error Recovery**: Define specific error scenarios and recovery procedures

### Testing & Quality Assurance
- [ ] **Hebrew Language Testing**: Create test cases for various Hebrew accents/dialects
- [ ] **API Testing**: Comprehensive endpoint testing with different scenarios
- [ ] **Performance Testing**: Load testing for file upload and processing
- [ ] **Integration Testing**: End-to-end workflow testing
- [ ] **User Acceptance Testing**: Real-world usage scenarios

### Deployment & Operations
- [ ] **CI/CD Pipeline**: Define automated deployment process
- [ ] **Environment Management**: Separate dev/staging/production environments
- [ ] **Database Migrations**: Plan for schema evolution and data migration
- [ ] **Health Checks**: Implement system health monitoring
- [ ] **Disaster Recovery**: Define backup and recovery procedures

### User Experience
- [ ] **Error Handling**: User-friendly error messages and recovery options
- [ ] **Loading States**: Clear feedback during file processing
- [ ] **Mobile Responsiveness**: Ensure dashboard works on mobile devices
- [ ] **Accessibility**: Implement WCAG compliance for Hebrew RTL support
- [ ] **User Onboarding**: Tutorial or help system for new users

### Business & Compliance
- [ ] **Data Retention Policy**: Define how long to keep audio files and transcripts
- [ ] **Audit Trail**: Track who accessed what data and when
- [ ] **Export Formats**: Support for various data export formats (CSV, Excel, PDF)
- [ ] **Multi-tenant Support**: Plan for multiple sales teams/organizations
- [ ] **API Documentation**: Comprehensive API documentation for future integrations

---

## Contact & Support

**Project Owner**: [Your Name]  
**Technical Lead**: [Developer Name]  
**Start Date**: [Date]  
**Target Completion**: [Date]  

---

*This document serves as the primary reference for the Hebrew Sales Call Analysis System development and should be updated as the project evolves.* 