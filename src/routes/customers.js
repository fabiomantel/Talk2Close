const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../database/connection');

const router = express.Router();

/**
 * GET /api/customers
 * List customers with scores and pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Validate sort parameters
    const allowedSortFields = ['createdAt', 'name', 'phone'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: {
              salesCalls: true
            }
          },
          priority: true,
          salesCalls: {
            select: {
              id: true,
              overallScore: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1 // Get only the latest call
          }
        },
        orderBy: {
          [sortField]: orderDirection
        },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.customer.count({ where })
    ]);

    // Calculate additional stats for each customer
    const customersWithStats = customers.map(customer => {
      const totalCalls = customer._count.salesCalls;
      const latestCall = customer.salesCalls[0];
      const avgScore = customer.priority?.avgOverallScore || 0;

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        createdAt: customer.createdAt,
        stats: {
          totalCalls,
          avgScore: parseFloat(avgScore),
          latestCallDate: latestCall?.createdAt || null,
          latestScore: latestCall?.overallScore || null,
          priorityRank: customer.priority?.priorityRank || null
        },
        priority: customer.priority
      };
    });

    res.json({
      success: true,
      data: {
        customers: customersWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error listing customers:', error);
    next(error);
  }
});

/**
 * GET /api/customers/prioritized
 * Get prioritized customer list
 */
router.get('/prioritized', async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const prioritizedCustomers = await prisma.customerPriority.findMany({
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
            phone: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: [
        { priorityRank: 'asc' },
        { avgOverallScore: 'desc' }
      ],
      take: parseInt(limit)
    });

    const formattedCustomers = prioritizedCustomers.map(item => ({
      id: item.customer.id,
      name: item.customer.name,
      phone: item.customer.phone,
      email: item.customer.email,
      createdAt: item.customer.createdAt,
      priority: {
        rank: item.priorityRank,
        avgScore: parseFloat(item.avgOverallScore),
        totalCalls: item.totalCalls,
        lastCallDate: item.lastCallDate
      }
    }));

    res.json({
      success: true,
      data: {
        customers: formattedCustomers,
        total: formattedCustomers.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting prioritized customers:', error);
    next(error);
  }
});

/**
 * GET /api/customers/:id
 * Get customer details with all sales calls
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        salesCalls: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            audioFilePath: true,
            transcript: true,
            urgencyScore: true,
            budgetScore: true,
            interestScore: true,
            engagementScore: true,
            overallScore: true,
            analysisNotes: true,
            createdAt: true
          }
        },
        priority: true
      }
    });

    if (!customer) {
      return res.status(404).json({
        error: true,
        message: 'Customer not found'
      });
    }

    // Calculate additional statistics
    const totalCalls = customer.salesCalls.length;
    const analyzedCalls = customer.salesCalls.filter(call => call.transcript).length;
    const scoredCalls = customer.salesCalls.filter(call => call.overallScore).length;
    
    const avgScores = {
      urgency: 0,
      budget: 0,
      interest: 0,
      engagement: 0,
      overall: 0
    };

    if (scoredCalls > 0) {
      const scoredCallsData = customer.salesCalls.filter(call => call.overallScore);
      avgScores.urgency = Math.round(scoredCallsData.reduce((sum, call) => sum + (call.urgencyScore || 0), 0) / scoredCalls);
      avgScores.budget = Math.round(scoredCallsData.reduce((sum, call) => sum + (call.budgetScore || 0), 0) / scoredCalls);
      avgScores.interest = Math.round(scoredCallsData.reduce((sum, call) => sum + (call.interestScore || 0), 0) / scoredCalls);
      avgScores.engagement = Math.round(scoredCallsData.reduce((sum, call) => sum + (call.engagementScore || 0), 0) / scoredCalls);
      avgScores.overall = Math.round(scoredCallsData.reduce((sum, call) => sum + (call.overallScore || 0), 0) / scoredCalls);
    }

    res.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          createdAt: customer.createdAt
        },
        stats: {
          totalCalls,
          analyzedCalls,
          scoredCalls,
          avgScores,
          priorityRank: customer.priority?.priorityRank || null,
          avgOverallScore: customer.priority ? parseFloat(customer.priority.avgOverallScore) : 0
        },
        salesCalls: customer.salesCalls,
        priority: customer.priority
      }
    });

  } catch (error) {
    console.error('❌ Error getting customer details:', error);
    next(error);
  }
});

/**
 * POST /api/customers
 * Create a new customer
 */
router.post('/', 
  [
    body('name').notEmpty().withMessage('Customer name is required'),
    body('phone').notEmpty().withMessage('Customer phone is required'),
    body('email').optional().isEmail().withMessage('Invalid email format')
  ],
  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: true,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, phone, email } = req.body;

      // Check if customer already exists
      const existingCustomer = await prisma.customer.findFirst({
        where: { phone }
      });

      if (existingCustomer) {
        return res.status(409).json({
          error: true,
          message: 'Customer with this phone number already exists',
          data: {
            existingCustomerId: existingCustomer.id
          }
        });
      }

      // Create new customer
      const customer = await prisma.customer.create({
        data: {
          name,
          phone,
          email: email || null
        }
      });

      console.log(`✅ New customer created: ${customer.name} (${customer.phone})`);

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: {
          customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            createdAt: customer.createdAt
          }
        }
      });

    } catch (error) {
      console.error('❌ Error creating customer:', error);
      next(error);
    }
  }
);

/**
 * PUT /api/customers/:id
 * Update customer information
 */
router.put('/:id',
  [
    body('name').optional().notEmpty().withMessage('Customer name cannot be empty'),
    body('phone').optional().notEmpty().withMessage('Customer phone cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email format')
  ],
  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: true,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { name, phone, email } = req.body;

      // Check if customer exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingCustomer) {
        return res.status(404).json({
          error: true,
          message: 'Customer not found'
        });
      }

      // Check if phone number is already taken by another customer
      if (phone && phone !== existingCustomer.phone) {
        const phoneExists = await prisma.customer.findFirst({
          where: {
            phone,
            id: { not: parseInt(id) }
          }
        });

        if (phoneExists) {
          return res.status(409).json({
            error: true,
            message: 'Phone number is already registered to another customer'
          });
        }
      }

      // Update customer
      const updatedCustomer = await prisma.customer.update({
        where: { id: parseInt(id) },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(email !== undefined && { email: email || null })
        }
      });

      console.log(`✅ Customer updated: ${updatedCustomer.name} (${updatedCustomer.phone})`);

      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: {
          customer: {
            id: updatedCustomer.id,
            name: updatedCustomer.name,
            phone: updatedCustomer.phone,
            email: updatedCustomer.email,
            createdAt: updatedCustomer.createdAt
          }
        }
      });

    } catch (error) {
      console.error('❌ Error updating customer:', error);
      next(error);
    }
  }
);

/**
 * DELETE /api/customers/:id
 * Delete customer and all associated data
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            salesCalls: true
          }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({
        error: true,
        message: 'Customer not found'
      });
    }

    console.log(`🗑️ Deleting customer: ${customer.name} with ${customer._count.salesCalls} sales calls`);

    // Delete customer (this will cascade delete sales calls and priority)
    await prisma.customer.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Customer deleted successfully',
      data: {
        deletedCustomerId: parseInt(id),
        deletedSalesCalls: customer._count.salesCalls
      }
    });

  } catch (error) {
    console.error('❌ Error deleting customer:', error);
    next(error);
  }
});

module.exports = router; 