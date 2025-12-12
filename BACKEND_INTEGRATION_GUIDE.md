# Farm Management Backend Integration Guide

This guide explains how to integrate the newly created backend API with the existing Farm Management frontend, specifically for task management functionality.

## 🎯 Overview

The backend provides a complete REST API that matches the requirements of the existing React frontend TaskManagement component. It includes:

- **Task Management**: CRUD operations for farm tasks
- **Exception Handling**: Track and manage farm exceptions
- **Farm Block Management**: Manage different farm blocks
- **SOP Templates**: Standard Operating Procedure templates
- **JWT Authentication**: Secure user authentication
- **Sample Data**: Pre-populated with realistic farm data

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies (first time only)
npm install

# Start the server
npm run dev
```

The server will start on `http://localhost:8000`

### 2. Start the Frontend

In a separate terminal, from the main project directory:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Test the Integration

Visit `http://localhost:5173` and navigate to the Task Management page. The frontend will now connect to your local backend instead of using mock data.

## 🔧 Configuration Details

### Backend API Configuration

The frontend API configuration has been updated to use the local backend:

**File**: `src/services/ApiConfig.js`
- **API Base URL**: `http://localhost:8000` (development)
- **Authentication Endpoints**: Updated to match backend structure
- **All task management endpoints**: Point to local backend

### Environment Variables

**Backend (.env)**:
```env
PORT=8000
NODE_ENV=development
JWT_SECRET=farm-management-secret-key-2024-development-only-change-in-production
FRONTEND_URL=http://localhost:5173
```

## 👥 Test Users

The backend includes three test users with different roles:

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| admin@farmmanagement.com | admin123 | admin | Full access |
| manager@farmmanagement.com | manager123 | manager | Management access |
| worker@farmmanagement.com | worker123 | worker | Basic access |

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

### Tasks
- `GET /api/tasks/` - List all tasks (with filtering)
- `POST /api/tasks/` - Create new task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id` - Partial update task
- `DELETE /api/tasks/:id` - Delete task

### Exceptions
- `GET /api/exceptions/` - List all exceptions
- `POST /api/exceptions/` - Create new exception
- `PUT /api/exceptions/:id` - Update exception
- `DELETE /api/exceptions/:id` - Delete exception

### Farm Blocks
- `GET /api/farm-blocks/` - List all farm blocks
- `GET /api/farm-blocks/:id` - Get single farm block

### SOP Templates
- `GET /api/sop-templates/` - List all SOP templates
- `GET /api/sop-templates/:id` - Get single SOP template

## 🧪 Testing

### Manual Testing

1. **Health Check**: Visit `http://localhost:8000/api/health`
2. **Login**: Use any test user credentials above
3. **Task Management**: Create, edit, and delete tasks
4. **Exceptions**: Create and manage exceptions
5. **Farm Blocks**: View farm block information
6. **SOP Templates**: Browse available templates

### Automated Testing

Run the included API test script:

```bash
cd backend
node test-api.js
```

This script will test all endpoints and report success/failure for each operation.

## 🔐 Authentication Flow

### Frontend Integration

The frontend needs to handle JWT tokens for authentication:

1. **Login Process**:
   ```javascript
   const response = await fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   });
   
   const { token, user } = await response.json();
   localStorage.setItem('token', token);
   ```

2. **API Requests**:
   ```javascript
   const token = localStorage.getItem('token');
   const response = await fetch('/api/tasks/', {
     headers: {
       'Authorization': `Token ${token}`,
       'Content-Type': 'application/json'
     }
   });
   ```

### Token Management

- **Storage**: Tokens are stored in localStorage
- **Expiration**: Tokens expire after 24 hours
- **Refresh**: Use `/api/auth/refresh` to get a new token
- **Logout**: Remove token from localStorage

## 📱 Frontend Components Integration

### TaskManagement Component

The existing TaskManagement component should now work seamlessly with the backend:

- **Task Listing**: Fetches real data from `/api/tasks/`
- **Task Creation**: Posts to `/api/tasks/`
- **Task Updates**: PUT/PATCH to `/api/tasks/:id`
- **Task Deletion**: DELETE to `/api/tasks/:id`
- **Filtering**: Uses query parameters for server-side filtering

### Exception Management

- **Exception Listing**: Fetches from `/api/exceptions/`
- **Exception Creation**: Posts to `/api/exceptions/`
- **Weather Conditions**: Supports multiple weather condition types
- **Evidence Files**: Ready for file upload implementation

### Farm **Block Block Integration

- Selection**: Dropdowns populated from `/api/farm-blocks/`
- **Block Details**: Shows condition scores and task counts
- **Location Data**: GPS coordinates for mapping

## 🛠 Development Workflow

### Adding New Features

1. **Backend**: Add new route handlers in `backend/routes/`
2. **Frontend**: Update API configuration if needed
3. **Testing**: Use the test script to verify functionality

### Debugging

1. **Backend Logs**: Check terminal output for API requests
2. **Network Tab**: Monitor requests in browser DevTools
3. **Error Handling**: Both frontend and backend include error handling

### Sample Data

The backend includes realistic sample data:

- **3 Farm Blocks**: North, South, East blocks with different conditions
- **6 SOP Templates**: Harvest, pruning, fertilizing, pest control, weeding, quality control
- **Sample Tasks**: Various tasks with different priorities and statuses
- **Sample Exceptions**: Real-world exception scenarios

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure frontend URL is in backend's CORS configuration
   - Check that both servers are running

2. **Authentication Failures**:
   - Verify JWT token is included in requests
   - Check token expiration
   - Ensure backend is using the correct JWT secret

3. **API Not Found**:
   - Confirm backend server is running on port 8000
   - Check that endpoints match exactly (including trailing slashes)

4. **Data Not Loading**:
   - Check browser Network tab for API responses
   - Verify backend logs for errors
   - Ensure authentication is working

### Debug Commands

```bash
# Check if backend is running
curl http://localhost:8000/api/health

# Test authentication
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@farmmanagement.com","password":"admin123"}'

# Test task endpoints (replace TOKEN with actual token)
curl -H "Authorization: Token TOKEN" http://localhost:8000/api/tasks/
```

## 🔄 Migration from Mock Data

The frontend has been updated to use the real API endpoints instead of mock data. If you need to revert to mock data for testing:

1. **Temporary**: Comment out API calls in TaskManagement component
2. **Environment**: Set `VITE_USE_MOCK_DATA=true` in `.env`
3. **Development**: Update ApiConfig.js to use mock endpoints

## 📈 Production Considerations

When moving to production:

1. **Database**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Security**: Use environment-specific JWT secrets
3. **Deployment**: Deploy backend to cloud platform (AWS, Heroku, etc.)
4. **Environment**: Update frontend API URLs for production
5. **Monitoring**: Add logging and monitoring tools
6. **Testing**: Implement comprehensive test suites

## 📞 Support

If you encounter issues:

1. Check the backend logs for error messages
2. Use the test script to identify problematic endpoints
3. Verify network requests in browser DevTools
4. Ensure both frontend and backend are using compatible API versions

## 📚 Additional Resources

- **Backend README**: See `backend/README.md` for detailed API documentation
- **API Test Script**: Run `node backend/test-api.js` for automated testing
- **Farm Management API YAML**: Original API specification for reference

---

**🎉 Integration Complete!** Your Farm Management system now has a fully functional backend API that supports all the task management features of the frontend.