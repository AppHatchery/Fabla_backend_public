//import connection from "../database/index.mjs";
import { getValidatedConnection } from "../database/index.mjs";
import processDiaries2 from "../helper/processDiaries.mjs";
import getData from "../helper/secrets.mjs";
import {
  getUserProtocolQuery,
  getolduserprotocolquery,
  verifyuserquery,
  updateuserextraquery,
  getuserinfoquery,
} from "../helper/queries.mjs";

const usersController = {
  getolduserprotocol: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { studycode } = req.body;

      const [results] = await connection.execute(getolduserprotocolquery, [
        studycode,
      ]);

      // Parse the JSON string before sending it in the response
      const parsedResults = results.map((row) => ({
        ...row,
        json_data: JSON.parse(row.json_data),
      }));

      res.status(200).json({ status: "success", data: parsedResults });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },

  //To retrieve study information when onboarding in app
  getExperimentByCode: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { login_code } = req.body;
      console.log(login_code);
      // Fetch experiment details
      const [experimentResults] = await connection.execute(
        `SELECT * FROM experiment WHERE researcher_logincode = ?;`,
        [login_code]
      );

      if (experimentResults.length === 0) {
        return res
          .status(400)
          .json({ status: "error", message: "Study entry not found" });
      }

      const experiment = experimentResults[0];

      // Fetch onboarding questions
      const [questionsResults] = await connection.execute(
        `SELECT * FROM experiment_onboarding_questions WHERE experiment_id = ? ORDER by question_number;`,
        [experiment.experiment_id]
      );

      console.log(questionsResults);

      // Format the response
      const onboardingQuestions = questionsResults.map((question) => ({
        id: question.onboarding_question_id,
        type: question.type_,
        title: question.title,
        subtitle: question.subtitle,
        required: Boolean(question.required),
        variable: question.variable,
        max_value: question.max_value,
        min_value: question.min_value,
        max_label: question.max_label,
        min_label: question.min_label,
        default_value: question.default_value,
        options: JSON.parse(question.option_text),
      }));

      res.status(200).json({
        status: "success",
        data: {
          id: experiment.experiment_id,
          login_code: experiment.researcher_logincode,
          name: experiment.experiment_name,
          organisation: experiment.experiment_organisation,
          researcher: experiment.experiment_researcher,
          description: experiment.experiment_study_info,
          duration: experiment.experiment_date_range,
          onboarding_questions: onboardingQuestions, // Include the onboarding questions here
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },

  getUserProtocol: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { login_code, participant_id } = req.body;

      // Fetch user info
      const [users] = await connection.execute(getuserinfoquery, [
        participant_id,
        login_code,
      ]);
      const user = users[0];

      // Fetch user protocol
      const [rows] = await connection.execute(getUserProtocolQuery, [
        login_code,
      ]);

      if (!rows.length) {
        return res
          .status(400)
          .json({ status: "error", message: "Experiment not found" });
      }

      const parsedResult = JSON.parse(rows[0].protocol);

      // Process diaries based on the presence of "Work_days" and "Knock_off_time"
      const studies = processDiaries2(user, parsedResult);

      res.status(200).json({ status: "success", data: studies });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "error",
        message: "An internal server error occurred",
        details: error.message,
      });
    } finally {
      connection.release();
    }
  },

  verifyuser: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      let { participant_id, login_code } = req.body;

      // Check if studycode is provided and is a number
      if (!participant_id || !login_code || isNaN(participant_id)) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid studycode" });
      }

      // Convert studycode to an integer base 10
      participant_id = parseInt(participant_id, 10);

      const [rows] = await connection.execute(verifyuserquery, [
        participant_id,
        login_code,
      ]);
      console.log(rows);
      const exists = rows[0].result === 0 ? false : true;
      var data;
      if (exists) {
        getData()
          .then((value) => {
            data = value;
            return res.status(200).json({
              status: "success",
              data,
            });
          })
          .catch((error) => {
            console.error(error);
            return res.status(500).json({
              status: "error",
              message: "Failed to get data",
            });
          });
      } else {
        data = {
          exists: false,
        };
        return res.status(200).json({
          status: "success",
          data,
        });
      }
    } catch (error) {
      //throw error;
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },

  //Update Study Specific Extras for Participants
  updateUserExtra: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { participant_id, login_code, extras, token, service } = req.body;

      if (!participant_id || !login_code) {
        return res
          .status(400)
          .json({ status: "error", message: "All fields are required" });
      }

      const [results] = await connection.execute(updateuserextraquery, [
        extras,
        token,
        service,
        participant_id,
        login_code,
      ]);

      res.status(200).json({
        status: "success",
        data: { affectedRows: results.affectedRows },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", message: error.message });
    } finally {
      connection.release();
    }
  },
};

export default usersController;
