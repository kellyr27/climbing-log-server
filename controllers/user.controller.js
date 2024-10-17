import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import userSchema from '../validators/user.validator.js';
import validateSchemas from '../middlewares/validateSchemas.js';

dotenv.config();

export const register = [
  validateSchemas({ user: userSchema }),
  async (req, res, next) => {
    try {
      const { user: userData } = req.body;
      const { username, password } = userData;

      // Check if username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        const error = new Error('Username already taken');
        error.status = 400;
        throw error;
      }

      const newUser = new User({ username, password });
      await newUser.save();

      const token = newUser.generateAuthToken();
      res.status(201).json({ token });
    } catch (error) {
      next(error);
    }
  },
];

export const login = [
  validateSchemas({ user: userSchema }),
  async (req, res, next) => {
    try {
      const { user: userData } = req.body;
      const { username, password } = userData;
      const user = await User.findOne({ username });

      // Check if the user exists
      if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
      }

      // Check if the password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const error = new Error('Invalid password');
        error.status = 401;
        throw error;
      }

      // Create a token
      const token = user.generateAuthToken();
      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  },
];
