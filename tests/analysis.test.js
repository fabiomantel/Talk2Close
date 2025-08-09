/**
 * Comprehensive Analysis Route Tests
 * Tests the complete analysis pipeline: transcription and scoring
 */

const request = require('supertest');
const app = require('../src/server');
const { prisma } = require('../src/database/connection');

// Mock services
jest.mock('../src/services/whisperService');
jest.mock('../src/services/scoringService');

const whisperService = require('../src/services/whisperService');
const scoringService = require('../src/services/scoringService');

describe('Analysis Routes - /api/analyze', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default service mocks
    whisperService.validateAudioFile.mockResolvedValue();
    whisperService.transcribeAudio.mockResolvedValue({
      text: 'שלום, אני מעוניין בנכס בתל אביב. התקציב שלי הוא 800 אלף שקל.',
      language: 'he',
      duration: 180,
      wordCount: 12
    });
    whisperService.getTranscriptionStats.mockReturnValue({
      wordCount: 12,
      characterCount: 68,
      duration: 180,
      wordsPerMinute: 4,
      estimatedSpeakingRate: 'Slow'
    });

    scoringService.analyzeTranscript.mockReturnValue({
      scores: {
        urgency: 75,
        budget: 85,
        interest: 90,
        engagement: 70,
        overall: 80
      },
      analysis: {
        keyPhrases: {
          urgency: ['מעוניין'],
          budget: ['800 אלף שקל'],
          interest: ['נכס בתל אביב'],
          engagement: ['שלום']
        },
        objections: [],
        notes: 'לקוח בעל פוטנציאל גבוה עם תקציב ברור ועניין אמיתי',
        confidence: 90
      }
    });
  });

  afterEach(async () => {
    // Clean up database
    await prisma.salesCall.deleteMany();
    await prisma.customer.deleteMany();
  });

  describe('POST /api/analyze - Full Analysis', () => {
    test('should perform complete analysis workflow successfully', async () => {
      // First create a sales call to analyze
      const customer = await prisma.customer.create({
        data: {
          name: 'ישראל ישראלי',
          phone: '050-1234567',
          email: 'israel@example.com'
        }
      });

      const salesCall = await prisma.salesCall.create({
        data: {
          customerId: customer.id,
          audioFilePath: '/uploads/test_call.mp3'
        }
      });

      const response = await request(app)
        .post('/api/analyze')
        .send({ salesCallId: salesCall.id })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Analysis completed successfully');
      expect(response.body.data).toHaveProperty('salesCall');
      expect(response.body.data).toHaveProperty('transcription');
      expect(response.body.data).toHaveProperty('scoring');

      // Verify transcription data
      expect(response.body.data.transcription.text).toBe('שלום, אני מעוניין בנכס בתל אביב. התקציב שלי הוא 800 אלף שקל.');
      expect(response.body.data.transcription.stats).toMatchObject({
        wordCount: 12,
        characterCount: 68,
        estimatedSpeakingRate: 'Slow'
      });

      // Verify scoring data
      expect(response.body.data.scoring.scores.overall).toBe(80);
      expect(response.body.data.scoring.analysis.confidence).toBe(90);

      // Verify services were called correctly
      expect(whisperService.validateAudioFile).toHaveBeenCalledWith('/uploads/test_call.mp3');
      expect(whisperService.transcribeAudio).toHaveBeenCalledWith('/uploads/test_call.mp3');
      expect(scoringService.analyzeTranscript).toHaveBeenCalledWith(
        'שלום, אני מעוניין בנכס בתל אביב. התקציב שלי הוא 800 אלף שקל.',
        180,
        12
      );

      // Verify database was updated
      const updatedCall = await prisma.salesCall.findUnique({
        where: { id: salesCall.id }
      });
      expect(updatedCall.transcript).toBe('שלום, אני מעוניין בנכס בתל אביב. התקציב שלי הוא 800 אלף שקל.');
      expect(updatedCall.overallScore).toBe(80);
      expect(updatedCall.urgencyScore).toBe(75);
    });

    test('should return 400 for missing salesCallId', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Valid sales call ID is required'
          })
        ])
      );
    });

    test('should return 400 for invalid salesCallId format', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ salesCallId: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    test('should return 404 for non-existent sales call', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ salesCallId: 999999 })
        .expect(404);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Sales call not found');
    });

    test('should return 400 if sales call already analyzed', async () => {
      const customer = await prisma.customer.create({
        data: {
          name: 'כבר מנותח',
          phone: '050-9999999'
        }
      });

      const salesCall = await prisma.salesCall.create({
        data: {
          customerId: customer.id,
          audioFilePath: '/uploads/already_analyzed.mp3',
          transcript: 'תמלול קיים',
          overallScore: 75
        }
      });

      const response = await request(app)
        .post('/api/analyze')
        .send({ salesCallId: salesCall.id })
        .expect(400);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Sales call has already been analyzed');
      expect(response.body.data).toMatchObject({
        salesCallId: salesCall.id,
        hasTranscript: true,
        hasScores: true
      });
    });

    test('should handle whisper service validation errors', async () => {
      whisperService.validateAudioFile.mockRejectedValue(new Error('Unsupported audio format'));

      const customer = await prisma.customer.create({
        data: {
          name: 'קובץ לא תקין',
          phone: '050-8888888'
        }
      });

      const salesCall = await prisma.salesCall.create({
        data: {
          customerId: customer.id,
          audioFilePath: '/uploads/invalid.txt'
        }
      });

      const response = await request(app)
        .post('/api/analyze')
        .send({ salesCallId: salesCall.id })
        .expect(500);

      expect(response.body).toHaveProperty('error', true);
    });

    test('should handle transcription service errors', async () => {
      whisperService.transcribeAudio.mockRejectedValue(new Error('API rate limit exceeded'));

      const customer = await prisma.customer.create({
        data: {
          name: 'שגיאת תמלול',
          phone: '050-7777777'
        }
      });

      const salesCall = await prisma.salesCall.create({
        data: {
          customerId: customer.id,
          audioFilePath: '/uploads/transcription_error.mp3'
        }
      });

      const response = await request(app)
        .post('/api/analyze')
        .send({ salesCallId: salesCall.id })
        .expect(500);

      expect(response.body).toHaveProperty('error', true);
    });
  });

  describe('GET /api/analyze/:id - Get Analysis Results', () => {
    test('should get analysis results for completed analysis', async () => {
      const customer = await prisma.customer.create({
        data: {
          name: 'תוצאות ניתוח',
          phone: '050-6666666',
          email: 'results@example.com'
        }
      });

      const salesCall = await prisma.salesCall.create({
        data: {
          customerId: customer.id,
          audioFilePath: '/uploads/completed.mp3',
          transcript: 'תמלול מלא של השיחה',
          urgencyScore: 80,
          budgetScore: 75,
          interestScore: 85,
          engagementScore: 70,
          overallScore: 78,
          analysisNotes: 'לקוח בעל פוטנציאל טוב'
        }
      });

      const response = await request(app)
        .get(`/api/analyze/${salesCall.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.id).toBe(salesCall.id);
      expect(response.body.data.transcript).toBe('תמלול מלא של השיחה');
      expect(response.body.data.overallScore).toBe(78);
      expect(response.body.data.analysisStatus).toBe('transcribed');
      expect(response.body.data.scoringStatus).toBe('completed');
      expect(response.body.data.customer).toMatchObject({
        name: 'תוצאות ניתוח',
        phone: '050-6666666'
      });
    });

    test('should get pending analysis status', async () => {
      const customer = await prisma.customer.create({
        data: {
          name: 'ממתין לניתוח',
          phone: '050-5555555'
        }
      });

      const salesCall = await prisma.salesCall.create({
        data: {
          customerId: customer.id,
          audioFilePath: '/uploads/pending.mp3'
        }
      });

      const response = await request(app)
        .get(`/api/analyze/${salesCall.id}`)
        .expect(200);

      expect(response.body.data.analysisStatus).toBe('pending');
      expect(response.body.data.scoringStatus).toBe('pending');
      expect(response.body.data.transcript).toBeNull();
      expect(response.body.data.overallScore).toBeNull();
    });

    test('should return 404 for non-existent analysis', async () => {
      const response = await request(app)
        .get('/api/analyze/999999')
        .expect(404);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Sales call not found');
    });
  });

  describe('GET /api/analyze - List Analyses', () => {
    beforeEach(async () => {
      // Create test data for listing
      const customer1 = await prisma.customer.create({
        data: {
          name: 'לקוח ראשון',
          phone: '050-1111111'
        }
      });

      const customer2 = await prisma.customer.create({
        data: {
          name: 'לקוח שני',
          phone: '050-2222222'
        }
      });

      await prisma.salesCall.createMany({
        data: [
          {
            customerId: customer1.id,
            audioFilePath: '/uploads/call1.mp3',
            transcript: 'תמלול ראשון',
            overallScore: 80
          },
          {
            customerId: customer1.id,
            audioFilePath: '/uploads/call2.mp3',
            transcript: 'תמלול שני',
            overallScore: null
          },
          {
            customerId: customer2.id,
            audioFilePath: '/uploads/call3.mp3',
            transcript: null,
            overallScore: null
          }
        ]
      });
    });

    test('should list all analyses with pagination', async () => {
      const response = await request(app)
        .get('/api/analyze')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('analyses');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.analyses).toHaveLength(3);

      const analysis = response.body.data.analyses[0];
      expect(analysis).toHaveProperty('id');
      expect(analysis).toHaveProperty('customer');
      expect(analysis).toHaveProperty('analysisStatus');
      expect(analysis).toHaveProperty('scoringStatus');
    });

    test('should filter by transcription status', async () => {
      const response = await request(app)
        .get('/api/analyze?status=transcribed')
        .expect(200);

      expect(response.body.data.analyses).toHaveLength(2);
      response.body.data.analyses.forEach(analysis => {
        expect(analysis.transcript).toBeTruthy();
      });
    });

    test('should filter by pending status', async () => {
      const response = await request(app)
        .get('/api/analyze?status=pending')
        .expect(200);

      expect(response.body.data.analyses).toHaveLength(1);
      expect(response.body.data.analyses[0].transcript).toBeNull();
    });

    test('should filter by scored status', async () => {
      const response = await request(app)
        .get('/api/analyze?status=scored')
        .expect(200);

      expect(response.body.data.analyses).toHaveLength(1);
      expect(response.body.data.analyses[0].overallScore).toBeTruthy();
    });

    test('should filter by customer ID', async () => {
      const customer = await prisma.customer.findFirst();
      
      const response = await request(app)
        .get(`/api/analyze?customerId=${customer.id}`)
        .expect(200);

      expect(response.body.data.analyses).toHaveLength(2);
      response.body.data.analyses.forEach(analysis => {
        expect(analysis.customerId).toBe(customer.id);
      });
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/analyze?page=1&limit=2')
        .expect(200);

      expect(response.body.data.analyses).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(3);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });
  });

  describe('POST /api/analyze/:id/score - Score Existing Transcript', () => {
    test('should score existing transcript successfully', async () => {
      const customer = await prisma.customer.create({
        data: {
          name: 'לניקוד',
          phone: '050-4444444'
        }
      });

      const salesCall = await prisma.salesCall.create({
        data: {
          customerId: customer.id,
          audioFilePath: '/uploads/to_score.mp3',
          transcript: 'שלום, אני מעוניין מאוד בנכס. התקציב שלי הוא מיליון שקל והזמן דוחק.'
        }
      });

      const response = await request(app)
        .post(`/api/analyze/${salesCall.id}/score`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Scoring completed successfully');
      expect(response.body.data.salesCall.overallScore).toBe(80);
      expect(response.body.data.scoring.scores.overall).toBe(80);

      // Verify database was updated
      const updatedCall = await prisma.salesCall.findUnique({
        where: { id: salesCall.id }
      });
      expect(updatedCall.overallScore).toBe(80);
      expect(updatedCall.urgencyScore).toBe(75);
      expect(updatedCall.analysisNotes).toBe('לקוח בעל פוטנציאל גבוה עם תקציב ברור ועניין אמיתי');
    });

    test('should return 404 for non-existent sales call', async () => {
      const response = await request(app)
        .post('/api/analyze/999999/score')
        .expect(404);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Sales call not found');
    });

    test('should return 400 if no transcript available', async () => {
      const customer = await prisma.customer.create({
        data: {
          name: 'אין תמלול',
          phone: '050-3333333'
        }
      });

      const salesCall = await prisma.salesCall.create({
        data: {
          customerId: customer.id,
          audioFilePath: '/uploads/no_transcript.mp3'
        }
      });

      const response = await request(app)
        .post(`/api/analyze/${salesCall.id}/score`)
        .expect(400);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'No transcript available for scoring');
    });

    test('should return 400 if already scored', async () => {
      const customer = await prisma.customer.create({
        data: {
          name: 'כבר מנוקד',
          phone: '050-2222222'
        }
      });

      const salesCall = await prisma.salesCall.create({
        data: {
          customerId: customer.id,
          audioFilePath: '/uploads/already_scored.mp3',
          transcript: 'תמלול קיים',
          overallScore: 75
        }
      });

      const response = await request(app)
        .post(`/api/analyze/${salesCall.id}/score`)
        .expect(400);

      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Sales call has already been scored');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle scoring service errors', async () => {
      scoringService.analyzeTranscript.mockImplementation(() => {
        throw new Error('Scoring algorithm failed');
      });

      const customer = await prisma.customer.create({
        data: {
          name: 'שגיאת ניקוד',
          phone: '050-1111111'
        }
      });

      const salesCall = await prisma.salesCall.create({
        data: {
          customerId: customer.id,
          audioFilePath: '/uploads/scoring_error.mp3'
        }
      });

      const response = await request(app)
        .post('/api/analyze')
        .send({ salesCallId: salesCall.id })
        .expect(500);

      expect(response.body).toHaveProperty('error', true);
    });

    test('should handle database transaction errors during analysis', async () => {
      // Mock database error
      jest.spyOn(prisma.salesCall, 'update').mockRejectedValue(new Error('Database connection lost'));

      const customer = await prisma.customer.create({
        data: {
          name: 'שגיאת מסד נתונים',
          phone: '050-0000000'
        }
      });

      const salesCall = await prisma.salesCall.create({
        data: {
          customerId: customer.id,
          audioFilePath: '/uploads/db_error.mp3'
        }
      });

      const response = await request(app)
        .post('/api/analyze')
        .send({ salesCallId: salesCall.id })
        .expect(500);

      expect(response.body).toHaveProperty('error', true);
    });
  });
});
