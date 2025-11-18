// ------------------- Imports -------------------
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');

// ------------------- Import Routes -------------------
const superAdminRoutes = require('./backend-superadmin/routes/superAdminRoutes');
const trustRoutes = require('./backend-superadmin/routes/trustRoutes');
const schoolRoutes = require('./backend-superadmin/routes/schoolRoutes');
const digitalFormsRoutes = require("./backend-school/routes/digitalFormsRoutes");
const schoolAuthRoutes = require('./backend-school/routes/schoolAuthRoutes');
const trustSchoolRoutes = require('./backend-trust/routes/trustSchoolRoutes');
const trustAuthRoutes = require('./backend-trust/routes/authRoutes');
const studentRoutes = require('./backend-school/routes/studentRoutes');
const schoolClassRoutes = require('./backend-school/routes/classRoutes');
const studentIDRoutes = require("./backend-school/routes/studentIDRoutes");
const teacherRoutes = require('./backend-school/routes/teacherRoutes');
const teacherAuthRoutes = require('./backend-teacher/routes/authRoutes');
const teacherMyclassesRoutes = require('./backend-teacher/routes/teacherMyclassesRoutes');
const teacherStudentFormsRoutes = require('./backend-teacher/routes/teacherStudentFormsRoutes');
const teacherPendingApprovalRoutes = require("./backend-teacher/routes/teacherPendingApprovalRoutes");
const studentFormsRoutes = require('./backend-teacher/routes/studentFormsRoutes');
const studentFormShareRoutes = require('./backend-teacher/routes/studentFormShareRoutes');
const formLinkRoutes = require('./backend-teacher/routes/formLinkRoutes');
// ------------------- App Setup -------------------
const app = express();
app.use(express.json());

// ------------------- CORS Setup -------------------
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://admin.mydigiinfocard.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// ------------------- Root Route -------------------
app.get('/', (req, res) => {
  res.json({ message: '✅ IDCRM API is running' });
});

// ------------------- API Routes -------------------

// Super Admin
app.use('/api/superadmin', superAdminRoutes);

// Trust
app.use('/api/trust', trustRoutes);
app.use('/api/trust/auth', trustAuthRoutes);
app.use('/api/trust/schools', trustSchoolRoutes);

// School
app.use('/api/school/auth', schoolAuthRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/school/class', schoolClassRoutes);
app.use('/api/school/teacher', teacherRoutes);
app.use('/api/school/student', studentRoutes);
app.use("/api/school", digitalFormsRoutes);
app.use("/api/school", studentIDRoutes);
// Teacher
app.use('/api/teacher/auth', teacherAuthRoutes);
app.use('/api/teacher/myclass', teacherMyclassesRoutes);
app.use("/api/teacher", teacherPendingApprovalRoutes); 
app.use('/api/teacher/student-forms', teacherStudentFormsRoutes);
app.use('/api/form-links', formLinkRoutes);
// Student Form and Sharing
app.use('/api/student-forms', studentFormsRoutes);
app.use('/api/teacher', studentFormShareRoutes);

// ------------------- Database Sync -------------------
sequelize
  .sync({ alter: true })
  .then(() => console.log('✅ Database synchronized'))
  .catch(err => console.error('❌ Sync failed:', err));

// ------------------- Server Start -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));

