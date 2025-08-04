const express = require('express');
const { prisma } = require('../database/connection');

const router = express.Router();

/**
 * Get improvement recommendation for a scoring category
 * @param {string} category - Scoring category
 * @param {number} averageScore - Average score for the category
 * @returns {string} Recommendation
 */
function getImprovementRecommendation(category, averageScore) {
  const recommendations = {
    urgency: {
      low: "עודדו לקוחות לדבר על דחיפות וזמנים - שאלו על תאריכי יעד ומצבי דחיפות",
      medium: "חפשו סימני דחיפות נוספים בשיחות - שאלו על מצבים דחופים"
    },
    budget: {
      low: "עודדו לקוחות לחשוף מידע על תקציב - שאלו על משכנתאות והון עצמי",
      medium: "בקשו פרטים נוספים על תקציב - שאלו על טווחי מחירים"
    },
    interest: {
      low: "עודדו שאלות על הנכס - הציעו צפיות ופרטים נוספים",
      medium: "חפשו הזדמנויות להעלות עניין - הציעו מידע נוסף"
    },
    engagement: {
      low: "עודדו שיחה פעילה יותר - שאלו שאלות פתוחות",
      medium: "האריכו את השיחות - עודדו שאלות נוספות"
    }
  };

  const level = averageScore < 40 ? 'low' : 'medium';
  return recommendations[category]?.[level] || "שפרו את הביצועים בתחום זה";
}

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
 * GET /api/dashboard/scoring-analytics
 * Get detailed scoring analytics
 */
router.get('/scoring-analytics', async (req, res, next) => {
  try {
    // Get all scored sales calls
    const scoredCalls = await prisma.salesCall.findMany({
      where: { overallScore: { not: null } },
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
        overallScore: 'desc'
      }
    });

    // Calculate scoring statistics
    const scoringStats = {
      totalScored: scoredCalls.length,
      averageOverallScore: 0,
      scoreDistribution: {
        high: 0,    // 80-100
        good: 0,    // 60-79
        medium: 0,  // 40-59
        low: 0      // 0-39
      },
      categoryAverages: {
        urgency: 0,
        budget: 0,
        interest: 0,
        engagement: 0
      },
      topPerformers: [],
      improvementAreas: []
    };

    if (scoredCalls.length > 0) {
      // Calculate averages
      const totalScores = scoredCalls.reduce((acc, call) => {
        acc.overall += call.overallScore;
        acc.urgency += call.urgencyScore;
        acc.budget += call.budgetScore;
        acc.interest += call.interestScore;
        acc.engagement += call.engagementScore;
        return acc;
      }, { overall: 0, urgency: 0, budget: 0, interest: 0, engagement: 0 });

      scoringStats.averageOverallScore = Math.round(totalScores.overall / scoredCalls.length);
      scoringStats.categoryAverages.urgency = Math.round(totalScores.urgency / scoredCalls.length);
      scoringStats.categoryAverages.budget = Math.round(totalScores.budget / scoredCalls.length);
      scoringStats.categoryAverages.interest = Math.round(totalScores.interest / scoredCalls.length);
      scoringStats.categoryAverages.engagement = Math.round(totalScores.engagement / scoredCalls.length);

      // Score distribution
      scoredCalls.forEach(call => {
        if (call.overallScore >= 80) scoringStats.scoreDistribution.high++;
        else if (call.overallScore >= 60) scoringStats.scoreDistribution.good++;
        else if (call.overallScore >= 40) scoringStats.scoreDistribution.medium++;
        else scoringStats.scoreDistribution.low++;
      });

      // Top performers (top 5)
      scoringStats.topPerformers = scoredCalls.slice(0, 5).map(call => ({
        id: call.id,
        customerName: call.customer.name,
        customerPhone: call.customer.phone,
        overallScore: call.overallScore,
        urgencyScore: call.urgencyScore,
        budgetScore: call.budgetScore,
        interestScore: call.interestScore,
        engagementScore: call.engagementScore,
        createdAt: call.createdAt
      }));

      // Identify improvement areas
      const categoryScores = [
        { name: 'urgency', avg: scoringStats.categoryAverages.urgency },
        { name: 'budget', avg: scoringStats.categoryAverages.budget },
        { name: 'interest', avg: scoringStats.categoryAverages.interest },
        { name: 'engagement', avg: scoringStats.categoryAverages.engagement }
      ];

      scoringStats.improvementAreas = categoryScores
        .filter(cat => cat.avg < 60)
        .sort((a, b) => a.avg - b.avg)
        .map(cat => ({
          category: cat.name,
          averageScore: cat.avg,
          recommendation: getImprovementRecommendation(cat.name, cat.avg)
        }));
    }

    res.json({
      success: true,
      data: scoringStats
    });

  } catch (error) {
    console.error('❌ Error getting scoring analytics:', error);
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