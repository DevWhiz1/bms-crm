# BMS CRM - Business Management System

A Node.js and Express.js based CRM system with MySQL database integration and JWT authentication.

## Features

- User registration and authentication
- JWT token-based security
- Password hashing with bcrypt
- MySQL database integration
- Input validation
- Rate limiting
- Security middleware (Helmet, CORS)

## Project Structure

```
bms-crm/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   └── userController.js    # User-related business logic
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── validation.js       # Input validation middleware
├── models/
│   └── User.js             # User model and database operations
├── routes/
│   └── userRoutes.js       # User API routes
├── .env.example            # Environment variables template
├── package.json            # Project dependencies
├── server.js               # Main server file
└── README.md               # This file
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database credentials and JWT secret

5. Make sure your MySQL database is running and the `users` table is created

## Database Setup

The project expects a MySQL database with the following table:

```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    token VARCHAR(512) NULL,
    account_level TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication Endpoints

#### POST /api/users/signup
Register a new user.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "account_level": 1,
      "is_active": true
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/users/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "account_level": 1,
      "is_active": true
    },
    "token": "jwt_token_here"
  }
}
```

### Protected Endpoints (Require Authentication)

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

#### GET /api/users/profile
Get current user profile.

#### PUT /api/users/profile
Update user profile.

**Request Body:**
```json
{
  "full_name": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### POST /api/users/logout
Logout and invalidate token.

#### GET /api/users/verify-token
Verify if the current token is valid.

### Health Check

#### GET /api/health
Check if the API is running.

## Security Features

- Password hashing using bcrypt with salt rounds of 12
- JWT tokens for authentication
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation and sanitization
- CORS protection
- Helmet for security headers
- SQL injection protection through parameterized queries

## Environment Variables

- `DB_HOST`: MySQL host (default: localhost)
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name
- `DB_PORT`: MySQL port (default: 3306)
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time (default: 24h)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [] // Validation errors (if any)
}
```

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.
