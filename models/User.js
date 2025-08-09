const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Customer', 'Owner'],
    required: true 
  },
  verified: {
    type: Boolean,
    default: false,
  },
  emailToken: {
    type: String,
  },
  // ✅ Add these for password reset functionality
  resetToken: {
    type: String,
  },
  resetTokenExpiry: {
    type: Date,
  }
});

module.exports = mongoose.model('User', UserSchema);
