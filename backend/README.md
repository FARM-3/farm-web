# Farm Management Backend API

A Node.js/Express backend API for the Farm Management System, specifically designed to handle task management operations and integrate with the React frontend.

## Features

- **Task Management**: Complete CRUD operations for farm tasks
- **Exception Handling**: Track and manage farm exceptions with SLA monitoring
- **Farm Block Management**: Manage different farm blocks and their properties
- **SOP Templates**: Standard Operating Procedure templates for farm operations
- **JWT Authentication**: Secure authentication and authorization
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **In-Memory Data Storage**: Fast development with sample data included

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Tasks
- `GET /api/tasks/` - List all tasks (with filtering)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks/` - Create new task
- `PUT /api/tasks/:id` - Update entire task
- `PATCH /api/tasks/:id` - Partial update task
- `DELETE /api/tasks/:id` - Delete task

### Exceptions
- `GET /api/exceptions/` - List all exceptions (with filtering)
- `GET /api/exceptions/:id` - Get single exception
- `POST /api/exceptions/` - Create new exception
- `PUT /api/exceptions/:id` - Update entire exception
- `PATCH /api/exceptions/:id` - Partial update exception
- `DELETE /api/exceptions/:id` - Delete exception

### Farm Blocks
- `GET /api/farm-blocks/` - List all farm blocks
- `GET /api/farm-blocks/:id` - Get single farm block
- `POST /api/farm-blocks/` - Create new farm block
- `PUT /api/farm-blocks/:id` - Update entire farm block
- `PATCH /api/farm-blocks/:id` - Partial update farm block
- `DELETE /api/farm-blocks/:id` - Delete farm block

### SOP Templates
- `GET /api/sop-templates/` - List all SOP templates
- `GET /api/sop-templates/:id` - Get single SOP template
- `POST /api/sop-templates/` - Create new SOP template
- `PUT /api/sop-templates/:id` - Update entire SOP template
- `PATCH /api/sop-templates/:id` - Partial update SOP template
- `DELETE /api/sop-templates/:id` - Delete SOP template

### Health Check
- `GET /api/health` - API health status

## Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

3. **Start the Server**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:8000` by default.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Token <your-jwt-token>
```

### Default Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@farmmanagement.com | admin123 | admin |
| manager@farmmanagement.com | manager123 | manager |
| worker@farmmanagement.com | worker123 | worker |

### Login Example

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@farmmanagement.com",
    "password": "admin123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "1",
    "email": "admin@farmmanagement.com",
    "name": "Farm Administrator",
    "role": "admin",
    "is_email_verified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

## API Usage Examples

### Get All Tasks
```bash
curl -X GET http://localhost:8000/api/tasks/ \
  -H "Authorization: Token <your-token>"
```

### Create a New Task
```bash
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Authorization: Token <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Harvest Inspection",
    "description": "Check ripeness levels in North Block",
    "assigned_to": "John Kamau",
    "priority": "high",
    "status": "pending",
    "due_date": "2024-12-12",
    "farm_block": "FB001"
  }'
```

### Filter Tasks by Status
```bash
curl -X GET "http://localhost:8000/api/tasks/?status=pending" \
  -H "Authorization: Token <your-token>"
```

## Data Models

### Task
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "assigned_to": "string",
  "priority": "low|medium|high",
  "status": "pending|in_progress|completed",
  "due_date": "YYYY-MM-DD",
  "farm_block": "string|null",
  "created_at": "ISO date",
  "updated_at": "ISO date"
}
```

### Exception
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "severity": "low|medium|high",
  "status": "open|investigating|resolved",
  "weather_conditions": ["sunny", "cloudy", "rainy", "dry", "windy", "hot", "cold"],
  "evidence_files": ["array of file objects"],
  "reported_by": "string",
  "location": "string",
  "farm_block": "string|null",
  "created_at": "ISO date",
  "updated_at": "ISO date"
}
```

### Farm Block
```json
{
  "id": "string",
  "name": "string",
  "area": "number",
  "crop": "string",
  "condition_score": "number (0-100)",
  "open_tasks": "number",
  "last_inspection": "YYYY-MM-DD",
  "location": {"lat": "number", "lng": "number"},
  "status": "active|inactive|maintenance",
  "created_at": "ISO date",
  "updated_at": "ISO date"
}
```

### SOP Template
```json
{
  "id": "string",
  "name": "string",
  "category": "Harvest|Maintenance|Nutrition|Pest Control|Quality|General",
  "priority": "low|medium|high",
  "duration": "string",
  "description": "string",
  "steps": ["array of step strings"],
  "created_at": "ISO date"
}
```

## Development

### Project Structure
```
backend/
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
├── .env               # Environment variables
├── middleware/        # Custom middleware
│   └── auth.js       # JWT authentication
├── routes/           # API route handlers
│   ├── auth.js      # Authentication routes
│   ├── tasks.js     # Task management routes
│   ├── exceptions.js # Exception handling routes
│   ├── farmBlocks.js # Farm block routes
│   └── sopTemplates.js # SOP template routes
├── models/           # Data models
│   └── DataStore.js # In-memory data storage
└── utils/           # Utility functions
```

### Adding New Endpoints

1. Create a new route file in `routes/`
2. Define your endpoints with proper validation
3. Import and register the route in `server.js`
4. Add any necessary middleware

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT signing secret | `farm-management-secret-key-2024-development-only-change-in-production` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `MAX_FILE_SIZE` | Maximum file upload size | `50mb` |

## Production Considerations

1. **Database**: Replace in-memory storage with a proper database (PostgreSQL, MongoDB, etc.)
2. **Security**: Change JWT secret and use environment-specific secrets
3. **Logging**: Implement proper logging (Winston, etc.)
4. **Rate Limiting**: Add rate limiting middleware
5. **Input Validation**: Enhance validation with libraries like Joi or Yup
6. **File Uploads**: Configure proper file storage (AWS S3, etc.)
7. **Monitoring**: Add health checks and monitoring
8. **Testing**: Implement unit and integration tests

## Integration with Frontend

The backend is designed to work seamlessly with the React frontend. The frontend's API configuration has been updated to point to `http://localhost:8000` for development.

To integrate:
1. Start the backend server: `npm run dev` in the `backend` directory
2. Start the frontend: `npm run dev` in the main project directory
3. The frontend will automatically connect to the local backend

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the frontend URL is correctly configured in `.env`
2. **JWT Errors**: Check that the JWT secret is consistent across environments
3. **Port Already in Use**: Change the `PORT` in `.env` or kill the process using port 8000
4. **Token Expiration**: Implement token refresh logic in the frontend

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in your `.env file.

## License

MIT License - see LICENSE file for details.