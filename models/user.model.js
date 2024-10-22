import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Ascent from './ascent.model.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: false },
  toObject: { virtuals: false }
});

// Returns the first ascent date of the user
userSchema.methods.getFirstAscentDate = async function() {
  const firstAscent = await Ascent.findOne({ user: this._id }).sort({ date: 1 }).exec();
  return firstAscent ? firstAscent.date : null;
};

userSchema.pre('save', async function (next) {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
      return next()
  };

  // Hash the password
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;

  next();
});

// Compare the candidate password with the user's password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate an authentication token for the user
userSchema.methods.generateAuthToken = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id, username: user.username }, process.env.TOKEN_KEY)
  return token;
};

const User = mongoose.model('User', userSchema);
export default User;