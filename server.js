const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const sequelize = require('./config/db');

// ----------- Import Routes -----------
const superAdminRoutes = require('./backend-superadmin/routes/superAdminRoutes');
const trustRoutes = require('./backend-superadmin/routes/trustRoutes');
const schoolRoutes = require('./backend-superadmin/routes/schoolRoutes');
const trustSchoolRoutes = require('./backend-trust/routes/trustSchoolRoutes');
const studentRoutes = require('./backend-school/routes/studentRoutes');
// ✅ New route for school class & division
const schoolClassRoutes = require('./backend-school/routes/classRoutes');
const teacherRoutes = require('./backend-school/routes/teacherRoutes');

// ----------- App Setup -----------
const app = express();
app.use(bodyParser.json());

// ----------- API Routes -----------
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/trust', trustRoutes);
app.use('/api/school/class', schoolClassRoutes);
app.use('/api/trust/schools', trustSchoolRoutes);
app.use('/api/school/teacher', teacherRoutes);
//  New School-level Class management routes
app.use('/api/school/class', schoolClassRoutes);
app.use('/api/school/student', studentRoutes);
// ----------- Database Sync -----------
sequelize
  .sync({ alter: true })
  .then(() => console.log('✅ Database synchronized'))
  .catch(err => console.error('❌ Sync failed:', err));

// ----------- Server Start -----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
