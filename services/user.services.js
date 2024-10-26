import Route from '../models/route.model';

/**
 * Gets the date of the first ascent for a user.
 * @param {ObjectId} userId - The ID of the user.
 * @returns {Promise<Date|null>} - The date of the first ascent or null if not found.
 */
export const getFirstAscentDate = async (userId) => {
  try {
    const firstAscentDate = await Route.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },    // Filter only routes that belong to the user
      { $unwind: "$ascents" },                                    // Deconstruct the ascents array
      { $sort: { "ascents.date": 1 } },                           // Sort by date in ascending order
      { $limit: 1 },                                              // Limit the result to the first document
      {
        $project: {
          _id: 0,                                                 // Exclude the _id field
          date: "$ascents.date",                                  // Include only the date field of the earliest ascent
        },
      },
    ])    
    return firstAscentDate.length > 0 ? firstAscentDate[0].date : null;
  } catch (error) {
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
    const lastAscentDate = await Route.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },    // Filter only routes that belong to the user
      { $unwind: "$ascents" },                                    // Deconstruct the ascents array
      { $sort: { "ascents.date": -1 } },                          // Sort by date in descending order
      { $limit: 1 },                                              // Limit the result to the first document
      {
        $project: {
          _id: 0,                                                 // Exclude the _id field
          date: "$ascents.date",                                  // Include only the date field of the latest ascent
        },
      },
    ])
    return lastAscentDate.length > 0 ? lastAscentDate[0].date : null;
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
    const lastAscentCreatedAt = await Route.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },    // Filter only routes that belong to the user
      { $unwind: "$ascents" },                                    // Deconstruct the ascents array
      { $sort: { "ascents.createdAt": -1 } },                     // Sort by createdAt in descending order
      { $limit: 1 },                                              // Limit the result to the first document
      {
        $project: {
          _id: 0,                                                 // Exclude the _id field
          createdAt: "$ascents.createdAt",                        // Include only the createdAt field of the latest ascent
        },
      },
    ])
    return lastAscentCreatedAt.length > 0 ? lastAscentCreatedAt[0].createdAt : null
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
    const minAscent = await Route.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },  // Filter only routes that belong to the user
      { $unwind: "$ascents" },                                  // Deconstruct the ascents array to evaluate each ascent separately
      { 
        $group: { 
          _id: null,                                            // Group all matching documents
          minGrade: { $max: "$grade" }                          // Get the lowest grade
        } 
      },
      { 
        $project: { 
          _id: 0,                                               // Exclude the _id field
          lowestAscentGrade: "$minGrade"                        // Rename field for readability
        } 
      }
    ])

    return minAscent.length > 0 ? minAscent[0].lowestAscentGrade : null;
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
    const maxAscent = await Route.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },  // Filter only routes that belong to the user
      { $unwind: "$ascents" },                                  // Deconstruct the ascents array to evaluate each ascent separately
      { 
        $group: { 
          _id: null,                                            // Group all matching documents
          maxGrade: { $max: "$grade" }                          // Get the highest grade
        } 
      },
      { 
        $project: { 
          _id: 0,                                               // Exclude the _id field
          highestAscentGrade: "$maxGrade"                       // Rename field for readability
        } 
      }
    ])

    return maxAscent.length > 0 ? maxAscent[0].highestAscentGrade : null;
  } catch (error) {
    throw error;
  }
}

// export const getMaximumAscentGradeByTickType = async (userId, tickType) => {
//   try {
//     const maxSentAscent = await Ascent.findOne({ userId, tickType }).sort({ grade: -1 }).exec();
//     return maxSentAscent ? maxSentAscent.grade : null;
//   } catch (error) {
//     // console.error('Error fetching maximum sent ascent grade:', error);
//     throw error;
//   }
// }