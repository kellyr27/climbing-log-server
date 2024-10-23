
/**
 * Get the start date of the week (Sunday) for the given date
 * @param {Date} date - The date to get the week start date for
 * @returns {Date} - The start date of the week
 */
export const getWeekStartDate = (date) => {
  const day = date.getDay();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
};

/**
 * Get the end date of the week (Saturday) for the given date
 * @param {Date} date - The date to get the week end date for
 * @returns {Date} - The end date of the week
 */
export const getWeekEndDate = (date) => {
  const day = date.getDay();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (6 - day));
};


const MAX_SESSIONS_TO_SEND = 10;
const MIN_NUMBER_OF_NON_NULL_ROUTE_SESSIONS = 3;
/**
 * Calculate the Ondra score for the given route sessions
 * @param {Array} sessionsToSend - The array of route sessions to calculate the Ondra score for
 * @returns {Number} - The Ondra score for the given route sessions
 */
export const getOndraScore = (sessionsToSend) => {
  const countNonNullSessions = sessionsToSend.filter((sessions) => sessions !== null).length;
  if (countNonNullSessions < MIN_NUMBER_OF_NON_NULL_ROUTE_SESSIONS) {
    return null;
  }

  const ondraScore = sessionsToSend.reduce((total, sessions) => {
    if (sessions === null) {
      return total + MAX_SESSIONS_TO_SEND;
    } else {
      return total + Math.min(sessions, MAX_SESSIONS_TO_SEND);
    }
  }, 0);

  return ondraScore;

}