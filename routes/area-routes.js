import express from "express";
import * as areaController from "../controllers/areaController.js";
import authenticateUser from "../middlewares/authenticateUser.js";

const router = express.Router();

router
  .route("/")
  .get(authenticateUser, areaController.getAllAreas);

router
  .route("/:id")
  .get(authenticateUser, areaController.getAreaById)
  .put(authenticateUser, areaController.updateArea);

export default router;
