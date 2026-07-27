const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  role:      { type: String, enum: ['admin', 'editor'], default: 'editor' }
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password helper
UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);
