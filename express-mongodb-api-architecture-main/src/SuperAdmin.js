const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://127.0.0.1:27017/Osc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSuperAdmin() {
  const connection = mongoose.connection;

  try {
    const superAdminExists = await connection.collection('users').findOne({ role: 'super admin' });

    if (!superAdminExists) {
      const superAdminData = {
        email: 'superadmin@example.com',
        password: await bcrypt.hash('superadminpassword', 10),
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
