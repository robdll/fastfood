const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'FastFood Backend API',
    version: '1.0.0',
    description: 'API documentation for the FastFood backend.',
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:3000',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
      HealthResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          service: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
        required: ['ok', 'service', 'timestamp'],
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          roles: { type: 'array', items: { type: 'string' } },
          active: { type: 'boolean' },
          clientData: {
            type: 'object',
            properties: {
              paymentMethod: { type: 'string' },
              preferences: { type: 'array', items: { type: 'string' } },
            },
            additionalProperties: true,
          },
          restaurantData: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              phone: { type: 'string' },
              vat: { type: 'string' },
              address: { type: 'string' },
            },
            additionalProperties: true,
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      LoginResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string' },
        },
        required: ['user', 'token'],
      },
      Meal: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          idMeal: { type: 'string' },
          strMeal: { type: 'string' },
          strCategory: { type: 'string' },
          strMealThumb: { type: 'string' },
          photoPublicId: { type: 'string' },
          ingredients: { type: 'array', items: { type: 'string' } },
          measures: { type: 'array', items: { type: 'string' } },
          origin: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Restaurant: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          address: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
        },
      },
      MenuItem: {
        type: 'object',
        properties: {
          mealId: { type: 'string' },
          name: { type: 'string' },
          category: { type: 'string', nullable: true },
          origin: { type: 'string', nullable: true },
          price: { type: 'number' },
          photoUrl: { type: 'string', nullable: true },
          photoPublicId: { type: 'string', nullable: true },
          removedIngredients: { type: 'array', items: { type: 'string' } },
          ingredients: { type: 'array', items: { type: 'string' } },
          measures: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Menu: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          restaurantId: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/MenuItem' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          itemId: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          quantity: { type: 'number' },
        },
        required: ['itemId', 'name', 'price', 'quantity'],
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          clientId: { type: 'string' },
          clientName: { type: 'string' },
          restaurantId: { type: 'string' },
          restaurantName: { type: 'string' },
          restaurantAddress: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          subtotal: { type: 'number' },
          deliveryFee: { type: 'number', nullable: true },
          total: { type: 'number' },
          expectedMinutes: { type: 'number', nullable: true },
          deliveryOption: { type: 'string', enum: ['pickup', 'delivery'] },
          deliveryAddress: { type: 'string' },
          paymentMethod: { type: 'string' },
          status: {
            type: 'string',
            enum: ['ordered', 'preparation', 'readyForPickup', 'delivered'],
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateOrdersRequest: {
        type: 'object',
        properties: {
          orders: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                restaurantId: { type: 'string' },
                restaurantName: { type: 'string' },
                restaurantAddress: { type: 'string' },
                items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
                subtotal: { type: 'number' },
                status: {
                  type: 'string',
                  enum: ['ordered', 'preparation', 'readyForPickup', 'delivered'],
                },
                deliveryOption: { type: 'string', enum: ['pickup', 'delivery'] },
                deliveryAddress: { type: 'string' },
                paymentMethod: { type: 'string' },
                clientName: { type: 'string' },
                customerName: { type: 'string' },
              },
              required: ['restaurantId', 'items', 'subtotal'],
            },
          },
        },
        required: ['orders'],
      },
      UpdateOrderStatusRequest: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['ordered', 'preparation', 'readyForPickup', 'delivered'],
          },
        },
        required: ['status'],
      },
      MenuItemsPatchRequest: {
        type: 'object',
        description:
          'Multipart payload. Either provide items (JSON array) or mealIds. Use photo_<mealId> for images.',
        properties: {
          items: {
            type: 'string',
            description:
              'JSON string array: [{ mealId, price, category, removedIngredients }]',
          },
          mealIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Legacy array of meal ids.',
          },
        },
      },
      MenuItemUpdateRequest: {
        type: 'object',
        description: 'Multipart payload. Provide at least one field.',
        properties: {
          price: { type: 'number' },
          category: { type: 'string' },
          removedIngredients: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      CreateMealRequest: {
        type: 'object',
        description: 'Multipart payload.',
        properties: {
          name: { type: 'string' },
          category: { type: 'string' },
          origin: { type: 'string' },
          ingredients: {
            type: 'string',
            description: 'JSON string array of ingredients.',
          },
          photo: { type: 'string', format: 'binary' },
        },
        required: ['name', 'category', 'origin', 'ingredients', 'photo'],
      },
      UserCreateRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          roles: { type: 'array', items: { type: 'string' } },
          active: { type: 'boolean' },
          clientData: { type: 'object', additionalProperties: true },
          restaurantData: { type: 'object', additionalProperties: true },
        },
      },
      UserUpdateRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          roles: { type: 'array', items: { type: 'string' } },
          active: { type: 'boolean' },
          clientData: { type: 'object', additionalProperties: true },
          restaurantData: { type: 'object', additionalProperties: true },
        },
      },
      PreparationCountsResponse: {
        type: 'object',
        properties: {
          counts: {
            type: 'object',
            additionalProperties: { type: 'number' },
          },
        },
        required: ['counts'],
      },
    },
  },
  paths: {
    '/': {
      get: {
        summary: 'Backend root',
        responses: {
          200: {
            description: 'Plain text response.',
            content: {
              'text/plain': {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    },
    '/api/health': {
      get: {
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service health payload.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Authenticated user and JWT.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          400: {
            description: 'Invalid payload.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Invalid credentials.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          500: {
            description: 'JWT secret not configured.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/meals': {
      get: {
        summary: 'List meals',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of meals.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Meal' } },
              },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      post: {
        summary: 'Create a meal',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/CreateMealRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Meal created.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Meal' } },
            },
          },
          400: {
            description: 'Validation errors.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Restaurateur role required or forbidden.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/restaurants': {
      get: {
        summary: 'List restaurants',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Restaurants list.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Restaurant' } },
              },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/restaurants/{id}': {
      get: {
        summary: 'Get restaurant by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Restaurant.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Restaurant' } },
            },
          },
          400: {
            description: 'Invalid id.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          404: {
            description: 'Not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/users': {
      post: {
        summary: 'Create user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserCreateRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'User created.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/User' } },
            },
          },
          400: {
            description: 'Invalid payload.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        summary: 'Get user by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'User.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/User' } },
            },
          },
          400: {
            description: 'Invalid id.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Forbidden.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          404: {
            description: 'Not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      put: {
        summary: 'Update user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserUpdateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated user.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/User' } },
            },
          },
          400: {
            description: 'Invalid payload.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Forbidden.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          404: {
            description: 'Not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      delete: {
        summary: 'Delete user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'User deleted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    deleted: { type: 'boolean' },
                  },
                  required: ['deleted'],
                },
              },
            },
          },
          400: {
            description: 'Invalid id.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Forbidden.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          404: {
            description: 'Not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/menus/{restaurantId}': {
      get: {
        summary: 'Get menu by restaurant id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'restaurantId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Menu payload.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Menu' } },
            },
          },
          400: {
            description: 'Missing restaurant id.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/menus/{restaurantId}/items': {
      patch: {
        summary: 'Add menu items',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'restaurantId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/MenuItemsPatchRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated menu.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Menu' } },
            },
          },
          400: {
            description: 'Validation errors.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Forbidden.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/menus/{restaurantId}/items/{mealId}': {
      patch: {
        summary: 'Update menu item',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'restaurantId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'mealId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/MenuItemUpdateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated menu.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Menu' } },
            },
          },
          400: {
            description: 'Validation errors.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Forbidden.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          404: {
            description: 'Menu item not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      delete: {
        summary: 'Delete menu item',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'restaurantId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'mealId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Updated menu.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Menu' } },
            },
          },
          400: {
            description: 'Validation errors.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Forbidden.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          404: {
            description: 'Menu item not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/orders': {
      get: {
        summary: 'List orders for authenticated client',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Orders list.',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
              },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      post: {
        summary: 'Create orders',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateOrdersRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Orders created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    orders: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Order' },
                    },
                  },
                  required: ['orders'],
                },
              },
            },
          },
          400: {
            description: 'Validation errors.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          502: {
            description: 'Unable to calculate delivery estimate.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/orders/{id}/status': {
      patch: {
        summary: 'Update order status',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateOrderStatusRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated order.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Order' } },
            },
          },
          400: {
            description: 'Invalid id or status.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          403: {
            description: 'Forbidden.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          404: {
            description: 'Order not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/orders/preparation-counts': {
      get: {
        summary: 'Get preparation counts',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'restaurantIds',
            in: 'query',
            required: true,
            schema: {
              oneOf: [
                { type: 'string', description: 'Comma-separated list of ids.' },
                { type: 'array', items: { type: 'string' } },
              ],
            },
          },
        ],
        responses: {
          200: {
            description: 'Counts by restaurant id.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PreparationCountsResponse' },
              },
            },
          },
          400: {
            description: 'Missing restaurantIds.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Unauthorized.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
  },
}

export default swaggerSpec
