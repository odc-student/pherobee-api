

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function createSuperAdmin() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/Osc', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const connection = mongoose.connection;

    const superAdminExists = await connection.collection('users').findOne({ role: 'super admin' });

    if (!superAdminExists) {
      const superAdminData = {
        email: 'superadmin@example.com',
        password: 'superadminpassword',
        // await bcrypt.hash('superadminpassword', 10),
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

