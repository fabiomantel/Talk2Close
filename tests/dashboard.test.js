/**
 * Comprehensive Dashboard Route Tests
 * Tests dashboard data aggregation, statistics, and analytics endpoints
 */

const request = require('supertest');
const app = require('../src/server');
const { prisma } = require('../src/database/connection');

describe('Dashboard Routes - /api/dashboard', () => {
  beforeEach(async () => {
    // Clean database and create test data
    await prisma.salesCall.deleteMany();
    await prisma.customer.deleteMany();

    // Create test customers
    const customer1 = await prisma.customer.create({
      data: {
        name: 'לקוח גבוה',
        phone: '050-1111111',
        email: 'high@example.com'
      }
    });

    const customer2 = await prisma.customer.create({
      data: {
        name: 'לקוח בינוני',
        phone: '050-2222222',
        email: 'medium@example.com'
      }
    });

    const customer3 = await prisma.customer.create({
      data: {
        name: 'לקוח נמוך',
        phone: '050-3333333'
      }
    });

    // Create sales calls with varying scores
    await prisma.salesCall.createMany({
      data: [
        // High scoring customer
        {
          customerId: customer1.id,
          audioFilePath: '/uploads/high1.mp3',
          transcript: 'שיחה מצוינת עם ניקוד גבוה',
          urgencyScore: 90,
          budgetScore: 85,
          interestScore: 95,
          engagementScore: 88,
          overallScore: 89,
          analysisNotes: 'לקוח בעל פוטנציאל גבוה מאוד'
        },
        {
          customerId: customer1.id,
          audioFilePath: '/uploads/high2.mp3',
          transcript: 'שיחה נוספת טובה',
          urgencyScore: 85,
          budgetScore: 80,
          interestScore: 90,
          engagementScore: 82,
          overallScore: 84,
          analysisNotes: 'המשך חיובי'
        },
        // Medium scoring customer
        {
          customerId: customer2.id,
          audioFilePath: '/uploads/medium1.mp3',
          transcript: 'שיחה בינונית',
          urgencyScore: 60,
          budgetScore: 55,
          interestScore: 65,
          engagementScore: 58,
          overallScore: 60,
          analysisNotes: 'לקוח עם פוטנציאל בינוני'
        },
        // Low scoring customer
        {
          customerId: customer3.id,
          audioFilePath: '/uploads/low1.mp3',
          transcript: 'שיחה עם ניקוד נמוך',
          urgencyScore: 30,
          budgetScore: 25,
          interestScore: 35,
          engagementScore: 28,
          overallScore: 30,
          analysisNotes: 'לקוח עם פוטנציאל נמוך'
        },
        // Call without transcript (pending analysis)
        {
          customerId: customer3.id,
          audioFilePath: '/uploads/pending.mp3'
        }
      ]
    });
  });

  afterEach(async () => {
    await prisma.salesCall.deleteMany();
    await prisma.customer.deleteMany();
  });

  describe('GET /api/dashboard/stats - Dashboard Statistics', () => {
    test('should return comprehensive dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('scores');

      const overview = response.body.data.overview;
      expect(overview).toHaveProperty('totalCustomers');
      expect(overview.totalCustomers).toBe(3);

      const scores = response.body.data.scores;
      expect(scores).toHaveProperty('avgOverall');
      expect(scores.avgOverall).toBeGreaterThan(0);
    });

    test('should include score statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      const scores = response.body.data.scores;
      expect(scores).toHaveProperty('avgOverall');
      expect(scores).toHaveProperty('avgUrgency');
      expect(scores).toHaveProperty('avgBudget');
      expect(scores).toHaveProperty('avgInterest');
      expect(scores).toHaveProperty('avgEngagement');
    });

    test('should handle empty database gracefully', async () => {
      // Clear all data
      await prisma.salesCall.deleteMany();
      await prisma.customer.deleteMany();

      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      const overview = response.body.data.overview;
      expect(overview.totalCustomers).toBe(0);
      expect(response.body.data.scores.avgOverall).toBe(0);
    });
  });

  describe('GET /api/dashboard/scoring-analytics - Scoring Analytics', () => {
    test('should return detailed scoring analysis', async () => {
      const response = await request(app)
        .get('/api/dashboard/scoring-analytics')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('period');
      expect(response.body.data).toHaveProperty('avgScores');
      expect(response.body.data).toHaveProperty('scoreRanges');
      expect(response.body.data).toHaveProperty('topPerformers');
    });

    test('should include score range distribution', async () => {
      const response = await request(app)
        .get('/api/dashboard/scoring-analytics')
        .expect(200);

      const scoreRanges = response.body.data.scoreRanges;
      expect(scoreRanges).toHaveProperty('high');
      expect(scoreRanges).toHaveProperty('medium');
      expect(scoreRanges).toHaveProperty('low');
    });
  });

  describe('GET /api/dashboard/analytics - Advanced Analytics', () => {
    test('should return detailed analytics data', async () => {
      const response = await request(app)
        .get('/api/dashboard/analytics')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('avgScores');
      expect(response.body.data).toHaveProperty('scoreRanges');
      expect(response.body.data).toHaveProperty('topPerformers');
    });

    test('should include score statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/analytics')
        .expect(200);

      const avgScores = response.body.data.avgScores;
      expect(avgScores).toHaveProperty('overall');
      expect(avgScores).toHaveProperty('urgency');
      expect(avgScores).toHaveProperty('budget');
      expect(avgScores).toHaveProperty('interest');
      expect(avgScores).toHaveProperty('engagement');
    });

    test('should include top performing customers', async () => {
      const response = await request(app)
        .get('/api/dashboard/analytics')
        .expect(200);

      const topPerformers = response.body.data.topPerformers;
      expect(topPerformers).toBeInstanceOf(Array);
      
      if (topPerformers.length > 0) {
        const performer = topPerformers[0];
        expect(performer).toHaveProperty('customerName');
        expect(performer).toHaveProperty('overallScore');
        expect(performer).toHaveProperty('callDate');
      }
    });
  });

  describe('Performance and Error Handling', () => {
    test('should handle large datasets efficiently', async () => {
      // Create additional test data
      const customers = [];
      for (let i = 0; i < 5; i++) {
        customers.push(await prisma.customer.create({
          data: {
            name: `לקוח ${i}`,
            phone: `050-${String(i).padStart(7, '0')}`
          }
        }));
      }

      // Create many sales calls
      const salesCallsData = [];
      customers.forEach((customer, i) => {
        for (let j = 0; j < 3; j++) {
          salesCallsData.push({
            customerId: customer.id,
            audioFilePath: `/uploads/bulk_${i}_${j}.mp3`,
            transcript: `שיחה ${j + 1} של לקוח ${i}`,
            overallScore: Math.floor(Math.random() * 100)
          });
        }
      });
      
      await prisma.salesCall.createMany({ data: salesCallsData });

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);
      const endTime = Date.now();

      // Should respond within reasonable time
      expect(endTime - startTime).toBeLessThan(2000);
      expect(response.body.data.overview.totalCustomers).toBeGreaterThan(5);
    });

    test('should provide consistent data across endpoints', async () => {
      const [statsResponse, analyticsResponse] = await Promise.all([
        request(app).get('/api/dashboard/stats'),
        request(app).get('/api/dashboard/analytics')
      ]);

      const statsCustomers = statsResponse.body.data.overview.totalCustomers;
      const analyticsCustomers = analyticsResponse.body.data.uniqueCustomers;
      
      expect(statsCustomers).toBe(analyticsCustomers);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(prisma.salesCall, 'count').mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(500);

      expect(response.body).toHaveProperty('error', true);
    });

    test('should handle missing data gracefully', async () => {
      // Create customers without any calls
      await prisma.salesCall.deleteMany();
      
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      expect(response.body.data.overview.totalCustomers).toBeGreaterThanOrEqual(0);
      expect(response.body.data.scores.avgOverall).toBe(0);
    });
  });
});
