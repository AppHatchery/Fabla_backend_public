import express from "express";
import apiAuthMiddleware from "../auth/apiAuthMiddleware.mjs";
import usersController from "../controller/protocol.controller.mjs";

const router = express.Router();

// Apply the API key authentication middleware to the routes that require authentication
router.use(apiAuthMiddleware);

// Define your protected routes
router.post("/getuserprotocol/", usersController.getUserProtocol);
router.post("/getolduserprotocol/", usersController.getolduserprotocol);
router.post("/verifyuser/", usersController.verifyuser);
router.post("/getStudyInfo/", usersController.getExperimentByCode);
router.post("/updateuserextras", usersController.updateUserExtra);

export default router;
