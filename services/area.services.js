import Route from "../models/route.model";
import Area from "../models/area.model";

//TODO: Error checking
export const getMaximumSentAscentGradeByArea = async (areaId) => {
  try {
    const routesInArea = await Route.find({ areaId }).exec();
    const sentRoutes = routesInArea
      .filter((route) => route.isSent)
      .sort((a, b) => b.grade - a.grade);
    
    return sentRoutes[0].grade;

  } catch (error) {
    // console.error('Error fetching maximum sent ascent grade by area:', error);
    throw error;
  }
};

export const getAllAreas = async () => {
  try {
    const areas = await Area.find().exec();
    return areas;
  } catch (error) {
    throw error;
  }
}