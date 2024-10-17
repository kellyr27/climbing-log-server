import mongoose from 'mongoose';
import { expect } from 'chai';
import User from '../../models/user.model.js';
import Ascent from '../../models/ascent.model.js';
import { connectDB, disconnectDB } from '../../configs/db.config.js';

describe('User Model Test', () => {
  before(async () => {
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Ascent.deleteMany({});
  });

  it('create & save user successfully with hashed password', async () => {
    const userData = { username: 'testuser', password: 'password' };

    const validUser = new User(userData);
    const savedUser = await validUser.save();

    expect(savedUser._id).to.exist;
    expect(savedUser.username).to.equal(userData.username);
    expect(savedUser.password).to.not.equal(userData.password);
  });

  it('insert user successfully, but the field not defined in schema should be undefined', async () => {
    const userData = { username: 'testuser', password: 'password', email: 'test@email.com' };

    const userWithInvalidField = new User(userData);
    const savedUserWithInvalidField = await userWithInvalidField.save();

    expect(savedUserWithInvalidField._id).to.exist;
    expect(savedUserWithInvalidField.email).to.be.undefined;
  });

  it('create user without required field should fail', async () => {
    const userWithoutRequiredField = new User({ username: 'testuser' });
    let err;
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save();
      err = savedUserWithoutRequiredField;
    } catch (error) {
      err = error;
    }

    expect(err).to.be.instanceOf(mongoose.Error.ValidationError);
    expect(err.errors.password).to.exist;
  });

  //FIXME - Ascents need more properties
  // it('should return the first ascent date of the user', async () => {
  //   const user = new User({ username: 'testuser', password: 'password' });
  //   const savedUser = await user.save();

  //   const ascent1 = new Ascent({ user: savedUser._id, date: new Date('2023-01-01') });
  //   const ascent2 = new Ascent({ user: savedUser._id, date: new Date('2023-02-01') });
  //   await ascent1.save();
  //   await ascent2.save();

  //   const firstAscentDate = await savedUser.firstAscentDate;
  //   expect(firstAscentDate).to.deep.equal(new Date('2023-01-01'));
  // });

  it('should compare passwords correctly', async () => {
    const userData = { username: 'testuser', password: 'password' };

    const user = new User(userData);
    const savedUser = await user.save();

    const isMatch = await savedUser.comparePassword('password');
    expect(isMatch).to.be.true;

    const isNotMatch = await savedUser.comparePassword('wrongpassword');
    expect(isNotMatch).to.be.false;
  });
});