const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');

// ----------- Import Routes -----------
const superAdminRoutes = require('./backend-superadmin/routes/superAdminRoutes');
const trustRoutes = require('./backend-superadmin/routes/trustRoutes');
const schoolRoutes = require('./backend-superadmin/routes/schoolRoutes');
const schoolAuthRoutes = require('./backend-school/routes/schoolAuthRoutes');
const trustSchoolRoutes = require('./backend-trust/routes/trustSchoolRoutes');
const authRoutes = require('./backend-trust/routes/authRoutes');
const studentRoutes = require('./backend-school/routes/studentRoutes');
const schoolClassRoutes = require('./backend-school/routes/classRoutes'); // ye
const teacherRoutes = require('./backend-school/routes/teacherRoutes');
const teacherAuthRoutes = require('./backend-teacher/routes/authRoutes');
const teacherMyclassesRoutes = require('./backend-teacher/routes/teacherMyclassesRoutes');

// ----------- App Setup -----------
const app = express();

// Use JSON parser (body-parser not needed)
app.use(express.json());

// ----------- CORS Setup -----------
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://admin.mydigiinfocard.com"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true, // allow cookies/auth headers
  })
);

// ----------- API Routes -----------
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/trust', trustRoutes);
app.use('/api/school/class', schoolClassRoutes);
app.use('/api/trust/schools', trustSchoolRoutes);
app.use('/api/trust/auth', authRoutes);
app.use('/api/school/teacher', teacherRoutes);

// School-level routes
app.use('/api/school', schoolAuthRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/school/student', studentRoutes);

// Teacher routes
app.use('/api/teacher/auth', teacherAuthRoutes);

// ----------- Database Sync -----------
sequelize
  .sync({ alter: true })
  .then(() => console.log('✅ Database synchronized'))
  .catch(err => console.error('❌ Sync failed:', err));

// ----------- Server Start -----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
