const User = require('../models/User');

async function seedAdmin() {
  const exists = await User.findOne({ username: 'admin' });
  if (exists) return;

  const admin = new User({
    username:  'admin',
    password:  'admin',
    firstName: 'Ashish',
    lastName:  'Kumar',
    role:      'admin'
  });
  await admin.save();
  console.log('✅ Default admin user created (admin/admin)');
}

module.exports = seedAdmin;
