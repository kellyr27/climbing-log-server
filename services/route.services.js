import mongoose from "mongoose";
import Area from "../models/area.model.js";
import Route from "../models/route.model.js";
import AscentServices from "./ascent.services.js";
import UtilsServices from "./utils.services.js";
import { ALL_ASCENT_TICK_TYPES } from '../../configs/constants.js';

export const deleteWithDependents = async (routeId) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

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

      for (const tickType of ALL_ASCENT_TICK_TYPES) {
        gradeStats[i][tickType] = 0;
      }
    }

    // For each route, get the highest tick type for the user and store a count for each grade
    for (const route of routes) {
      const highestTickType = route.highestTickType;
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