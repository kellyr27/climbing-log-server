import express from "express";
import * as routeController from "../controllers/routeController.js";
import authenticateUser from "../middlewares/authenticateUser.js";

const router = express.Router();

router.route("/").get(authenticate, routeController.getAllRoutes);

router
  .route("/:id")
  .get(routeController.getRouteById)
  .put(authenticateUser, routeController.updateRoute);

router
  .route("/:id/ascents")
  .get(routeController.getAscentsByRouteId);

//TODO: Add GET route colours

export default router;
