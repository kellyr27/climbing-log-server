import mongoose from 'mongoose';
import Ascent from './ascent.model.js';
import { ROUTE_COLORS } from '../configs/constants.js';

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: false,
  },
  bookmarked: {
    type: Boolean,
    default: false,
  },
});

// Returns if the route was flashed by the user
routeSchema.virtual('flashed').get(async function() {
  const ascent = await Ascent.findOne({ routeId: this._id, userId: this.userId, tickType: 'flash' }).exec();
  return ascent ? true : false;
});

// Returns if the route was sent by the user
routeSchema.virtual('sent').get(async function() {
  const ascent = await Ascent.findOne({ 
    routeId: this._id, 
    userId: this.userId, 
    tickType: { $in: ['flash', 'redpoint'] } 
  }).exec();
  return ascent ? true : false;
});

// Returns the number of sessions it took to send the route
routeSchema.virtual('sessionsToSend').get(async function() {

  // If the user flashed the route
  if (await this.flashed) return 0;

  // If the user hasn't sent the route
  if (!await this.sent) return null;

  // Find the earliest date ascent that was a redpoint
  const earliestSentAscent = await Ascent.findOne({ 
    routeId: this._id, 
    userId: this.userId, 
    tickType: 'redpoint' 
  }).sort({ date: 1 }).exec();

  // Find the number of unique dates that occurred prior to the send date
  const dates = await Ascent.find({ 
    userId: this.userId, 
    date: { $lt: earliestSentAscent.date } 
  }).distinct('date').exec();

  return dates.length;
});

// Returns the first sent Ascent of the route
routeSchema.virtual('firstSentAscent').get(async function() {
  return await Ascent.findOne({ 
    routeId: this._id, 
    userId: this.userId, 
    tickType: { $in: ['flash', 'redpoint'] } 
  }).sort({ date: 1 }).exec();
});

// Delete associated ascents when a route is deleted
routeSchema.pre('remove', async function(next) {
  await Ascent.deleteMany({ routeId: this._id });
  next();
});

// Delete the area if it's the only route
routeSchema.post('remove', async function(doc, next) {
  if (doc.areaId) {
    const routeCount = await Route.countDocuments({ areaId: doc.areaId });
    if (routeCount === 0) {
      await Area.findByIdAndRemove(doc.areaId);
    }
  }
  next();
});

const Route = mongoose.model('Route', routeSchema);
export default Route;
