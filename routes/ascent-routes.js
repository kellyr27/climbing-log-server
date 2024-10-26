import express from 'express';
import * as ascentController from '../controllers/ascentController.js';
import authenticateUser from '../middleware/authenticateUser.js';

const router = express.Router();

router
  .route('/')
  .post(authenticateUser, ...ascentController.createAscent)
  .get(...ascentController.getAllAscents);

// router.route('/prefill-ascent-date')
//     .get(authenticateUser, ...ascentController.prefillAscentDate);

router
  .route('/:id')
  .get(...ascentController.getAscentById)
  .put(authenticateUser, ...ascentController.updateAscent)
  .delete(authenticateUser, ...ascentController.deleteAscent);

export default router;
