import express from "express";
import apiAuthMiddleware from "../auth/apiAuthMiddleware.mjs";
import researcherController from "../controller/researcher.controller.mjs";
const r_router = express.Router();

// Apply the API key authentication middleware to the routes that require authentication
r_router.use(apiAuthMiddleware);

// Define your protected routes
r_router.post("/getdiaries/", researcherController.getdiaries);
r_router.get("/getdiariesbyid/", researcherController.getdiariesbyid);
r_router.post("/updateDiaryById/", researcherController.updateDiaryById);
r_router.post("/deleteDiaryById/", researcherController.deleteDiaryById);
r_router.get("/getbyid/:question_id", researcherController.getById);
r_router.post("/createStudy/", researcherController.createStudy);
r_router.post("/updateStudy/", researcherController.updateStudy);
r_router.post("/deleteStudy/", researcherController.deleteStudy);
r_router.get("/getStudies/", researcherController.getStudies);
r_router.post("/createDiary/", researcherController.createDiary);
r_router.post(
  "/selectQuestionsBydiary/",
  researcherController.selectQuestionsBydiary
);
r_router.post(
  "/AllQuestionsBydiary/",
  researcherController.AllQuestionsBydiary
);
r_router.post(
  "/createQuestionShared/",
  researcherController.createQuestionShared
);
r_router.post(
  "/deleteQuestionShared/",
  researcherController.deleteQuestionShared
);
r_router.post("/createUser/", researcherController.createUser);
r_router.post("/deleteUser/", researcherController.deleteUser);
r_router.get("/getUsers/", researcherController.getUsers);
r_router.get("/getUsersById/", researcherController.getUsersById);
r_router.post("/createResearcher/", researcherController.createResearcher);
r_router.post(
  "/getExperimentVariable/",
  researcherController.getExperimentVariable
);
r_router.post(
  "/createExperimentWithLoginCode/",
  researcherController.createExperimentWithLoginCode
);
r_router.get("/getExperiments/", researcherController.getExperiments);
r_router.post("/updateExperiment/", researcherController.updateExperiment);
r_router.post("/deleteExperiment/", researcherController.deleteExperiment);
r_router.post(
  "/swapQuestionNumbers/",
  researcherController.swapQuestionNumbers
);
r_router.post(
  "/createOnBoardingQuestion/",
  researcherController.createOnBoardingQuestion
);
r_router.post(
  "/updateOnBoardingQuestion/",
  researcherController.updateOnBoardingQuestion
);
r_router.post(
  "/deleteOnBoardingQuestion/",
  researcherController.deleteOnBoardingQuestion
);
r_router.post(
  "/swapOnBoardingQuestionNumbers/",
  researcherController.swapOnBoardingQuestionNumbers
);
r_router.post(
  "/getOnBoardingQuestionByExpId/",
  researcherController.getOnBoardingQuestionByExpId
);
r_router.post(
  "/createParticipantVariableQuestions/",
  researcherController.createParticipantVariableQuestions
);
r_router.post(
  "/checkOnBoardingStats/",
  researcherController.checkOnBoardingStats
);
r_router.post(
  "/updateDiaryQuestions/",
  researcherController.updateDiaryQuestions
);
r_router.post(
  "/createStudyNotification/",
  researcherController.createStudyNotification
);
r_router.post(
  "/deleteStudyNotification/",
  researcherController.deleteStudyNotification
);
r_router.post(
  "/getStudyNotification/",
  researcherController.getStudyNotification
);
r_router.post(
  "/createDiaryNotification/",
  researcherController.createDiaryNotification
);
r_router.post(
  "/deleteDiaryNotification/",
  researcherController.deleteDiaryNotification
);
r_router.post(
  "/getDiaryNotification/",
  researcherController.getDiaryNotification
);
r_router.post(
  "/updateDiaryNotification/",
  researcherController.updateDiaryNotification
);
r_router.post(
  "/createParticipantVariableQuestions/",
  researcherController.createParticipantVariableQuestions
);
r_router.post(
  "/sendMessegetoParticipant/",
  researcherController.sendMessegetoParticipant
);

export default r_router;
