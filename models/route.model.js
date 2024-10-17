import mongoose from 'mongoose';
import Ascent from './ascent.model.js';
import {ROUTE_COLORS} from '../config/constants.js';

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value',
    },
  },
  color: {
    type: String,
    required: true,
    enum: ROUTE_COLORS,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  bookmarked: {
    type: Boolean,
    default: false,
  },
});

// Returns if the route was flashed by the user
routeSchema.virtual('flashed').get(async function() {
  const ascent = await Ascent.findOne({ route: this._id, user: this.user, tickType: 'flash' }).exec();
  return ascent ? true : false;
});

// Returns if the route was sent by the user
routeSchema.virtual('sent').get(async function() {
  const ascent = await Ascent.findOne({ 
    route: this._id, 
    user: this.user, 
    tickType: { $in: ['flash', 'redpoint'] } 
  }).exec();
  return ascent ? true : false;
});

// Returns the number of sessions it took to send the route
routeSchema.virtual('sessionsToSend').get(async function() {

  // If the user flashed the route
  if (this.flashed) return 0;

  // If the user hasn't sent the route
  if (!this.sent) return null;

  // Find the earliest date ascent that was a redpoint
  const earliestSentAscent = await Ascent.findOne({ 
    route: this._id, 
    user: this.user, 
    tickType: 'redpoint' 
  }).sort({ date: 1 }).exec();

  // Find the number of unique dates that occured prior to the send date
  const dates = await Ascent.find({ 
    user: this.user, 
    date: { $lt: earliestSentAscent.date } 
  }).distinct('date').exec();

  return dates.length;
});

// Returns the first sent Ascent of the route
routeSchema.virtual('firstSentAscent').get(async function() {
  return await Ascent.findOne({ 
    route: this._id, 
    user: this.user, 
    tickType: { $in: ['flash', 'redpoint'] } 
  }).sort({ date: 1 }).exec();
});

const Route = mongoose.model('Route', routeSchema);
module.exports = Route;
