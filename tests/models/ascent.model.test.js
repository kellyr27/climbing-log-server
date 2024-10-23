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

});
