import mongoose from "mongoose";
import Ascent from "../models/ascent.model.js";
import Route from "../models/route.model.js";
import Area from "../models/area.model.js";
//FIXME - Change imports to just the Services
import RouteServices from "./route.services.js";
import {
  getFirstAscentDate,
  getLastAscentDate,
  getMaximumAscentGradeByTickType,
} from "./user.services";
import { getWeekStartDate, getWeekEndDate } from "./utils.services";
import { ASCENT_TICK_TYPES } from "../../configs/constants.js";

export const deleteWithDependents = async (ascentId) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // Fetch the ascent document
    const ascent = await Ascent.findById(ascentId).session(session);
    if (!ascent) {
      throw new Error("Ascent not found");
    }

    // Fetch the route document to get the areaId
    const route = await Route.findById(ascent.routeId).session(session);
    if (!route) {
      throw new Error("Route not found");
    }

    // Fetch the area document
    const area = await Area.findById(route.areaId).session(session);
    if (!area) {
      throw new Error("Area not found");
    }

    // Delete the ascent
    await Ascent.findByIdAndDelete(ascentId).session(session);

    // Delete the route if it is the only ascent left
    const routeAscentsCount = await Ascent.countDocuments({
      routeId: route._id,
    }).session(session);
    if (routeAscentsCount === 0) {
      await Route.findByIdAndDelete(route._id).session(session);
    }

    // Delete the area if it is the only route left
    const areaRoutesCount = await Route.countDocuments({
      areaId: area._id,
    }).session(session);
    if (areaRoutesCount === 0) {
      await Area.findByIdAndDelete(area._id).session(session);
    }

    await session.commitTransaction();
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error("Error deleting ascent with dependents:", error);
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

//TODO - CHange to object from array
export const getWeeklyTickTypeCounts = async (userId) => {
  try {
    const firstAscentDate = await getFirstAscentDate(userId);
    const lastAscentDate = await getLastAscentDate(userId);

    if (!firstAscentDate || !lastAscentDate) {
      return [];
    }

    const firstWeekStartDate = getWeekStartDate(firstAscentDate);
    const lastWeekEndDate = getWeekEndDate(lastAscentDate);

    const tickTypeCounts = [];

    // Loop over weeks from the first ascent date to the last
    for (
      let weekStartDate = new Date(firstWeekStartDate);
      weekStartDate <= lastWeekEndDate;
      weekStartDate.setDate(weekStartDate.getDate() + 7)
    ) {
      const weekEndDate = getWeekEndDate(weekStartDate);

      // Batch query for all tick types in the current week
      const countsByTickType = await Promise.all(
        ASCENT_TICK_TYPES.map(async (tickType) => {
          const count = await Ascent.countDocuments({
            userId,
            date: { $gte: weekStartDate, $lte: weekEndDate },
            tickType,
          });
          return { tickType, count };
        })
      );

      // Summing the counts and creating the result object
      const total = countsByTickType.reduce((acc, { count }) => acc + count, 0);
      const counts = {
        weekStartDate: new Date(weekStartDate), // Creating new date objects to avoid mutation issues
        weekEndDate: new Date(weekEndDate),
        total,
      };

      // Add each tickType count to the counts object
      countsByTickType.forEach(({ tickType, count }) => {
        counts[tickType] = count;
      });

      tickTypeCounts.push(counts);
    }

    return tickTypeCounts;
  } catch (error) {
    throw error;
  }
};

export const getBestAscentsByTickType = async (userId, tickType) => {
  try {
    const maximumAscentGrade = getMaximumAscentGradeByTickType(
      userId,
      tickType
    );
    const routesAtMaximumAscentGrade = await Route.find({
      grade: maximumAscentGrade,
    }).exec();
    const routeIdsAtMaximumAscentGrade = routesAtMaximumAscentGrade.map(
      (route) => route._id
    );

    const earliestSentAscents = routeIdsAtMaximumAscentGrade
      .map(async (routeId) => {
        const earliestSentAscent = await RouteServices.getEarliestSentAscent(
          routeId
        );

        if (earliestSentAscent.tickType === tickType) {
          return earliestSentAscent;
        } else {
          return null;
        }
      })
      .filter((ascent) => ascent !== null);

    return earliestSentAscents;
  } catch (error) {
    // console.error('Error fetching best route by tick type:', error);
    throw error;
  }
};
