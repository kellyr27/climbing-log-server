import Ascent from '../models/ascent.model.js';

/**
 * Gets the date of the first ascent for a user.
 * @param {ObjectId} userId - The ID of the user.
 * @returns {Promise<Date|null>} - The date of the first ascent or null if not found.
 */
export const getFirstAscentDate = async (userId) => {
  try {
    const firstAscent = await Ascent.findOne({ userId }).sort({ date: 1 }).exec();
    return firstAscent ? firstAscent.date : null;
  } catch (error) {
    // console.error('Error fetching first ascent date:', error);
    throw error;
  }
};

/**
 * Gets the date of the last ascent for a user.
 * @param {ObjectId} userId - The ID of the user.
 * @returns {Promise<Date|null>} - The date of the last ascent or null if not found.
 */
export const getLastAscentDate = async (userId) => {
  try {
    const lastAscent = await Ascent.findOne({ userId }).sort({ date: -1 }).exec();
    return lastAscent ? lastAscent.date : null;
  } catch (error) {
    // console.error('Error fetching last ascent date:', error);
    throw error;
  }
};

/**
 * Gets the createdAt timestamp of the last ascent for a user.
 * @param {ObjectId} userId - The ID of the user.
 * @returns {Promise<Date|null>} - The createdAt timestamp of the last ascent or null if not found.
 */
const getLastAscentCreatedAt = async (userId) => {
  try {
    const lastAscent = await Ascent.findOne({ userId }).sort({ createdAt: -1 }).exec();
    return lastAscent ? lastAscent.createdAt : null;
  } catch (error) {
    // console.error('Error fetching last ascent created at:', error);
    throw error;
  }
};

/**
 * Gets the date of the last ascent created within the last 12 hours or the current date.
 * @param {ObjectId} userId - The ID of the user.
 * @returns {Promise<Date>} - The date of the last ascent created within the last 12 hours or the current date.
 */
export const getPrefillCreateAscentDate = async (userId) => {
  try {
    const lastAscentCreatedAt = await getLastAscentCreatedAt(userId);

    // If the last ascent was created within the last 12 hours, use the last Ascent Date
    // Otherwise, use the current date
    const lastAscentCreatedAtDate = new Date(lastAscentCreatedAt);
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    if (lastAscentCreatedAtDate > twelveHoursAgo) {
      return lastAscentCreatedAtDate
    } else {
      return new Date();
    }

  } catch (error) {
    // console.error('Error fetching prefill create ascent date:', error);
    throw error;
  }
}

/**
 * Gets the minimum ascent grade for a user.
 * @param {ObjectId} userId - The ID of the user.
 * @returns {Promise<string|null>} - The minimum ascent grade or null if not found.
 */
export const getMinimumAscentGrade = async (userId) => {
  try {
    const minAscent = await Ascent.findOne({ userId }).sort({ grade: 1 }).exec();
    return minAscent ? minAscent.grade : null;
  } catch (error) {
    // console.error('Error fetching minimum ascent grade:', error);
    throw error;
  }
}

/**
 * Gets the maximum ascent grade for a user.
 * @param {ObjectId} userId - The ID of the user.
 * @returns {Promise<string|null>} - The maximum ascent grade or null if not found.
 */
export const getMaximumAscentGrade = async (userId) => {
  try {
    const maxAscent = await Ascent.findOne({ userId }).sort({ grade: -1 }).exec();
    return maxAscent ? maxAscent.grade : null;
  } catch (error) {
    // console.error('Error fetching maximum ascent grade:', error);
    throw error;
  }
}

export const getMaximumAscentGradeByTickType = async (userId, tickType) => {
  try {
    const maxSentAscent = await Ascent.findOne({ userId, tickType }).sort({ grade: -1 }).exec();
    return maxSentAscent ? maxSentAscent.grade : null;
  } catch (error) {
    // console.error('Error fetching maximum sent ascent grade:', error);
    throw error;
  }
}

export const getMaximumSentAscentGradeByArea = async (userId, areaId) => {
  try {
    const routesInArea = await Route.find({ areaId }).exec();
    const routeIdsInArea = routesInArea.map(route => route._id);

    const maxSentAscent = await Ascent.findOne({ routeId: { $in: routeIdsInArea }, tickType: { $in: ['flash', 'redpoint'] }}).sort({ grade: -1 }).exec();
    return maxSentAscent ? maxSentAscent.grade : null;

  } catch (error) {
    // console.error('Error fetching maximum sent ascent grade by area:', error);
    throw error;
  }
}