/**
 * End-to-End Integration Tests
 * Tests complete workflows from file upload through analysis to customer insights
 */

const request = require('supertest');
const app = require('../src/server');
const { prisma } = require('../src/database/connection');

// Mock services for controlled testing
jest.mock('../src/services/whisperService');
jest.mock('../src/services/scoringService');

const whisperService = require('../src/services/whisperService');
const scoringService = require('../src/services/scoringService');

describe('End-to-End Integration Tests', () => {
  beforeEach(async () => {
    // Clean database
    await prisma.salesCall.deleteMany();
    await prisma.customer.deleteMany();
    
    // Clear mocks
    jest.clearAllMocks();
    
    // Setup default service mocks
    whisperService.validateAudioFile.mockResolvedValue();
    whisperService.transcribeAudio.mockResolvedValue({
      text: 'שלום, אני מעוניין בדירה בתל אביב. התקציב שלי 800 אלף שקל ואני צריך משהו דחוף.',
      language: 'he',
      duration: 180,
      wordCount: 15
    });
    
    scoringService.analyzeTranscript.mockReturnValue({
      scores: {
        urgency: 85,
        budget: 75,
        interest: 90,
        engagement: 80,
        overall: 82
      },
      analysis: {
        keyPhrases: {
          urgency: ['דחוף'],
          budget: ['800 אלף שקל'],
          interest: ['מעוניין'],
          engagement: ['בתל אביב']
        },
        confidence: 88,
        notes: 'לקוח בעל פוטנציאל גבוה עם תקציב מוגדר ודחיפות גבוהה',
        objections: []
      }
    });
  });

  afterEach(async () => {
    await prisma.salesCall.deleteMany();
    await prisma.customer.deleteMany();
  });

  describe('Complete Workflow: Upload → Transcribe → Analyze → Insights', () => {
    test.skip('should process new customer end-to-end successfully', async () => {
      // Step 1: Upload audio file for new customer
      const uploadResponse = await request(app)
        .post('/api/upload')
        .attach('audio', Buffer.from('fake-audio-data'), 'customer-call.mp3')
        .field('customerName', 'דני כהן')
        .field('customerPhone', '050-1234567')
        .field('customerEmail', 'danny@example.com')
        .expect(201);

      expect(uploadResponse.body).toHaveProperty('success', true);
      expect(uploadResponse.body.data).toHaveProperty('customer');
      expect(uploadResponse.body.data).toHaveProperty('salesCallId');
      
      const customerId = uploadResponse.body.data.customer.id;
      const salesCallId = uploadResponse.body.data.salesCallId;

      // Step 2: Verify customer was created
      const customerResponse = await request(app)
        .get(`/api/customers/${customerId}`)
        .expect(200);

      expect(customerResponse.body.data.customer.name).toBe('דני כהן');
      expect(customerResponse.body.data.customer.phone).toBe('050-1234567');
      expect(customerResponse.body.data.stats.totalCalls).toBe(1);

      // Step 3: Verify transcription was completed
      const callResponse = await request(app)
        .get(`/api/upload/${salesCallId}`)
        .expect(200);

      expect(callResponse.body.data.transcript).toContain('מעוניין');
      expect(callResponse.body.data.overallScore).toBe(82);

      // Step 4: Verify analysis is available
      const analysisResponse = await request(app)
        .get(`/api/analyze/${salesCallId}`)
        .expect(200);

      expect(analysisResponse.body.data.analysis).toHaveProperty('keyPhrases');
      expect(analysisResponse.body.data.analysis.confidence).toBe(88);

      // Step 5: Check dashboard reflects new data
      const dashboardResponse = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      expect(dashboardResponse.body.data.overview.totalCustomers).toBe(1);
      expect(dashboardResponse.body.data.overview.totalSalesCalls).toBe(1);
      expect(dashboardResponse.body.data.scores.avgOverall).toBe(82);
    });

    test.skip('should handle existing customer with multiple calls', async () => {
      // Create initial customer and call
      const firstUpload = await request(app)
        .post('/api/upload')
        .attach('audio', Buffer.from('fake-audio-data-1'), 'call1.mp3')
        .field('customerName', 'שרה לוי')
        .field('customerPhone', '052-9876543')
        .expect(201);

      const customerId = firstUpload.body.data.customer.id;

      // Second call from same customer (reuse by phone)
      scoringService.analyzeTranscript.mockReturnValueOnce({
        scores: {
          urgency: 70,
          budget: 65,
          interest: 85,
          engagement: 75,
          overall: 74
        },
        analysis: {
          keyPhrases: {
            urgency: ['בזמן הקרוב'],
            budget: ['משכנתא'],
            interest: ['מתאים'],
            engagement: ['פרטים']
          },
          confidence: 82,
          notes: 'שיחת המשך - עניין מתמשך',
          objections: ['מחיר גבוה']
        }
      });

      const secondUpload = await request(app)
        .post('/api/upload')
        .attach('audio', Buffer.from('fake-audio-data-2'), 'call2.mp3')
        .field('customerName', 'שרה לוי') // Same name
        .field('customerPhone', '052-9876543') // Same phone - should reuse customer
        .expect(201);

      // Should reuse same customer
      expect(secondUpload.body.data.customer.id).toBe(customerId);

      // Verify customer now has 2 calls
      const customerResponse = await request(app)
        .get(`/api/customers/${customerId}`)
        .expect(200);

      expect(customerResponse.body.data.stats.totalCalls).toBe(2);
      expect(customerResponse.body.data.stats.avgScores.overall).toBeGreaterThan(0);

      // Verify both calls exist
      expect(customerResponse.body.data.salesCalls).toHaveLength(2);
      
      // Dashboard should show 1 customer, 2 calls
      const dashboardResponse = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      expect(dashboardResponse.body.data.overview.totalCustomers).toBe(1);
      expect(dashboardResponse.body.data.overview.totalSalesCalls).toBe(2);
    });

    test.skip('should handle complete analysis pipeline with Hebrew content', async () => {
      whisperService.transcribeAudio.mockResolvedValue({
        text: 'שלום רב, אני מחפש דירה בעיר. יש לי תקציב של מיליון שקל ואני מאוד דחוף לקנות. מה יש לכם להציע?',
        language: 'he',
        duration: 240,
        wordCount: 20
      });

      scoringService.analyzeTranscript.mockReturnValue({
        scores: {
          urgency: 95,
          budget: 85,
          interest: 92,
          engagement: 88,
          overall: 90
        },
        analysis: {
          keyPhrases: {
            urgency: ['מאוד דחוף'],
            budget: ['מיליון שקל'],
            interest: ['מחפש דירה'],
            engagement: ['מה יש לכם']
          },
          confidence: 94,
          notes: 'לקוח איכותי עם תקציב גבוה ודחיפות מקסימלית',
          objections: []
        }
      });

      const uploadResponse = await request(app)
        .post('/api/upload')
        .attach('audio', Buffer.from('hebrew-audio-content'), 'hebrew-call.mp3')
        .field('customerName', 'יוסי ישראלי')
        .field('customerPhone', '054-5555555')
        .expect(201);

      const salesCallId = uploadResponse.body.data.salesCallId;

      // Verify Hebrew text processing
      const callDetails = await request(app)
        .get(`/api/upload/${salesCallId}`)
        .expect(200);

      expect(callDetails.body.data.transcript).toContain('מיליון שקל');
      expect(callDetails.body.data.overallScore).toBe(90);

      // Verify analysis results
      const analysisResponse = await request(app)
        .get(`/api/analyze/${salesCallId}`)
        .expect(200);

      const analysis = analysisResponse.body.data.analysis;
      expect(analysis.keyPhrases.urgency).toContain('מאוד דחוף');
      expect(analysis.keyPhrases.budget).toContain('מיליון שקל');
      expect(analysis.confidence).toBe(94);
    });
  });

  describe('Customer Lifecycle Integration', () => {
    test.skip('should track customer progression through multiple interactions', async () => {
      const customerData = {
        name: 'מרים אברהם',
        phone: '053-1111111',
        email: 'miriam@example.com'
      };

      // Interaction 1: Initial inquiry (medium interest)
      scoringService.analyzeTranscript.mockReturnValueOnce({
        scores: { urgency: 40, budget: 50, interest: 60, engagement: 45, overall: 49 },
        analysis: { confidence: 75, notes: 'בדיקת אפשרויות ראשונית', keyPhrases: {}, objections: [] }
      });

      const call1 = await request(app)
        .post('/api/upload')
        .attach('audio', Buffer.from('call1'), 'inquiry.mp3')
        .field('customerName', customerData.name)
        .field('customerPhone', customerData.phone)
        .field('customerEmail', customerData.email)
        .expect(201);

      const customerId = call1.body.data.customer.id;

      // Interaction 2: Follow-up with higher interest
      scoringService.analyzeTranscript.mockReturnValueOnce({
        scores: { urgency: 70, budget: 75, interest: 85, engagement: 80, overall: 78 },
        analysis: { confidence: 88, notes: 'עניין מתגבר', keyPhrases: {}, objections: [] }
      });

      await request(app)
        .post('/api/upload')
        .attach('audio', Buffer.from('call2'), 'followup.mp3')
        .field('customerName', customerData.name)
        .field('customerPhone', customerData.phone)
        .expect(201);

      // Interaction 3: Ready to proceed (high scores)
      scoringService.analyzeTranscript.mockReturnValueOnce({
        scores: { urgency: 90, budget: 85, interest: 95, engagement: 88, overall: 90 },
        analysis: { confidence: 92, notes: 'מוכן לרכישה', keyPhrases: {}, objections: [] }
      });

      await request(app)
        .post('/api/upload')
        .attach('audio', Buffer.from('call3'), 'ready.mp3')
        .field('customerName', customerData.name)
        .field('customerPhone', customerData.phone)
        .expect(201);

      // Verify progression tracking
      const customerResponse = await request(app)
        .get(`/api/customers/${customerId}`)
        .expect(200);

      const customer = customerResponse.body.data;
      expect(customer.stats.totalCalls).toBe(3);
      expect(customer.stats.avgScores.overall).toBeGreaterThan(70); // Average should reflect improvement

      // Verify calls are ordered chronologically
      const calls = customer.salesCalls;
      expect(calls).toHaveLength(3);
      expect(new Date(calls[0].createdAt) >= new Date(calls[1].createdAt)).toBe(true);
      expect(new Date(calls[1].createdAt) >= new Date(calls[2].createdAt)).toBe(true);

      // Check analytics shows progression
      const analyticsResponse = await request(app)
        .get('/api/dashboard/analytics')
        .expect(200);

      expect(analyticsResponse.body.data.topPerformers.length).toBeGreaterThan(0);
      const topPerformer = analyticsResponse.body.data.topPerformers[0];
      expect(topPerformer.customerName).toBe('מרים אברהם');
      expect(topPerformer.overallScore).toBe(90); // Latest high score
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('should handle transcription failure gracefully', async () => {
      whisperService.transcribeAudio.mockRejectedValue(new Error('Transcription service unavailable'));

      const uploadResponse = await request(app)
        .post('/api/upload')
        .attach('audio', Buffer.from('problematic-audio'), 'problem.mp3')
        .field('customerName', 'לקוח בעיה')
        .field('customerPhone', '050-9999999')
        .expect(201); // Should still succeed

      const salesCallId = uploadResponse.body.data.salesCallId;

      // Call should exist but without transcript
      const callResponse = await request(app)
        .get(`/api/upload/${salesCallId}`)
        .expect(200);

      expect(callResponse.body.data.transcript).toBeNull();
      expect(callResponse.body.data.overallScore).toBeNull();

      // Customer should still be created
      const customerId = uploadResponse.body.data.customer.id;
      const customerResponse = await request(app)
        .get(`/api/customers/${customerId}`)
        .expect(200);

      expect(customerResponse.body.data.customer.name).toBe('לקוח בעיה');
      expect(customerResponse.body.data.stats.totalCalls).toBe(1);
      expect(customerResponse.body.data.stats.analyzedCalls).toBe(0);
    });

    test.skip('should handle scoring failure after successful transcription', async () => {
      scoringService.analyzeTranscript.mockImplementation(() => {
        throw new Error('Scoring service unavailable');
      });

      const uploadResponse = await request(app)
        .post('/api/upload')
        .attach('audio', Buffer.from('audio-no-score'), 'transcript-only.mp3')
        .field('customerName', 'תמליל בלבד')
        .field('customerPhone', '050-8888888')
        .expect(201);

      const salesCallId = uploadResponse.body.data.salesCallId;

      // Should have transcript but no scores
      const callResponse = await request(app)
        .get(`/api/upload/${salesCallId}`)
        .expect(200);

      expect(callResponse.body.data.transcript).toContain('מעוניין');
      expect(callResponse.body.data.overallScore).toBeNull();
      expect(callResponse.body.data.urgencyScore).toBeNull();
    });

    test.skip('should handle concurrent uploads from same customer', async () => {
      const customerData = {
        name: 'לקוח מקבילי',
        phone: '050-7777777'
      };

      // Simulate concurrent uploads
      const upload1Promise = request(app)
        .post('/api/upload')
        .attach('audio', Buffer.from('concurrent1'), 'concurrent1.mp3')
        .field('customerName', customerData.name)
        .field('customerPhone', customerData.phone);

      const upload2Promise = request(app)
        .post('/api/upload')
        .attach('audio', Buffer.from('concurrent2'), 'concurrent2.mp3')
        .field('customerName', customerData.name)
        .field('customerPhone', customerData.phone);

      const [upload1, upload2] = await Promise.all([upload1Promise, upload2Promise]);

      // Both should succeed
      expect(upload1.status).toBe(201);
      expect(upload2.status).toBe(201);

      // Should use same customer
      expect(upload1.body.data.customer.id).toBe(upload2.body.data.customer.id);

      const customerId = upload1.body.data.customer.id;
      const customerResponse = await request(app)
        .get(`/api/customers/${customerId}`)
        .expect(200);

      // Should have both calls
      expect(customerResponse.body.data.stats.totalCalls).toBe(2);
    });
  });

  describe('Data Consistency Validation', () => {
    test.skip('should maintain data consistency across all endpoints', async () => {
      // Create test data
      const customers = [];
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/upload')
          .attach('audio', Buffer.from(`test-data-${i}`), `test${i}.mp3`)
          .field('customerName', `לקוח ${i}`)
          .field('customerPhone', `050-000000${i}`)
          .expect(201);
        
        customers.push(response.body.data.customer);
      }

      // Fetch data from all endpoints
      const [dashboardStats, analyticsData, customersList] = await Promise.all([
        request(app).get('/api/dashboard/stats'),
        request(app).get('/api/dashboard/analytics'),
        request(app).get('/api/customers')
      ]);

      // Verify consistency
      const statsCustomers = dashboardStats.body.data.overview.totalCustomers;
      const analyticsCustomers = analyticsData.body.data.uniqueCustomers;
      const customersListCount = customersList.body.data.customers.length;

      expect(statsCustomers).toBe(3);
      expect(analyticsCustomers).toBe(3);
      expect(customersListCount).toBe(3);

      // Verify call counts match
      const statsCalls = dashboardStats.body.data.overview.totalSalesCalls;
      const analyticsCalls = analyticsData.body.data.totalCalls;

      expect(statsCalls).toBe(3);
      expect(analyticsCalls).toBe(3);
    });

    test('should handle database cleanup correctly', async () => {
      // Create test data
      const uploadResponse = await request(app)
        .post('/api/upload')
        .attach('audio', Buffer.from('cleanup-test'), 'cleanup.mp3')
        .field('customerName', 'לקוח למחיקה')
        .field('customerPhone', '050-DELETE')
        .expect(201);

      const customerId = uploadResponse.body.data.customer.id;
      const salesCallId = uploadResponse.body.data.salesCallId;

      // Verify data exists
      await request(app).get(`/api/customers/${customerId}`).expect(200);
      await request(app).get(`/api/upload/${salesCallId}`).expect(200);

      // Delete customer (should cascade)
      await request(app).delete(`/api/customers/${customerId}`).expect(200);

      // Verify cleanup
      await request(app).get(`/api/customers/${customerId}`).expect(404);
      await request(app).get(`/api/upload/${salesCallId}`).expect(404);

      // Dashboard should reflect changes
      const dashboardResponse = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      expect(dashboardResponse.body.data.overview.totalCustomers).toBe(0);
      expect(dashboardResponse.body.data.overview.totalSalesCalls).toBe(0);
    });
  });
});
