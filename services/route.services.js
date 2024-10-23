import mongoose from "mongoose";
import Ascent from "../models/ascent.model.js";
import Area from "../models/area.model.js";
import Route from "../models/route.model.js";
import AscentServices from "./ascent.services.js";
import UtilsServices from "./utils.services.js";
import { ASCENT_TICK_TYPES } from '../../configs/constants.js';


/**
 * Checks if a route has been flashed.
 * @param {ObjectId} routeId - The ID of the route.
 * @returns {Promise<boolean>} - True if the route has been flashed, false otherwise.
 */
export const isFlashed = async (routeId) => {
  try {
    const ascent = await Ascent.findOne({
      routeId,
      tickType: "flash",
    }).exec();
    return !!ascent;
  } catch (error) {
    // console.error('Error checking if route is flashed:', error);
    throw error;
  }
};

/**
 * Checks if a route has been sent.
 * @param {ObjectId} routeId - The ID of the route.
 * @returns {Promise<boolean>} - True if the route has been sent, false otherwise.
 */
export const isSent = async (routeId) => {
  try {
    const ascent = await Ascent.findOne({
      routeId,
      tickType: { $in: ["flash", "redpoint"] },
    }).exec();
    return !!ascent;
  } catch (error) {
    // console.error('Error checking if route is sent:', error);
    throw error;
  }
};

export const getHighestTickType = async (routeId) => {
  try {
    const ascent = await Ascent.findOne({ routeId }).sort({ tickTypeOrder: -1 }).exec();
    return ascent ? ascent.tickType : null;
  } catch (error) {
    // console.error('Error fetching highest tick type:', error);
    throw error;
  }
}

/**
 * Gets the earliest sent ascent for a route.
 * @param {ObjectId} routeId - The ID of the route.
 * @returns {Promise<Ascent|null>} - The earliest sent ascent or null if not found.
 */
export const getEarliestSentAscent = async (routeId) => {
  try {
    const ascent = await Ascent.findOne({ routeId, tickType: { $in: ['flash', 'redpoint'] } })
      .sort({ date: 1, createdAt: 1 })
      .exec();
    return ascent ? ascent : null;
  } catch (error) {
    // console.error('Error fetching earliest sent ascent:', error);
    throw error;
  }
}

export const sessionsToSend = async (routeId) => {
  try {
    if (await isFlashed(routeId)) return 0;

    const earliestSentAscent = await Ascent.findOne({ 
      routeId, 
      tickType: 'redpoint' 
    }).sort({ date: 1 }).exec();

    if (!earliestSentAscent) return null;

    const dates = await Ascent.find({ 
      routeId, 
      date: { $lt: earliestSentAscent.date } 
    }).distinct('date').exec();

    return dates.length;
  } catch (error) {
    // console.error('Error calculating sessions to send:', error);
    throw error;
  }
};

/**
 * Gets the date of the first ascent for a route.
 * @param {ObjectId} routeId - The ID of the route.
 * @returns {Promise<Date|null>} - The date of the first ascent or null if not found.
 */
export const firstAscentDate = async (routeId) => {
  try {
    const ascent = await Ascent.findOne({ routeId }).sort({ date: 1 }).exec();
    return ascent ? ascent.date : null;
  } catch (error) {
    // console.error('Error fetching first ascent date:', error);
    throw error;
  }
};

/**
 * Gets the date of the last ascent for a route.
 * @param {ObjectId} routeId - The ID of the route.
 * @returns {Promise<Date|null>} - The date of the last ascent or null if not found.
 */
export const lastAscentDate = async (routeId) => {
  try {
    const ascent = await Ascent.findOne({ routeId }).sort({ date: -1 }).exec();
    return ascent ? ascent.date : null;
  } catch (error) {
    // console.error('Error fetching last ascent date:', error);
    throw error;
  }
};

export const deleteWithDependents = async (routeId) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // Delete all ascents of the route
    await Ascent.deleteMany({ routeId }).session(session);
    
    // Delete the route
    const route = await Route.findById(routeId).session(session);
    if (!route) {
      throw new Error('Route not found');
    }
    const areaId = route.areaId;
    await Route.findByIdAndDelete(routeId).session(session);
    
    // Delete the route's Area if it has no routes
    const routeCount = await Route.countDocuments({ areaId }).session(session);
    if (routeCount === 0) {
      await Area.findByIdAndDelete(areaId).session(session);
    }
    
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error('Error deleting route with dependents:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

export const getGradeBestTickTypeCounts = async (userId) => {
  try {
    const routes = await Route.find({}).exec();
    const minGrade = AscentServices.getMinimumAscentGrade(userId);
    const maxGrade = AscentServices.getMaximumAscentGrade(userId);

    const gradeStats = {};

    for (let i = minGrade; i <= maxGrade; i++) {
      gradeStats[i] = {
        grade: i,
        total: 0,
      };

      for (const tickType of ASCENT_TICK_TYPES) {
        gradeStats[i][tickType] = 0;
      }
    }

    // For each route, get the highest tick type for the user and store a count for each grade
    for (const route of routes) {
      const highestTickType = await getHighestTickType(route._id);
      if (highestTickType) {
        gradeStats[route.grade][highestTickType]++;
        gradeStats[route.grade].total++;
      }
    }
    
    return gradeStats;
  } catch (error) {
    // console.error('Error fetching weekly grade stats:', error);
    throw error;
  }
}

// TODO: Move to stats services
export const getGradeOndraScores = async (userId) => {
  try {
    const routes = await Route.find({}).exec();
    const minGrade = AscentServices.getMinimumAscentGrade(userId);
    const maxGrade = AscentServices.getMaximumAscentGrade(userId);

    const gradeStats = {};

    for (let i = minGrade; i <= maxGrade; i++) {
      gradeStats[i] = {
        grade: i,
        sessionsToSend: [],
      };
    }

    // For each route, get the number of sessions to send for the user and store it for each grade
    for (const route of routes) {
      const sessionsToSend = await sessionsToSend(route._id);
      gradeStats[route.grade].sessionsToSend.push(sessionsToSend);
    }

    for (const grade in gradeStats) {
      gradeStats[grade].ondraScore = UtilsServices.getOndraScore(gradeStats[grade].sessionsToSend);
    }
    
    return gradeStats;
  } catch (error) {
    // console.error('Error fetching weekly grade stats:', error);
    throw error;
  }
}