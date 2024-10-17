import mongoose from 'mongoose';
import { expect } from 'chai';
import Area from '../../models/area.model.js';
import User from '../../models/user.model.js';
import { connectDB, disconnectDB } from '../../configs/db.config.js';
import { STEEPNESS_OPTIONS } from '../../configs/constants.js';

describe('Area Model Test', () => {
  let userId;

  before(async () => {
    await connectDB();
    const user = new User({ username: 'testuser', password: 'password' });
    const savedUser = await user.save();
    userId = savedUser._id;
  });

  after(async () => {
    await disconnectDB();
  });

  afterEach(async () => {
    await Area.deleteMany({});
  });

  it('create & save area successfully', async () => {
    const areaData = { name: 'Test Area', userId };

    const validArea = new Area(areaData);
    const savedArea = await validArea.save();

    expect(savedArea._id).to.exist;
    expect(savedArea.name).to.equal(areaData.name);
    expect(savedArea.userId.toString()).to.equal(userId.toString());
    expect(savedArea.steepnessTags).to.deep.equal([]);
  });

  it('insert area successfully, but the field not defined in schema should be undefined', async () => {
    const areaData = { name: 'Test Area', userId, extraField: 'extra' };

    const areaWithInvalidField = new Area(areaData);
    const savedAreaWithInvalidField = await areaWithInvalidField.save();

    expect(savedAreaWithInvalidField._id).to.exist;
    expect(savedAreaWithInvalidField.extraField).to.be.undefined;
  });

  it('create area without required field should fail', async () => {
    const areaWithoutRequiredField = new Area({ userId });
    let err;
    try {
      const savedAreaWithoutRequiredField = await areaWithoutRequiredField.save();
      err = savedAreaWithoutRequiredField;
    } catch (error) {
      err = error;
    }

    expect(err).to.be.instanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name).to.exist;
  });

  it('create area with invalid steepnessTags should fail', async () => {
    const areaData = { name: 'Test Area', userId, steepnessTags: ['invalid'] };
    let err;
    try {
      const invalidArea = new Area(areaData);
      const savedInvalidArea = await invalidArea.save();
      err = savedInvalidArea;
    } catch (error) {
      err = error;
    }

    expect(err).to.be.instanceOf(mongoose.Error.ValidationError);
    expect(err.errors['steepnessTags.0']).to.exist;
  });

  it('create area with valid steepnessTags should succeed', async () => {
    const areaData = { name: 'Test Area', userId, steepnessTags: [STEEPNESS_OPTIONS[0]] };

    const validArea = new Area(areaData);
    const savedArea = await validArea.save();

    expect(savedArea._id).to.exist;
    expect(savedArea.steepnessTags).to.deep.equal([STEEPNESS_OPTIONS[0]]);
  });

  it('create area with multiple valid steepnessTags should succeed', async () => {
    const areaData = { name: 'Test Area', userId, steepnessTags: [STEEPNESS_OPTIONS[0], STEEPNESS_OPTIONS[1]] };

    const validArea = new Area(areaData);
    const savedArea = await validArea.save();

    expect(savedArea._id).to.exist;
    expect(savedArea.steepnessTags).to.deep.equal([STEEPNESS_OPTIONS[0], STEEPNESS_OPTIONS[1]]);
  });

  it('create area with all valid steepnessTags should succeed', async () => {
    const areaData = { name: 'Test Area', userId, steepnessTags: STEEPNESS_OPTIONS };

    const validArea = new Area(areaData);
    const savedArea = await validArea.save();

    expect(savedArea._id).to.exist;
    expect(savedArea.steepnessTags).to.deep.equal(STEEPNESS_OPTIONS);
  });

  
});