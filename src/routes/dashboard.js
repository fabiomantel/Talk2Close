const express = require('express');
const { prisma } = require('../database/connection');

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    // Get basic counts
    const [totalCustomers, totalSalesCalls, totalAnalyzed, totalScored] = await Promise.all([
      prisma.customer.count(),
      prisma.salesCall.count(),
      prisma.salesCall.count({ where: { transcript: { not: null } } }),
      prisma.salesCall.count({ where: { overallScore: { not: null } } })
    ]);

    // Get average scores
    const avgScores = await prisma.salesCall.aggregate({
      where: { overallScore: { not: null } },
      _avg: {
        urgencyScore: true,
        budgetScore: true,
        interestScore: true,
        engagementScore: true,
        overallScore: true
      }
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.salesCall.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // Get top customers by priority
    const topCustomers = await prisma.customerPriority.findMany({
      where: {
        avgOverallScore: {
          gt: 0
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        avgOverallScore: 'desc'
      },
      take: 5
    });

    // Get file upload trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const uploadTrends = await prisma.salesCall.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Calculate processing efficiency
    const processingEfficiency = totalSalesCalls > 0 ? 
      Math.round((totalAnalyzed / totalSalesCalls) * 100) : 0;

    const scoringEfficiency = totalAnalyzed > 0 ? 
      Math.round((totalScored / totalAnalyzed) * 100) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          totalSalesCalls,
          totalAnalyzed,
          totalScored,
          recentActivity
        },
        scores: {
          avgUrgency: Math.round(avgScores._avg.urgencyScore || 0),
          avgBudget: Math.round(avgScores._avg.budgetScore || 0),
          avgInterest: Math.round(avgScores._avg.interestScore || 0),
          avgEngagement: Math.round(avgScores._avg.engagementScore || 0),
          avgOverall: Math.round(avgScores._avg.overallScore || 0)
        },
        efficiency: {
          processingEfficiency,
          scoringEfficiency
        },
        topCustomers: topCustomers.map(item => ({
          id: item.customer.id,
          name: item.customer.name,
          phone: item.customer.phone,
          avgScore: parseFloat(item.avgOverallScore),
          totalCalls: item.totalCalls,
          priorityRank: item.priorityRank
        })),
        trends: {
          uploadTrends: uploadTrends.map(item => ({
            date: item.createdAt.toISOString().split('T')[0],
            count: item._count.id
          }))
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting dashboard stats:', error);
    next(error);
  }
});

/**
 * GET /api/dashboard/export
 * Export data for analysis
 */
router.get('/export', async (req, res, next) => {
  try {
    const { format = 'json', customerId } = req.query;

    const where = {};
    if (customerId) {
      where.customerId = parseInt(customerId);
    }

    // Get all sales calls with customer information
    const salesCalls = await prisma.salesCall.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format data for export
    const exportData = salesCalls.map(call => ({
      salesCallId: call.id,
      customerId: call.customer.id,
      customerName: call.customer.name,
      customerPhone: call.customer.phone,
      customerEmail: call.customer.email,
      customerCreatedAt: call.customer.createdAt,
      audioFilePath: call.audioFilePath,
      transcript: call.transcript,
      urgencyScore: call.urgencyScore,
      budgetScore: call.budgetScore,
      interestScore: call.interestScore,
      engagementScore: call.engagementScore,
      overallScore: call.overallScore,
      analysisNotes: call.analysisNotes,
      callCreatedAt: call.createdAt
    }));

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Sales Call ID',
        'Customer ID',
        'Customer Name',
        'Customer Phone',
        'Customer Email',
        'Customer Created At',
        'Audio File Path',
        'Transcript',
        'Urgency Score',
        'Budget Score',
        'Interest Score',
        'Engagement Score',
        'Overall Score',
        'Analysis Notes',
        'Call Created At'
      ];

      const csvRows = exportData.map(row => [
        row.salesCallId,
        row.customerId,
        `"${row.customerName}"`,
        row.customerPhone,
        row.customerEmail || '',
        row.customerCreatedAt,
        row.audioFilePath,
        `"${(row.transcript || '').replace(/"/g, '""')}"`,
        row.urgencyScore || '',
        row.budgetScore || '',
        row.interestScore || '',
        row.engagementScore || '',
        row.overallScore || '',
        `"${(row.analysisNotes || '').replace(/"/g, '""')}"`,
        row.callCreatedAt
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="sales-calls-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);

    } else {
      // JSON format
      res.json({
        success: true,
        data: {
          exportDate: new Date().toISOString(),
          totalRecords: exportData.length,
          records: exportData
        }
      });
    }

  } catch (error) {
    console.error('❌ Error exporting data:', error);
    next(error);
  }
});

/**
 * GET /api/dashboard/analytics
 * Get detailed analytics
 */
router.get('/analytics', async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get sales calls in the period
    const salesCalls = await prisma.salesCall.findMany({
      where: {
        createdAt: {
          gte: daysAgo
        },
        overallScore: {
          not: null
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Calculate score distributions
    const scoreRanges = {
      high: { min: 80, max: 100, count: 0, customers: [] },
      medium: { min: 50, max: 79, count: 0, customers: [] },
      low: { min: 0, max: 49, count: 0, customers: [] }
    };

    salesCalls.forEach(call => {
      const score = call.overallScore;
      if (score >= 80) {
        scoreRanges.high.count++;
        scoreRanges.high.customers.push(call.customer.name);
      } else if (score >= 50) {
        scoreRanges.medium.count++;
        scoreRanges.medium.customers.push(call.customer.name);
      } else {
        scoreRanges.low.count++;
        scoreRanges.low.customers.push(call.customer.name);
      }
    });

    // Calculate average scores by category
    const avgScores = {
      urgency: 0,
      budget: 0,
      interest: 0,
      engagement: 0,
      overall: 0
    };

    if (salesCalls.length > 0) {
      avgScores.urgency = Math.round(salesCalls.reduce((sum, call) => sum + (call.urgencyScore || 0), 0) / salesCalls.length);
      avgScores.budget = Math.round(salesCalls.reduce((sum, call) => sum + (call.budgetScore || 0), 0) / salesCalls.length);
      avgScores.interest = Math.round(salesCalls.reduce((sum, call) => sum + (call.interestScore || 0), 0) / salesCalls.length);
      avgScores.engagement = Math.round(salesCalls.reduce((sum, call) => sum + (call.engagementScore || 0), 0) / salesCalls.length);
      avgScores.overall = Math.round(salesCalls.reduce((sum, call) => sum + (call.overallScore || 0), 0) / salesCalls.length);
    }

    // Get unique customers
    const uniqueCustomers = [...new Set(salesCalls.map(call => call.customer.id))].length;

    res.json({
      success: true,
      data: {
        period: `${period} days`,
        totalCalls: salesCalls.length,
        uniqueCustomers,
        scoreRanges,
        avgScores,
        topPerformers: salesCalls
          .filter(call => call.overallScore >= 80)
          .slice(0, 10)
          .map(call => ({
            customerName: call.customer.name,
            overallScore: call.overallScore,
            callDate: call.createdAt
          }))
      }
    });

  } catch (error) {
    console.error('❌ Error getting analytics:', error);
    next(error);
  }
});

module.exports = router; 