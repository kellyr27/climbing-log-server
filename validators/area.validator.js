import Joi from 'joi';
import { STEEPNESS_OPTIONS } from '../configs/constants';

const areaSchema = Joi.object({
  name: Joi.string().required(),
  steepnessTags: Joi.array().items(Joi.string().valid(...STEEPNESS_OPTIONS)).optional()
}).unknown(true);

export default areaSchema;