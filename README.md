# User Management System using PostgreSQL

A full-stack user management application built with **Node.js/Express** backend and **React** frontend, featuring user authentication, email verification, password reset, and admin panel for user management.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation Guide](#installation-guide)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Frontend Routes](#frontend-routes)

---

## ✨ Features

### Authentication & Security
- User registration with email verification
- Secure login with JWT-based authentication
- Access token (15 minutes) and refresh token (7 days)
- Password reset functionality via email
- Role-based access control (User and Admin roles)
- Bcrypt password hashing

### User Management
- User profile updates with profile image upload
- View all users with pagination and search
- Admin-only user deletion
- User profile viewing
- Redis caching for improved performance

### Email Services
- Email verification on registration
- Password reset emails
- Configured with Nodemailer

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5.2.1
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** Bcrypt
- **Email Service:** Nodemailer
- **Caching:** Redis
- **File Upload:** Multer
- **Validation:** Express-validator
- **CORS:** Enabled for frontend communication

### Frontend
- **Framework:** React 19.2.4
- **Router:** React Router v7
- **HTTP Client:** Axios
- **UI Framework:** Tailwind CSS 4.2.2
- **Form Management:** React Hook Form
- **Build Tool:** Vite
- **Linting:** ESLint

---

## 📁 Project Structure

```
user-management-using-postgresql/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration with Sequelize
│   ├── controllers/
│   │   └── user.controller.js    # User controller with all business logic
│   ├── middlewares/
│   │   ├── auth.js               # JWT authentication & admin check
│   │   └── validation.js         # Input validation rules
│   ├── models/
│   │   └── user.model.js         # User database schema
│   ├── routes/
│   │   └── user.route.js         # Routes definition
│   ├── utils/
│   │   └── sendMail.js           # Email sending utility
│   ├── uploads/                  # Profile image uploads
│   ├── package.json
│   ├── server.js                 # Server entry point (nodemon uses this)
│   └── rest.http                 # HTTP client for testing
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Loader.jsx        # Loading spinner component
│   │   │   └── ProtectedRoute.jsx # Route protection for authenticated users
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   ├── Dashboard.jsx     # User dashboard
│   │   │   ├── Profile.jsx       # User profile management
│   │   │   └── AdminPanel.jsx    # Admin user management
│   │   ├── utils/
│   │   │   └── api.js            # Axios instance with interceptors
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # Entry point
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── eslint.config.js
│   ├── package.json
│   └── index.html
│
└── README.md
```

---

## 🚀 Installation Guide

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MySQL** database
- **Redis** server (optional, for caching)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```bash
   touch .env
   ```

4. Configure environment variables (see [Environment Variables](#environment-variables) section)

5. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:5173`

---

## 🔐 Environment Variables

Create a `.env` file in the **backend** directory with the following variables:

```env
# Server
PORT=8000
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=user_management

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL (for email verification and password reset links)
FRONTEND_URL=http://localhost:5173

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Configuration Details:

| Variable | Description | Example |
|----------|-------------|---------|
| **PORT** | Server port | 8000 |
| **NODE_ENV** | Environment | development / production |
| **DB_HOST** | MySQL host | localhost |
| **DB_USER** | MySQL username | root |
| **DB_PASSWORD** | MySQL password | your_password |
| **DB_NAME** | Database name | user_management |
| **JWT_SECRET** | Secret key for JWT signing | any_random_string |
| **EMAIL_HOST** | Email provider SMTP host | smtp.gmail.com |
| **EMAIL_PORT** | SMTP port | 587 |
| **EMAIL_USER** | Email address | your_email@gmail.com |
| **EMAIL_PASS** | Email password / App password | generated_app_password |
| **FRONTEND_URL** | Frontend application URL | http://localhost:5173 |
| **REDIS_HOST** | Redis server host | localhost |
| **REDIS_PORT** | Redis server port | 6379 |

**Note:** For Gmail, use an [App Password](https://myaccount.google.com/apppasswords) instead of your regular password.

---

## ▶️ Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

## 📡 API Endpoints

### Base URL: `http://localhost:8000/v1/user`

All endpoints use JSON format for request/response bodies. Authentication is required for protected endpoints using JWT Bearer token.

---

### 1. **Register User**

**Endpoint:** `POST /register`

**Authentication:** Not required

**Request Headers:**
```
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "profileImage": <file> // Optional
}
```

**Validation Rules:**
- `email`: Must be a valid email format
- `password`: Minimum 6 characters
- `name`: Required field

**Success Response (201):**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "success": true
}
```

**Error Response (400):**
```json
{
  "message": "User already exists"
}
```

---

### 2. **Verify Email**

**Endpoint:** `GET /verify?token=<token>`

**Authentication:** Not required

**Description:** Email verification link sent via email. User clicks the link to verify their account.

**Success Response:** Redirects to `FRONTEND_URL/login?verified=true`

**Error Responses:**
- Invalid token: Redirects to `/login?error=InvalidLink`
- User not found: Redirects to `/login?error=UserNotFound`
- Already verified: Redirects to `/login?message=AlreadyVerified`
- Token expired: Redirects to `/login?error=TokenExpired`

---

### 3. **Login User**

**Endpoint:** `POST /login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Validation Rules:**
- `email`: Must be valid email format
- `password`: Minimum 6 characters

**Success Response (200):**
```json
{
  "message": "Login successful",
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

**Error Responses:**
- Invalid credentials (400): `{ "message": "Invalid email or password" }`
- Not verified (403): `{ "message": "Please verify your email before logging in." }`

---

### 4. **Refresh Access Token**

**Endpoint:** `POST /refresh`

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // refresh_token
}
```

**Success Response (200):**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- Missing token (401): `{ "message": "Refresh token is missing" }`
- Invalid/expired (403): `{ "message": "Invalid or expired refresh token. Please log in again." }`

---

### 5. **Forgot Password**

**Endpoint:** `POST /forgot-password`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Validation Rules:**
- `email`: Must be valid email format

**Success Response (200):**
```json
{
  "message": "Reset link sent to your email",
  "success": true
}
```

**Error Response (404):**
```json
{
  "message": "User not found"
}
```

---

### 6. **Reset Password**

**Endpoint:** `POST /reset-password/:id/:token`

**Authentication:** Not required

**URL Parameters:**
- `id`: User ID
- `token`: Reset token from email link

**Request Body:**
```json
{
  "newPassword": "NewSecurePassword123"
}
```

**Validation Rules:**
- `newPassword`: Minimum 6 characters

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password successfully reset. You can now log in."
}
```

**Error Response (400):**
```json
{
  "message": "Token is invalid or has expired."
}
```

---

### 7. **Get All Users (with Pagination & Search)**

**Endpoint:** `GET /?page=1&search=john`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page`: Page number (default: 1)
- `search`: Search by name or email (optional)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "profileImage": "filename.jpg",
      "isVerified": true,
      "createdAt": "2024-04-02T10:30:00Z",
      "updatedAt": "2024-04-02T10:30:00Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1
}
```

**Note:** Results are cached in Redis for 1 hour (3600 seconds)

**Error Response (401):**
```json
{
  "message": "Not authorized to access this route"
}
```

---

### 8. **Get User by ID**

**Endpoint:** `GET /:id`

**Authentication:** Required (Bearer Token)

**URL Parameters:**
- `id`: User ID

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "profileImage": "filename.jpg",
    "isVerified": true,
    "createdAt": "2024-04-02T10:30:00Z",
    "updatedAt": "2024-04-02T10:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "message": "User not found"
}
```

---

### 9. **Update User Profile**

**Endpoint:** `PUT /profile`

**Authentication:** Required (Bearer Token)

**Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "profileImage": <file> // Optional
}
```

**Success Response (200):**
```json
{
  "message": "Profile updated successfully",
  "success": true,
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "admin",
    "profileImage": "new_filename.jpg"
  }
}
```

**Error Response (404):**
```json
{
  "message": "User not found"
}
```

---

### 10. **Delete User (Admin Only)**

**Endpoint:** `DELETE /:id`

**Authentication:** Required (Bearer Token) + Admin Role

**URL Parameters:**
- `id`: User ID to delete

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**
- Unauthorized (401): `{ "message": "Not authorized to access this route" }`
- Forbidden (403): `{ "message": "Access denied: Admin privileges required" }`
- Cannot delete self (400): `{ "message": "You cannot delete your own admin account." }`
- User not found (404): `{ "message": "User not found" }`

---

## 🗂️ Frontend Routes

All frontend routes except login and register require authentication.

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | Login | User login page |
| `/register` | Register | User registration page |
| `/forgot-password` | ForgotPassword | Password recovery request |
| `/reset-password/:id/:token` | ResetPassword | Password reset form |
| `/verify-email` | VerifyEmail | Email verification page |
| `/dashboard` | Dashboard | User dashboard (Protected) |
| `/profile` | Profile | User profile management (Protected) |
| `/admin` | AdminPanel | Admin user management (Protected, Admin only) |

---

## 🔑 Key Features Explained

### JWT Authentication Flow
1. User logs in and receives both `access_token` (15m) and `refresh_token` (7d)
2. Access token is used for API requests
3. When access token expires, refresh token is used to get a new access token
4. Frontend automatically handles token refresh using Axios interceptors

### Redis Caching
- User list queries are cached for 1 hour
- Cache is cleared when a user is deleted
- Improves performance on frequently accessed endpoints

### Role-Based Access Control
- **User Role**: Can view own profile and user list
- **Admin Role**: Can delete other users and manage all users

### File Upload
- Profile images are uploaded to `backend/uploads/` directory
- Stored as filename and referenced in the user record

---

## 📝 Notes

- Password reset tokens expire in 15 minutes
- Email verification tokens expire in 15 minutes
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- All times are in UTC
- Database will auto-create tables on first run via Sequelize sync

---

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements.

---

## 📄 License

ISC License