import express from 'express';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

// Create Account
router
  .route('/')
  .post(...userController.register)

// Login
router
  .route('/login')
  .post(...userController.login);

//TODO: Add routes for updating user info

export default router;