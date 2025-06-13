import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../database/UserModel.js';

const router = express.Router();
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new UserModel({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    await newUser.save();
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in /register:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const payload = {
      id: user._id,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Error in /login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
