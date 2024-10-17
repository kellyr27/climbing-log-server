import Joi from 'joi';

// Define the Joi schema
const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).optional(),
}).unknown(true);

export default userSchema;