import mongoose from 'mongoose';
import { ROUTE_COLORS, ASCENT_TICK_TYPES } from '../configs/constants.js';
import Area from './area.model.js';

/**
 * Ascent Schema
 */

const ascentSchema = new mongoose.Schema({
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
});

// Computes the order based on ASCENT_TICK_TYPES
ascentSchema.virtual('tickTypeOrder').get(function() {
  // Find the index of the tickType in the ASCENT_TICK_TYPES array
  return ASCENT_TICK_TYPES.indexOf(this.tickType);
});



/**
 * Route Schema
 */

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
  ascents: [ascentSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual to get highest tick type for a route
routeSchema.virtual('highestTickType').get(function () {
  if (this.ascents.length === 0) {
    return null;
  }
  return this.ascents.reduce((max, ascent) => {
    return ascent.tickTypeOrder > max.tickTypeOrder ? ascent : max;
  }, this.ascents[0]).tickType;
});

// Virtual to get whether the route was flashed
routeSchema.virtual('flashed').get(function () {
  return this.highestTickType === 'flash';
});

// Virtual to get whether the route was sent
routeSchema.virtual('sent').get(function () {
  return this.highestTickType === 'flash' || this.highestTickType === 'redpoint';
});

// Virtual to get the earliest sent ascent for a route
routeSchema.virtual('earliestSentAscent').get(function () {
  return this.ascents.filter(ascent => ascent.tickType === 'flash' || ascent.tickType === 'redpoint')
    .sort((a, b) => a.date - b.date)[0] || null;
});

// Virtual to get the number of sessions to send a route
routeSchema.virtual('sessionsToSend').get(function () {
  if (this.flashed) {
    return 0;
  }

  const earliestSentAscent = this.earliestSentAscent;
  if (!earliestSentAscent) {
    return null;
  }

  const dates = this.ascents.filter(ascent => ascent.date < earliestSentAscent.date)
    .map(ascent => ascent.date.toDateString());
  return new Set(dates).size;
});

// Virtual to get the number of ascents for a route
routeSchema.virtual('ascentCount').get(function () {
  return this.ascents.length;
});

// Virtual to get the first ascent date for a route
routeSchema.virtual('firstAscentDate').get(function () {
  if (this.ascents.length === 0) {
    return null;
  }
  return this.ascents.sort((a, b) => a.date - b.date)[0].date;
});

// Virtual to get the last ascent date for a route
routeSchema.virtual('lastAscentDate').get(function () {
  if (this.ascents.length === 0) {
    return null;
  }
  return this.ascents.sort((a, b) => b.date - a.date)[0].date;
});

const Route = mongoose.model('Route', routeSchema);
export default Route;
