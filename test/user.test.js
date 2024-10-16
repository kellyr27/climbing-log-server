import mongoose from 'mongoose';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import User from '../models/User.js';
let mongoServer;

describe('User Model Test', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('create & save user successfully', async () => {
    const userData = { username: 'testuser', password: 'password' };

    const validUser = new User(userData);
    const savedUser = await validUser.save();

    expect(savedUser._id).to.exist;
    expect(savedUser.username).to.equal(userData.username);
    expect(savedUser.password).to.equal(userData.password);
  })

  it('insert user successfully, but the field does not defined in schema should be undefined', async () => {
    const userData = { username: 'testuser', password: 'password', email: 'test@email.com' };

    const userWithInvalidField = new User(userData);
    const savedUserWithInvalidField = await userWithInvalidField.save();

    expect(savedUserWithInvalidField._id).to.exist;
    expect(savedUserWithInvalidField.email).to.be.undefined;
  })

  it('create user without required field should failed', async () => {
    const userWithoutRequiredField = new User({ username: 'testuser' });
    let err;
    try {
      const savedUserWithoutRequiredField = await userWithoutRequiredField.save();
      err = savedUserWithoutRequiredField;
    } catch (error) {
      err = error
    }

    expect(err).to.be.instanceOf(mongoose.Error.ValidationError);
    expect(err.errors.password).to.exist;
  })
})