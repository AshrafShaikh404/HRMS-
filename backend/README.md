# HRMS Backend API

Human Resource Management System - RESTful API built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, HR, Employee)
- **Employee Management**: Complete CRUD operations with document upload
- **Attendance Tracking**: Check-in/out system with automatic calculations
- **Leave Management**: Application, approval workflow, and balance tracking
- **Payroll Processing**: Automated salary calculation based on attendance
- **Dashboard Analytics**: Role-specific dashboards with real-time data
- **Recruitment Module**: Job postings and candidate management

## 📋 Prerequisites

- Node.js v18+ or v20+
- MongoDB v4.4+ (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the backend directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/hrms
   JWT_SECRET=your-super-secret-key-change-this
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**

   **Local MongoDB:**
   ```bash
   mongod
   ```

   **Or use MongoDB Atlas** (update MONGODB_URI in .env with your connection string)

5. **Seed admin user**
   ```bash
   node seedAdmin.js
   ```

   This creates an admin account:
   - **Email**: admin@hrms.com
   - **Password**: admin123
   
   ⚠️ **Change the password after first login!**

6. **Start the server**

   **Development mode (with nodemon):**
   ```bash
   npm run dev
   ```

   **Production mode:**
   ```bash
   npm start
   ```

   Server will run on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/login` | Public | Login and get JWT token |
| POST | `/auth/register` | Admin | Create new user |
| POST | `/auth/change-password` | Private | Change password |
| GET | `/auth/me` | Private | Get current user |
| POST | `/auth/logout` | Private | Logout |

### Employee Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/employees` | Admin, HR | Get all employees |
| GET | `/employees/:id` | Admin, HR, Employee (own) | Get employee details |
| POST | `/employees` | Admin, HR | Create employee |
| PUT | `/employees/:id` | Admin, HR, Employee (limited) | Update employee |
| DELETE | `/employees/:id` | Admin, HR | Deactivate employee |
| POST | `/employees/:id/documents` | Admin, HR, Employee (own) | Upload document |

### Attendance Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/attendance/check-in` | All | Mark check-in |
| POST | `/attendance/check-out` | All | Mark check-out |
| GET | `/attendance` | All | Get attendance records |
| POST | `/attendance/manual-entry` | Admin, HR | Manual attendance entry |
| GET | `/attendance/report` | Admin, HR | Generate attendance report |

### Leave Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/leaves/balance` | All | Get leave balance |
| POST | `/leaves/apply` | All | Apply for leave |
| GET | `/leaves/pending-approvals` | Admin, HR | Get pending approvals |
| PUT | `/leaves/:id/approve` | Admin, HR | Approve leave |
| PUT | `/leaves/:id/reject` | Admin, HR | Reject leave |
| GET | `/leaves/history` | All | Get leave history |
| DELETE | `/leaves/:id` | All | Cancel leave |

### Payroll Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/payroll/generate` | Admin, HR | Generate payroll |
| GET | `/payroll/payslips/:month/:year` | Admin, HR | Get all payslips |
| GET | `/payroll/payslip/:employeeId/:month/:year` | All (own) | Get payslip |
| GET | `/payroll/reports` | Admin, HR | Get payroll reports |
| PUT | `/payroll/:id/status` | Admin, HR | Update payroll status |

### Dashboard Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/dashboard/admin` | Admin | Get admin dashboard |
| GET | `/dashboard/hr` | HR | Get HR dashboard |
| GET | `/dashboard/employee` | Employee | Get employee dashboard |

### Recruitment Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/recruitment/jobs` | Public | Get job postings |
| POST | `/recruitment/jobs` | Admin, HR | Create job posting |
| PUT | `/recruitment/jobs/:id` | Admin, HR | Update job posting |
| POST | `/recruitment/apply` | Public | Submit application |
| GET | `/recruitment/candidates` | Admin, HR | Get candidates |
| PUT | `/recruitment/candidates/:id` | Admin, HR | Update candidate status |
| POST | `/recruitment/candidates/:id/convert` | Admin, HR | Convert to employee |

## 🔐 Authentication

All protected routes require JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Database Models

- **Users**: Authentication and role management
- **Employees**: Employee master data
- **Attendance**: Daily attendance records
- **Leaves**: Leave applications and approvals
- **Payroll**: Monthly salary records
- **JobPostings**: Job openings
- **Candidates**: Job applications

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/             # Business logic
│   ├── authController.js
│   ├── employeeController.js
│   ├── attendanceController.js
│   ├── leaveController.js
│   ├── payrollController.js
│   ├── dashboardController.js
│   └── recruitmentController.js
├── middleware/              # Custom middleware
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   └── validation.middleware.js
├── models/                  # Mongoose schemas
│   ├── User.js
│   ├── Employee.js
│   ├── Attendance.js
│   ├── Leave.js
│   ├── Payroll.js
│   ├── JobPosting.js
│   └── Candidate.js
├── routes/                  # API routes
│   ├── auth.routes.js
│   ├── employee.routes.js
│   ├── attendance.routes.js
│   ├── leave.routes.js
│   ├── payroll.routes.js
│   ├── dashboard.routes.js
│   └── recruitment.routes.js
├── uploads/                 # File uploads directory
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
├── seedAdmin.js            # Admin user seed script
└── server.js               # Entry point
```

## 🧪 Testing

You can test the API using:

1. **Postman** - Import the endpoints and test
2. **Thunder Client** (VS Code extension)
3. **cURL** commands

Example login request:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrms.com","password":"admin123"}'
```

## 🔧 Development Tips

1. **View logs**: All errors are logged to console in development mode
2. **Auto-reload**: Use `npm run dev` for automatic server restart on file changes
3. **MongoDB GUI**: Use MongoDB Compass to view and manage database
4. **API Testing**: Test endpoints incrementally as you build features

## 📝 Important Notes

- Employee codes are auto-generated in format: **EMP-YYYY-NNNN**
- Passwords are hashed using bcrypt (10 salt rounds)
- JWT tokens expire in 7 days
- File uploads limited to 5MB
- Soft delete implemented for employees (status changed to inactive)
- Working days calculation excludes Sundays

## 🐛 Troubleshooting

**MongoDB connection error:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env file

**JWT token errors:**
- Verify JWT_SECRET is set in .env
- Check token expiration

**File upload errors:**
- Check that uploads directory exists
- Verify file size is under 5MB

## 📄 License

This project is developed as an educational BCA semester project.

## 👥 Contributors

BCA Semester 6 Project Team

---

For frontend integration, refer to the React application documentation.
