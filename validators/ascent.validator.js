import Joi from 'joi';
import { ALL_ASCENT_TICK_TYPES } from '../configs/constants.js';

const ascentValidator = Joi.object({
  date: Joi.date().required(),
  notes: Joi.string().optional(),
  tickType: Joi.string()
    .valid(...ALL_ASCENT_TICK_TYPES)
    .required(),
});

export default ascentValidator;