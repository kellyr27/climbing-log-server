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

  it('isFlashed method should return true if route was flashed', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId };
    const validRoute = new Route(routeData);
    const savedRoute = await validRoute.save();

    const ascentData = { routeId: savedRoute._id, userId, date: new Date(), tickType: 'flash' };
    const validAscent = new Ascent(ascentData);
    await validAscent.save();

    const isFlashed = await savedRoute.isFlashed();
    expect(isFlashed).to.be.true;
  });

  it('isFlashed method should return false if route was not flashed', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId };
    const validRoute = new Route(routeData);
    const savedRoute = await validRoute.save();

    const ascentData = { routeId: savedRoute._id, userId, date: new Date(), tickType: 'redpoint' };
    const validAscent = new Ascent(ascentData);
    await validAscent.save();

    const isFlashed = await savedRoute.isFlashed();
    expect(isFlashed).to.be.false;
  });

  it('isSent method should return true if route was sent', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId };
    const validRoute = new Route(routeData);
    const savedRoute = await validRoute.save();

    const ascentData = { routeId: savedRoute._id, userId, date: new Date(), tickType: 'redpoint' };
    const validAscent = new Ascent(ascentData);
    await validAscent.save();

    const isSent = await savedRoute.isSent();
    expect(isSent).to.be.true;
  });

  it('isSent method should return false if route was not sent', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId };
    const validRoute = new Route(routeData);
    const savedRoute = await validRoute.save();

    const ascentData = { routeId: savedRoute._id, userId, date: new Date(), tickType: 'attempt' };
    const validAscent = new Ascent(ascentData);
    await validAscent.save();

    const isSent = await savedRoute.isSent();
    expect(isSent).to.be.false;
  });

  it('sessionsToSend method should return correct number of sessions', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId };
    const validRoute = new Route(routeData);
    const savedRoute = await validRoute.save();

    const ascentData1 = { routeId: savedRoute._id, userId, date: new Date('2023-01-01'), tickType: 'attempt' };
    const ascentData2 = { routeId: savedRoute._id, userId, date: new Date('2023-01-02'), tickType: 'redpoint' };
    await Ascent.create([ascentData1, ascentData2]);

    const sessionsToSend = await savedRoute.sessionsToSend();
    expect(sessionsToSend).to.equal(1);
  });

  it('sessionsToSend method should return 0 if route was flashed', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId };
    const validRoute = new Route(routeData);
    const savedRoute = await validRoute.save();

    const ascentData = { routeId: savedRoute._id, userId, date: new Date(), tickType: 'flash' };
    const validAscent = new Ascent(ascentData);
    await validAscent.save();

    const sessionsToSend = await savedRoute.sessionsToSend();
    expect(sessionsToSend).to.equal(0);
  });

  it('sessionsToSend method should return -1 if route was not sent', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId };
    const validRoute = new Route(routeData);
    const savedRoute = await validRoute.save();

    const ascentData = { routeId: savedRoute._id, userId, date: new Date(), tickType: 'attempt' };
    const validAscent = new Ascent(ascentData);
    await validAscent.save();

    const sessionsToSend = await savedRoute.sessionsToSend();
    expect(sessionsToSend).to.equal(-1);
  });

  it('firstSentAscent method should return the first sent ascent', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId };
    const validRoute = new Route(routeData);
    const savedRoute = await validRoute.save();

    const ascentData1 = { routeId: savedRoute._id, userId, date: new Date('2023-01-01'), tickType: 'attempt' };
    const ascentData2 = { routeId: savedRoute._id, userId, date: new Date('2023-01-02'), tickType: 'redpoint' };
    await Ascent.create([ascentData1, ascentData2]);

    const firstSentAscent = await savedRoute.firstSentAscent();
    expect(firstSentAscent.tickType).to.equal('redpoint');
    expect(firstSentAscent.date.toISOString()).to.equal(new Date('2023-01-02').toISOString());
  });

  it('deleteWithDependents method should delete route and associated ascents', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId };
    const validRoute = new Route(routeData);
    const savedRoute = await validRoute.save();

    const ascentData = { routeId: savedRoute._id, userId, date: new Date(), tickType: 'flash' };
    const validAscent = new Ascent(ascentData);
    await validAscent.save();

    await savedRoute.deleteWithDependents();

    const deletedRoute = await Route.findById(savedRoute._id);
    const deletedAscents = await Ascent.find({ routeId: savedRoute._id });

    expect(deletedRoute).to.be.null;
    expect(deletedAscents).to.have.lengthOf(0);
  });

  it('deleteWithDependents method should delete area if it has no other routes', async () => {
    const routeData = { name: 'Test Route', grade: 5, color: ROUTE_COLORS[0], userId, areaId };
    const validRoute = new Route(routeData);
    const savedRoute = await validRoute.save();

    await savedRoute.deleteWithDependents();

    const deletedArea = await Area.findById(areaId);
    expect(deletedArea).to.be.null;
  });

  it('deleteWithDependents method should not delete area if it has other routes', async () => {
    const areaData1 = { name: 'Test Area 1', userId };
    const areaData2 = { name: 'Test Area 2', userId };
    const validArea1 = new Area(areaData1);
    const savedArea1 = await validArea1.save();
    const validArea2 = new Area(areaData2);
    const savedArea2 = await validArea2.save();

    const routeData1 = { name: 'Test Route 1', grade: 5, color: ROUTE_COLORS[0], userId, areaId: savedArea1._id };
    const routeData2 = { name: 'Test Route 2', grade: 5, color: ROUTE_COLORS[0], userId, areaId: savedArea2._id };

    const validRoute1 = new Route(routeData1);
    const savedRoute1 = await validRoute1.save();

    const validRoute2 = new Route(routeData2);
    const savedRoute2 = await validRoute2.save();

    await savedRoute1.deleteWithDependents();

    const remainingArea = await Area.findById(savedArea2._id);
    expect(remainingArea).to.exist;
  });
});
