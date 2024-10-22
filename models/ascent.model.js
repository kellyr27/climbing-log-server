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
    
    // Fetch the route and area document to get the areaId
    const route = await Route.findById(this.routeId).session(session);
    if (!route) {
      throw new Error('Route not found');
    }
    const area = await Area.findById(route.areaId).session(session);
    if (!area) {
      throw new Error('Area not found');
    }

    // Delete the ascent
    await this.deleteOne({session}); 
    
    // Delete the route if it is the only ascent left
    const routeAscentsCount = await Ascent.countDocuments({ routeId: route._id }).session(session);
    if (routeAscentsCount === 0) {
      await route.deleteOne({session});
    }

    // Delete the area if it is the only route left
    const areaRoutesCount = await Route.countDocuments({ areaId: area._id }).session(session);
    if (areaRoutesCount === 0) {
      await area.deleteOne({session});
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