const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sales Insight Automator Pro API',
      version: '1.0.0',
      description: 'AI-powered sales data insight platform with async processing, JWT auth, and email reports',
      contact: {
        name: 'Sales Insight Automator',
        email: 'support@salesinsight.io'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@demo.com' },
            password: { type: 'string', example: 'demo123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' }
              }
            }
          }
        },
        UploadResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Processing started' },
            jobId: { type: 'string', example: 'job_abc123' },
            filesQueued: { type: 'number', example: 2 }
          }
        },
        JobStatus: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            status: { type: 'string', enum: ['waiting', 'active', 'completed', 'failed'] },
            progress: { type: 'number', minimum: 0, maximum: 100 },
            result: { type: 'object' },
            error: { type: 'string' }
          }
        },
        ChatRequest: {
          type: 'object',
          required: ['message', 'jobId'],
          properties: {
            message: { type: 'string', example: 'Which region sold the most?' },
            jobId: { type: 'string', example: 'job_abc123' }
          }
        },
        ChatResponse: {
          type: 'object',
          properties: {
            reply: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
