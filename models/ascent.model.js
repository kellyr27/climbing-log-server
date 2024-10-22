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

// Delete the ascent and its dependents
ascentSchema.methods.deleteWithDependents = async function() {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Delete the ascent
    await this.deleteOne({session}); // Use deleteOne with session

    // Fetch the route document to get the areaId
    const route = await Route.findById(this.routeId).session(session);
    if (!route) {
      throw new Error('Route not found');
    }
    
    // Delete the route if it's the only ascent
    const ascentCount = await Ascent.countDocuments({ routeId: this.routeId }).session(session);
    if (ascentCount === 0) {
      await Route.findByIdAndRemove(this.routeId).session(session);
    }

    // Delete the area if it's the only route
    const routeCount = await Route.countDocuments({ areaId: route.areaId }).session(session);
    if (routeCount === 0) {
      await Area.findByIdAndRemove(route.areaId).session(session);
    }
  
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const Ascent = mongoose.model('Ascent', ascentSchema);
export default Ascent;