import mongoose from 'mongoose';
import { STEEPNESS_OPTIONS } from '../configs/constants';

const areaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  steepnessTags: { 
		type: [String], 
		enum: STEEPNESS_OPTIONS, 
		required: false,
		default: []
	}
});

const Area = mongoose.model('Area', areaSchema);
export default Area;