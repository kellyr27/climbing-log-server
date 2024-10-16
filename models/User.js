import mongoose from 'mongoose';

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
});

//TODO: Add virtual for userSchema - first Ascent Date

//TODO: Add to JSON method for userSchema

const User = mongoose.model('User', userSchema);
export default User;