const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv=require('dotenv') ;
dotenv.config();
mongoose.connect(process.env.DEV_DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSuperAdmin() {
  const connection = mongoose.connection;

  try {
    const superAdminExists = await connection.collection('users').findOne({ role: 'super admin' });

    if (!superAdminExists) {
      const superAdminData = {
        email: process.env.ADMIN_EMAIL,
        password: await bcrypt.hash( process.env.ADMIN_PASSSWORD, 10),
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super admin',
      };

      const result = await connection.collection('users').insertOne(superAdminData);
      console.log('Super admin account created:', result.insertedId);
    } else {
      console.log('Super admin already exists.');
    }
  } catch (error) {
    console.error('Error creating super admin account:', error);
  } finally {
    mongoose.disconnect();
  }
}

createSuperAdmin();
