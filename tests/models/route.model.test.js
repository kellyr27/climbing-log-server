import mongoose from 'mongoose';
import { expect } from 'chai';
import Route from '../../models/route.model.js';
import User from '../../models/user.model.js';
import Area from '../../models/area.model.js';
import Ascent from '../../models/ascent.model.js';
import { connectDB, disconnectDB } from '../../configs/db.config.js';
import { ROUTE_COLORS } from '../../configs/constants.js';

describe('Route Model Test', () => {
  let userId;
  let areaId;

  before(async () => {
    await connectDB();
    const user = new User({ username: 'testuser', password: 'password' });
    const savedUser = await user.save();
    userId = savedUser._id;
  });

  beforeEach(async () => {
    const areaData = { name: 'Test Area', userId };
    const area = new Area(areaData);
    const savedArea = await area.save();
    areaId = savedArea._id;
  });

  after(async () => {
    await disconnectDB();
  });

  afterEach(async () => {
    await Route.deleteMany({});
    await Ascent.deleteMany({});
    await Area.deleteMany({});
  });

  it('create & save route successfully', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId };

    const validRoute = new Route(routeData);
    const savedRoute = await validRoute.save();

    expect(savedRoute._id).to.exist;
    expect(savedRoute.name).to.equal(routeData.name);
    expect(savedRoute.grade).to.equal(routeData.grade);
    expect(savedRoute.color).to.equal(routeData.color);
    expect(savedRoute.userId.toString()).to.equal(userId.toString());
    expect(savedRoute.areaId.toString()).to.equal(areaId.toString());
    expect(savedRoute.bookmarked).to.be.false;
  });

  it('insert route successfully, but the field not defined in schema should be undefined', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId, extraField: 'extra' };

    const routeWithInvalidField = new Route(routeData);
    const savedRouteWithInvalidField = await routeWithInvalidField.save();

    expect(savedRouteWithInvalidField._id).to.exist;
    expect(savedRouteWithInvalidField.extraField).to.be.undefined;
  });

  it('create route without required field should fail', async () => {
    const routeWithoutRequiredField = new Route({ grade: 5, color: ROUTE_COLORS[0], userId, areaId });
    let err;
    try {
      await routeWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }

    expect(err).to.be.instanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name).to.exist;
  });

  it('create route with invalid color should fail', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: 'invalid', userId, areaId };
    let err;
    try {
      const invalidRoute = new Route(routeData);
      await invalidRoute.save();
    } catch (error) {
      err = error;
    }

    expect(err).to.be.instanceOf(mongoose.Error.ValidationError);
    expect(err.errors.color).to.exist;
  });

  it('create route with valid color should succeed', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId };

    const validRoute = new Route(routeData);
    const savedRoute = await validRoute.save();

    expect(savedRoute._id).to.exist;
    expect(savedRoute.color).to.equal(ROUTE_COLORS[0]);
  });

  it('create route with unique name should succeed', async () => {
    const routeData1 = { name: 'Test Route 1', grade: 5, color: ROUTE_COLORS[0], userId, areaId };
    const routeData2 = { name: 'Test Route 2', grade: 5, color: ROUTE_COLORS[0], userId, areaId };

    const validRoute1 = new Route(routeData1);
    const savedRoute1 = await validRoute1.save();

    const validRoute2 = new Route(routeData2);
    const savedRoute2 = await validRoute2.save();

    expect(savedRoute1._id).to.exist;
    expect(savedRoute2._id).to.exist;
    expect(savedRoute1.name).to.not.equal(savedRoute2.name);
  });

  it('create route with duplicate name should fail', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId };

    const validRoute = new Route(routeData);
    await validRoute.save();

    const duplicateRoute = new Route(routeData);
    let err;
    try {
      await duplicateRoute.save();
    } catch (error) {
      err = error;
    }

    expect(err.name).to.equal('MongoServerError');
    expect(err.code).to.equal(11000); // MongoDB duplicate key error code
  });

});
