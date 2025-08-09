const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const BASE_URL = process.env.BASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// 📧 Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// =======================
// 📌 REGISTER
// =======================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      verified: false,
      emailToken,
    });

    await newUser.save();

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${emailToken}`;


    await transporter.sendMail({
      from: `"SmartProp AI" <${EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email address',
      html: `
        <h2>Welcome to SmartProp AI</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationLink}">✅ Verify Email</a>
      `,
    });

    res.status(201).json({ message: 'Registration successful. Please verify your email.' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =======================
// ✅ VERIFY EMAIL
// =======================
router.get('/verify-email', async (req, res) => {
  const token = req.query.token;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(400).send('Invalid token or user not found');
    if (user.verified) return res.send('✅ Email already verified.');

    user.verified = true;
    user.emailToken = null;
    await user.save();

    res.send('✅ Email verified successfully. You can now login.');
  } catch (err) {
    console.error('Email Verification Error:', err);
    return res.status(400).send('Invalid or expired token');
  }
});

// =======================
// 🔐 LOGIN
// =======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.verified) return res.status(403).json({ error: 'Email not verified.' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =======================
// 🔑 FORGOT PASSWORD
// =======================
// 🔑 FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // ✅ Updated as per your request
    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;

    await transporter.sendMail({
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.json({ message: 'Password reset link sent to email.' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// =======================
// 🔒 RESET PASSWORD (via token)
// =======================
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
