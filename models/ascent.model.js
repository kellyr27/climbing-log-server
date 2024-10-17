import mongoose from 'mongoose';
import {ASCENT_TICK_TYPES} from '../configs/constants.js';

const ascentSchema = new mongoose.Schema({
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
  },
  user: {
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

const Ascent = mongoose.model('Ascent', ascentSchema);
export default Ascent;