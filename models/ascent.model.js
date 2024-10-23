import mongoose from 'mongoose';
import { ASCENT_TICK_TYPES } from '../configs/constants.js';
import Route from './route.model.js';
import Area from './area.model.js';

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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Add a virtual field to compute the order based on ASCENT_TICK_TYPES
ascentSchema.virtual('tickTypeOrder').get(function() {
  // Find the index of the tickType in the ASCENT_TICK_TYPES array
  return ASCENT_TICK_TYPES.indexOf(this.tickType);
});


const Ascent = mongoose.model('Ascent', ascentSchema);
export default Ascent;