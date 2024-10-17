import mongoose from 'mongoose';
import { ASCENT_TICK_TYPES } from '../configs/constants.js';

const ascentSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
  },
  tickType: {
    type: String,
    enum: ASCENT_TICK_TYPES,
    required: true,
  },
});

// Delete the route if it's the only ascent
ascentSchema.post('remove', async function(doc, next) {
  const ascentCount = await Ascent.countDocuments({ routeId: doc.routeId });
  if (ascentCount === 0) {
    await Route.findByIdAndRemove(doc.routeId);
  }
  next();
});

const Ascent = mongoose.model('Ascent', ascentSchema);
export default Ascent;