import mongoose from 'mongoose';
import { expect } from 'chai';
import Ascent from '../../models/ascent.model.js';
import Route from '../../models/route.model.js';
import Area from '../../models/area.model.js';
import User from '../../models/user.model.js';
import { connectDB, disconnectDB } from '../../configs/db.config.js';
import { ASCENT_TICK_TYPES } from '../../configs/constants.js';

describe('Ascent Model Tests', () => {
  let userId;
  let areaId;
  let routeId;

  before(async () => {
    await connectDB();
    const user = new User({ username: 'testuser', password: 'password' });
    const savedUser = await user.save();
    userId = savedUser._id;
  });

  beforeEach(async () => {
    const area = new Area({ name: 'Test Area', userId });
    const savedArea = await area.save();
    areaId = savedArea._id;

    const route = new Route({ name: 'Test Route', grade: 5, color: 'red', userId, areaId });
    const savedRoute = await route.save();
    routeId = savedRoute._id;
  });

  after(async () => {
    await disconnectDB();
  });

  afterEach(async () => {
    await Ascent.deleteMany({});
    await Route.deleteMany({});
    await Area.deleteMany({});
    await User.deleteMany({});
  });

  it('should create and save an ascent successfully', async () => {
    const ascentData = {
      routeId,
      userId,
      date: new Date(),
      notes: 'First ascent',
      tickType: ASCENT_TICK_TYPES[0], // Use the first tick type
    };

    const validAscent = new Ascent(ascentData);
    const savedAscent = await validAscent.save();

    expect(savedAscent._id).to.exist;
    expect(savedAscent.routeId.toString()).to.equal(routeId.toString());
    expect(savedAscent.userId.toString()).to.equal(userId.toString());
    expect(savedAscent.notes).to.equal(ascentData.notes);
    expect(savedAscent.tickType).to.equal(ascentData.tickType);
  });

  it('should fail to create an ascent without routeId', async () => {
    const ascentData = {
      userId,
      date: new Date(),
      notes: 'First ascent',
      tickType: ASCENT_TICK_TYPES[0],
    };

    const invalidAscent = new Ascent(ascentData);
    let err;
    try {
      await invalidAscent.save();
    } catch (error) {
      err = error;
    }

    expect(err).to.be.instanceOf(mongoose.Error.ValidationError);
    expect(err.errors.routeId).to.exist;
  });

  it('should fail to create an ascent with an invalid tickType', async () => {
    const ascentData = {
      routeId,
      userId,
      date: new Date(),
      notes: 'First ascent',
      tickType: 'invalid_type',
    };

    const invalidAscent = new Ascent(ascentData);
    let err;
    try {
      await invalidAscent.save();
    } catch (error) {
      err = error;
    }

    expect(err).to.be.instanceOf(mongoose.Error.ValidationError);
    expect(err.errors.tickType).to.exist;
  });

  it('should delete ascent and its dependents with deleteWithDependents', async () => {
    const ascentData = {
      routeId,
      userId,
      date: new Date(),
      notes: 'First ascent',
      tickType: ASCENT_TICK_TYPES[0],
    };

    const validAscent = new Ascent(ascentData);
    const savedAscent = await validAscent.save();

    await savedAscent.deleteWithDependents();

    const deletedAscent = await Ascent.findById(savedAscent._id);
    expect(deletedAscent).to.be.null;

    // Check if the route still exists
    const existingRoute = await Route.findById(routeId);
    expect(existingRoute).to.be.null;
  });

  it('should delete the route if it is the only ascent', async () => {
    const ascentData = {
      routeId,
      userId,
      date: new Date(),
      notes: 'First ascent',
      tickType: ASCENT_TICK_TYPES[0],
    };

    const validAscent = new Ascent(ascentData);
    await validAscent.save();

    await validAscent.deleteWithDependents();

    const deletedRoute = await Route.findById(routeId);
    expect(deletedRoute).to.be.null;
  });

  it('should not delete the route if there are other ascents', async () => {
    const ascentData1 = {
      routeId,
      userId,
      date: new Date(),
      notes: 'First ascent',
      tickType: ASCENT_TICK_TYPES[0],
    };

    const ascentData2 = {
      routeId,
      userId,
      date: new Date(),
      notes: 'Second ascent',
      tickType: ASCENT_TICK_TYPES[0],
    };

    const validAscent1 = new Ascent(ascentData1);
    await validAscent1.save();

    const validAscent2 = new Ascent(ascentData2);
    await validAscent2.save();

    await validAscent1.deleteWithDependents();

    const existingRoute = await Route.findById(routeId);
    expect(existingRoute).to.exist; // Route should still exist
  });

  it('should delete the area if it is the only route left', async () => {
    const ascentData = {
      routeId,
      userId,
      date: new Date(),
      notes: 'First ascent',
      tickType: ASCENT_TICK_TYPES[0],
    };

    const validAscent = new Ascent(ascentData);
    await validAscent.save();

    await validAscent.deleteWithDependents();

    const deletedArea = await Area.findById(areaId);
    expect(deletedArea).to.be.null; // Area should be deleted
  });

  it('should not delete the area if there are other routes left', async () => {
    const newRoute = new Route({ name: 'Another Route', grade: 5, color: 'blue', userId, areaId });
    await newRoute.save();

    const ascentData = {
      routeId: newRoute._id,
      userId,
      date: new Date(),
      notes: 'First ascent',
      tickType: ASCENT_TICK_TYPES[0],
    };

    const validAscent = new Ascent(ascentData);
    await validAscent.save();

    await validAscent.deleteWithDependents();

    const existingArea = await Area.findById(areaId);
    expect(existingArea).to.exist; // Area should still exist
  });
});
