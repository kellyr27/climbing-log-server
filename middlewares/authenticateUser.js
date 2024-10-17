import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const authenticateUser = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      const error = new Error("Authentication failed");
      error.status = 401;
      throw error;
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    req.user = await User.findById(decoded._id);

    if (!req.user) {
      const error = new Error("Authentication failed");
      error.status = 401;
      throw error;
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      error.status = 401;
      next(error);
    } else {
      next(error);
    }
  }
};

export default authenticateUser;
