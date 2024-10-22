import mongoose from 'mongoose';
import Ascent from './ascent.model.js';
import Area from './area.model.js';
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Returns if the route was flashed by the user
routeSchema.methods.isFlashed = async function() {
  const ascent = await Ascent.findOne({ routeId: this._id, userId: this.userId, tickType: 'flash' }).exec();
  return !!ascent;
};

// Returns if the route was sent by the user
routeSchema.methods.isSent = async function() {
  const ascent = await Ascent.findOne({ 
    routeId: this._id, 
    userId: this.userId, 
    tickType: { $in: ['flash', 'redpoint'] } 
  }).exec();
  return !!ascent;
};

// Returns the number of sessions it took to send the route
routeSchema.methods.sessionsToSend = async function() {
  if (await this.isFlashed()) return 0;
  if (!await this.isSent()) return -1;

  const earliestSentAscent = await Ascent.findOne({ 
    routeId: this._id, 
    userId: this.userId, 
    tickType: 'redpoint' 
  }).sort({ date: 1 }).exec();

  const dates = await Ascent.find({ 
    userId: this.userId, 
    date: { $lt: earliestSentAscent.date } 
  }).distinct('date').exec();

  return dates.length;
};

// Returns the first sent Ascent of the route
routeSchema.methods.firstSentAscent = async function() {
  return await Ascent.findOne({ 
    routeId: this._id, 
    userId: this.userId, 
    tickType: { $in: ['flash', 'redpoint'] } 
  }).sort({ date: 1 }).exec();
};

routeSchema.methods.deleteWithDependents = async function() {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Delete all ascents of the route
    await Ascent.deleteMany({ routeId: this._id }).session(session);
    
    // Delete the route
    const area = await Area.findById(this.areaId).session(session);
    await this.deleteOne({ session });
    
    // Delete the route's Area if it has no routes
    if (area) {
      const routeCount = await Route.countDocuments({ areaId: this.areaId }).session(session);
      if (routeCount === 0) {
        await area.deleteOne({ session });
      }
    }
    
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const Route = mongoose.model('Route', routeSchema);
export default Route;
