import express from 'express';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

// Create Account
router.post('/', ...userController.register)

// Login
router.post('/login', ...userController.login);

// Update Password
router.put('/users/:id/password', ...userController.updatePassword);

export default router;