import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import userSchema from '../validators/user.validator.js';
import validateSchema from '../middlewares/validateSchema.js';

dotenv.config();

export const register = [
  validateSchema(userSchema),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Check if username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        const error = new Error('Username already taken');
        error.status = 400;
        throw error;
      }

      const user = new User({ username, password });
      await user.save();

      const token = user.generateAuthToken();
      res.status(201).json({ token });
    } catch (error) {
      next(error);
    }
  },
];

export const login = [
  validateSchema(userSchema),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
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

export const updatePassword = [
  validateSchema(userSchema),
  async (req, res, next) => {
    try {
      
      const { id } = req.params;
      const { username, password, newPassword } = req.body;
      const user = await User.findById(id);

      // Check if the user exists
      if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
      }

      // Check if the current password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const error = new Error('Invalid password');
        error.status = 401;
        throw error;
      }

      // Update the password
      user.password = newPassword;
      await user.save();

      res.status(200).json({ message: "Password updated" });
    } catch (error) {
      next(error);
    }
  },
];
