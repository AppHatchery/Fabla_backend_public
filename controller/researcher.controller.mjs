//import connection from "../database/index.mjs";
import { getValidatedConnection } from "../database/index.mjs";
import { PinpointClient, SendMessagesCommand } from '@aws-sdk/client-pinpoint';

const researcherController = {
  getdiaries: async (req, res) => {
    const connection = await getValidatedConnection();
    const { experiment_id } = req.body;

    if (!experiment_id) {
      return res
        .status(400)
        .json({ status: "error", message: "Experiment ID not provided" });
    }

    try {
      const [results, fields] = await connection.execute(
        `SELECT 
              d.diary_id,
              d.diary_name,
              d.start_time,
              d.end_time,
              d.entries,
              d.active_days,
              d.frequency,
              s.study_id,
              s.study_name,
              s.daily_goal,
              s.weekly_goal,
              s.start_date,
              s.end_date
          FROM 
              diaries d
          JOIN 
              study s ON d.study_id = s.study_id
          WHERE 
              s.experiment_id = ?;
          `,
        [experiment_id]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  getdiariesbyid: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { diaryid } = req.body;

      if (!diaryid) {
        return res
          .status(400)
          .json({ status: "error", message: "Diary ID not provided" });
      }

      const [results, fields] = await connection.execute(
        `SELECT * FROM diaries where diary_id = ?;`,
        [diaryid]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  updateDiaryById: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const {
        diary_name,
        study_id,
        start_time,
        end_time,
        entries,
        active_days,
        frequency,
        diaryid,
      } = req.body;

      if (
        !diary_name ||
        !study_id ||
        !start_time ||
        !end_time ||
        !entries ||
        !active_days ||
        !frequency ||
        !diaryid
      ) {
        return res
          .status(400)
          .json({ status: "error", message: "All fields are required" });
      }

      const [results, fields] = await connection.execute(
        `UPDATE diaries 
                    SET diary_name = ?, study_id = ?, start_time = ?, end_time = ?, entries = ?, active_days = ?, frequency = ?
                 WHERE diary_id = ?;`,
        [
          diary_name,
          study_id,
          start_time,
          end_time,
          entries,
          active_days,
          frequency,
          diaryid,
        ]
      );

      if (results.affectedRows === 0) {
        return res
          .status(400)
          .json({ status: "error", message: "Diary entry not found" });
      }

      res.status(200).json({
        status: "success",
        message: "Diary entry updated successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  deleteDiaryById: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { diaryid } = req.body;

      if (!diaryid) {
        return res
          .status(400)
          .json({ status: "error", message: "Diary ID not provided" });
      }

      const [results, fields] = await connection.execute(
        `DELETE FROM diaries WHERE diary_id = ?;`,
        [diaryid]
      );

      if (results.affectedRows === 0) {
        return res
          .status(400)
          .json({ status: "error", message: "Diary entry not found" });
      }

      res.status(200).json({
        status: "success",
        message: "Diary entry deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  getById: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { studycode } = req.body;

      if (!studycode) {
        return res
          .status(400)
          .json({ status: "error", message: "Studycode not provided" });
      }

      const [results, fields] = await connection.execute(
        `SELECT
                    u.user_id,
                    u.studycode,
                    u.wake_up_time,
                    d.diary_id,
                    d.type_,
                    d.diary_name,
                    d.randomized_interval,
                    d.prompt_delivered,
                    d.prompt_available,
                    d.open_until,
                    q.question_id,
                    q.title AS question_title,
                    q.question_number,
                    q.type_,
                    q.subtitle,
                    q.type_,
                    q.max_value,
                    q.max_value,
                    q.default_value,
                    q.max_value,
                    uoq.is_disabled,
                    uoq.is_user_specific,
                    o.option_id,
                    o.option_text
                FROM
                    user u
                JOIN
                    user_on_question uoq ON u.user_id = uoq.user_id
                JOIN
                    questions q ON uoq.question_id = q.question_id
                JOIN
                    diaries d ON q.diary_id = d.diary_id
                LEFT JOIN
                    options o ON q.question_id = o.question_id
                WHERE
                    u.studycode = ?
                ORDER BY
                    d.diary_id,
                    q.question_number,
                    o.option_id;`,
        [studycode]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  createDiary: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const {
        diary_name,
        study_id,
        start_time,
        end_time,
        entries,
        active_days,
        frequency,
      } = req.body;

      if (
        !diary_name ||
        !study_id ||
        !start_time ||
        !end_time ||
        !entries ||
        !active_days ||
        !frequency
      ) {
        return res
          .status(400)
          .json({ status: "error", message: "All fields are required" });
      }

      const [results, fields] = await connection.execute(
        `INSERT INTO diaries (diary_name, study_id, start_time, end_time, entries, active_days, frequency) 
                  VALUES 
                (?, ?, ?, ?, ?, ?, ?);
                `,
        [
          diary_name,
          study_id,
          start_time,
          end_time,
          entries,
          active_days,
          frequency,
        ]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  createStudy: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const {
        experimentid,
        studyname,
        dailygoal,
        weeklygoal,
        start_date,
        end_date,
        from_day,
        to_day,
        diary_incentive,
        bonus_amount,
        bonus_threshold,
      } = req.body;

      if (
        !experimentid ||
        !studyname ||
        !dailygoal ||
        !weeklygoal ||
        !diary_incentive ||
        !bonus_amount ||
        !bonus_threshold
      ) {
        return res
          .status(400)
          .json({ status: "error", message: "All fields are required" });
      }

      const [results, fields] = await connection.execute(
        `INSERT INTO study (experiment_id,study_name, daily_goal, weekly_goal, start_date, end_date, from_day, to_day,diary_incentive,bonus_amount,bonus_threshold ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          experimentid,
          studyname,
          dailygoal,
          weeklygoal,
          start_date || null,
          end_date || null,
          from_day || null,
          to_day || null,
          diary_incentive,
          bonus_amount,
          bonus_threshold,
        ]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  updateStudy: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const {
        experimentid,
        studyname,
        dailygoal,
        weeklygoal,
        start_date,
        end_date,
        from_day,
        to_day,
        diary_incentive,
        bonus_amount,
        bonus_threshold,
        studyid,
      } = req.body;

      if (
        !experimentid ||
        !studyname ||
        !dailygoal ||
        !weeklygoal ||
        !diary_incentive ||
        !bonus_amount ||
        !bonus_threshold ||
        !studyid
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "All fields are required except start dat,end date, from and to day",
        });
      }

      const [results, fields] = await connection.execute(
        `UPDATE study
          SET 
            experiment_id = ?,
            study_name = ?,
            daily_goal = ?,
            weekly_goal = ?,
            start_date = ?,
            end_date = ?,
            from_day = ?,
            to_day = ?,
            diary_incentive = ?,
            bonus_amount = ?,
            bonus_threshold = ?
          WHERE study_id = ?;
        `,
        [
          experimentid,
          studyname,
          dailygoal,
          weeklygoal,
          start_date || null,
          end_date || null,
          from_day || null,
          to_day || null,
          diary_incentive,
          bonus_amount,
          bonus_threshold,
          studyid,
        ]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);

      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  deleteStudy: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { studyid } = req.body;

      if (!studyid) {
        return res
          .status(400)
          .json({ status: "error", message: "Study ID is required" });
      }

      const [results, fields] = await connection.execute(
        `DELETE FROM study
         WHERE study_id = ?;
        `,
        [studyid]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  getStudies: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const [results, fields] = await connection.execute(
        `SELECT * FROM study`,
        []
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  selectQuestionsBydiary: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { diaryid } = req.body;

      if (!diaryid) {
        return res
          .status(400)
          .json({ status: "error", message: "Diary ID is required" });
      }

      const [results, fields] = await connection.execute(
        `SELECT 
          q.question_id,
          q.diary_id,
          d.diary_name,
          q.type_,
          q.title,
          q.subtitle,
          q.required,
          q.max_value,
          q.min_value,
          q.default_value,
          q.question_number,
          q.is_shared,
          q.option_text
        FROM 
          questions q
        JOIN 
          diaries d ON q.diary_id = d.diary_id
        WHERE 
          d.diary_id = ?;  -- Replace 'your_diary_id' with the actual diary_id you are interested in`,
        [diaryid]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  AllQuestionsBydiary: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { experiment_id, diaryid } = req.body;

      if (!diaryid || !experiment_id) {
        return res.status(400).json({
          status: "error",
          message: "Diary and Experiment ID are required",
        });
      }

      const [results, fields] = await connection.execute(
        `SELECT 
              q.question_id, 
              q.type_, 
              q.title, 
              q.subtitle, 
              q.required, 
              q.max_value, 
              q.min_value, 
              q.default_value, 
              q.question_number, 
              q.is_shared, 
              q.option_text,
              q.max_label,
              q.min_label
          FROM 
              questions q
          JOIN 
              diaries d ON q.diary_id = d.diary_id
          JOIN 
              study s ON d.study_id = s.study_id
          JOIN 
              experiment e ON s.experiment_id = e.experiment_id
          WHERE 
              e.experiment_id = ? 
              AND d.diary_id = ?
          ORDER BY 
              CAST(q.question_number AS UNSIGNED);`,
        [experiment_id, diaryid]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  createQuestionShared: async (req, res) => {
    const connection = await getValidatedConnection();

    try {
      const {
        diary_id,
        type,
        title,
        subtitle,
        required,
        max_value,
        min_value,
        default_value,
        options,
        max_label,
        min_label,
      } = req.body;

      if (!diary_id || !type || !title || !subtitle || !required) {
        return res
          .status(400)
          .json({ status: "error", message: "All fields are required" });
      }

      const [results, fields] = await connection.execute(
        `CALL add_question_user_shared(
                    ?, -- p_diary_id
                    ?, -- p_type_
                    ?, -- p_title
                    ?, -- p_subtitle
                    ?, -- p_required
                    ?, -- p_max_value
                    ?, -- p_min_value
                    ?, -- p_default_value
                    ?, -- p_option_text
                    ?, -- p_max_label
                    ?  -- p_min_label
                );
                `,
        [
          diary_id,
          type,
          title,
          subtitle,
          required,
          max_value ?? null,
          min_value ?? null,
          default_value ?? null,
          options ?? null,
          max_label ?? null,
          min_label ?? null,
        ]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  deleteQuestionShared: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { questionId } = req.body;

      if (!questionId) {
        return res
          .status(400)
          .json({ status: "error", message: "Question ID is required" });
      }

      const [results] = await connection.execute(
        `DELETE FROM questions WHERE question_id = ?;`,
        [questionId]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  getUsers: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const [results] = await connection.execute(
        `SELECT * FROM user;`
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  getUsersById: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { studycode } = req.body;

      if (!studycode) {
        return res
          .status(400)
          .json({ status: "error", message: "Studycode is required" });
      }

      const [results] = await connection.execute(
        `SELECT * FROM user where studycode = ?;`,
        [studycode]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  createUser: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { studycode, experimentid } = req.body;
      if (!studycode || !experimentid) {
        return res.status(400).json({
          status: "error",
          message: "Studycode and Expeirment ID are required",
        });
      }

      const [results] = await connection.execute(
        `CALL insert_user_with_experiment(?,?);`,
        [studycode, experimentid]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error.sqlMessage);

      if (error.sqlMessage === "Studycode already exists for this experiment") {
        return res
          .status(400)
          .json({
            status: "error",
            message: "You cannot have the same participant ID in experiment",
          });
      }

      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  deleteUser: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { userid } = req.body;

      if (!userid) {
        return res
          .status(400)
          .json({ status: "error", message: "User ID is required" });
      }

      const [results] = await connection.execute(
        `DELETE FROM user WHERE user_id = ?;`,
        [userid]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  createResearcher: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { researcherName } = req.body;

      if (!researcherName) {
        return res
          .status(400)
          .json({ status: "error", message: "Provide Researcher name" });
      }

      const [results, fields] = await connection.execute(
        `INSERT INTO researcher (researcher_name) VALUES (?);`,
        [researcherName]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },

  getExperimentVariable: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { experimentid } = req.body;
      if (!experimentid) {
        return res
          .status(400)
          .json({ status: "error", message: "Experiment ID is required" });
      }

      const [results, fields] = await connection.execute(
        `SELECT experiment_variables FROM experiment where experiment_id = ?;`,
        [experimentid]
      );
      //check if the variable is set
      if (results.length > 0 && results[0].experiment_variables) {
        try {
          const experimentVariablesJson = JSON.parse(
            results[0].experiment_variables
          );
          res
            .status(200)
            .json({ status: "success", data: experimentVariablesJson });
        } catch (parseError) {
          // Handle JSON parsing errors
          console.error("JSON parsing error:", parseError);
          res
            .status(500)
            .json({ status: "error", message: "Failed to parse JSON data" });
        }
      } else {
        res.status(400).json({
          status: "error",
          message: "No variables set for this experiment",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  createExperimentWithLoginCode: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const {
        logincode,
        expname,
        exporganisation,
        researchers,
        studyinfo,
        daterange,
        teamid,
        has_rolling_dates,
        variable,
      } = req.body;
      if (
        !logincode ||
        !expname ||
        !exporganisation ||
        !researchers ||
        !studyinfo ||
        !daterange ||
        !teamid ||
        !has_rolling_dates ||
        !variable
      ) {
        return res
          .status(400)
          .json({ status: "error", message: "All fields are required" });
      }

      // Check for duplicate logincode
      const [existing] = await connection.execute(
        `SELECT COUNT(*) as count FROM experiment WHERE researcher_logincode = ?`,
        [logincode]
      );

      if (existing[0].count > 0) {
        return res
          .status(400) // Conflict status code
          .json({ status: "error", message: "Experiment code already exists" });
      }

      const [results, fields] = await connection.execute(
        `INSERT INTO experiment (
        researcher_logincode,
        experiment_name,
        experiment_organisation,
        experiment_researcher,
        experiment_study_info,
        experiment_date_range,
        team_id,
        has_rolling_dates,
        experiment_variables
      ) VALUES (?,?,?,?,?,?,?,?,?);`,
        [
          logincode,
          expname,
          exporganisation,
          researchers,
          studyinfo,
          daterange,
          teamid,
          has_rolling_dates,
          variable,
        ]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  getExperiments: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const {} = req.body;

      const [results, fields] = await connection.execute(
        `SELECT * FROM experiment;`,
        []
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  updateExperiment: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const {
        logincode,
        expname,
        exporganisation,
        researchers,
        studyinfo,
        daterange,
        teamid,
        has_rolling_dates,
        variable,
        experimentid,
      } = req.body;
      if (
        !logincode ||
        !expname ||
        !exporganisation ||
        !researchers ||
        !studyinfo ||
        !daterange ||
        !teamid ||
        !has_rolling_dates ||
        !experimentid ||
        !variable
      ) {
        return res
          .status(400)
          .json({ status: "error", message: "All fields are required" });
      }

      // Check if the experiment with the given logincode exists
      const [existing] = await connection.execute(
        `SELECT COUNT(*) as count FROM experiment WHERE researcher_logincode = ?`,
        [logincode]
      );

      if (existing[0].count === 0) {
        return res
          .status(404) // Not Found status code
          .json({
            status: "error",
            message:
              "Experiment does not match are you sure you are trying to update?",
          });
      }

      const [results, fields] = await connection.execute(
        `UPDATE experiment
          SET
              researcher_logincode = ?,
              experiment_name = ?,
              experiment_organisation = ?,
              experiment_researcher = ?,
              experiment_study_info = ?,
              experiment_date_range = ?,
              team_id = ?,
              has_rolling_dates = ?,
              experiment_variables = ?
          WHERE experiment_id = ?;
          `,
        [
          logincode,
          expname,
          exporganisation,
          researchers,
          studyinfo,
          daterange,
          teamid,
          has_rolling_dates,
          variable,
          experimentid,
        ]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  deleteExperiment: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { experimentid } = req.body;

      if (!experimentid) {
        return res
          .status(400)
          .json({ status: "error", message: "Experiment ID id required" });
      }

      const [results, fields] = await connection.execute(
        `DELETE FROM experiment WHERE experiment_id = ?;`,
        [experimentid]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  swapQuestionNumbers: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { questionid, direction } = req.body;

      if (!questionid || !direction) {
        return res.status(400).json({
          status: "error",
          message: "Question ID and Direction are required",
        });
      }

      const [results, fields] = await connection.execute(
        `CALL swap_question_order(?, ?);`,
        [questionid, direction]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  createOnBoardingQuestion: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const {
        experimentid,
        type,
        title,
        subtitle,
        max_value,
        min_value,
        default_value,
        options_text,
        variable,
        max_label,
        min_label,
      } = req.body;

      // Check for required fields
      if (!experimentid || !type || !title || !variable) {
        return res.status(400).json({
          status: "error",
          message: "At least 'Type', 'Title', and 'Variable' must be provided",
        });
      }

      // Check for duplicate variable under the same experiment
      const [variablecheck] = await connection.execute(
        `SELECT COUNT(*) AS duplicate_count
         FROM experiment_onboarding_questions
         WHERE experiment_id = ? AND variable = ?;`,
        [experimentid, variable]
      );

      if (variablecheck[0].duplicate_count > 0) {
        return res.status(400).json({
          status: "error",
          message:
            "This variable is already assigned to a question in this experiment",
        });
      }

      // Execute stored procedure to create the onboarding question
      const [results] = await connection.execute(
        `CALL create_onboarding_question(
            ?, -- experiment_id
            ?, -- type
            ?, -- title
            ?, -- subtitle
            ?, -- max_value
            ?, -- min_value
            ?, -- default_value
            ?, -- option_text
            ?, -- variable
            ?, -- max_label
            ?  -- min_label
        );`,
        [
          experimentid,
          type,
          title,
          subtitle || null,
          max_value || null,
          min_value || null,
          default_value || null,
          options_text || null,
          variable,
          max_label || null,
          min_label || null,
        ]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.error("Error in createOnBoardingQuestion:", error);
      res.status(500).json({
        status: "error",
        message: "An error occurred while creating the onboarding question.",
      });
    } finally {
      connection.release();
    }
  },
  updateOnBoardingQuestion: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const {
        type,
        title,
        subtitle,
        max_value,
        min_value,
        default_value,
        options_text,
        variable,
        max_label,
        min_label,
        questionid,
      } = req.body;

      if (!type || !title || !variable || !questionid) {
        return res.status(400).json({
          status: "error",
          message: "Atleast type, title, variable and question ID are required",
        });
      }

      const [results, fields] = await connection.execute(
        `UPDATE experiment_onboarding_questions
          SET type_ = ?,
              title = ?, 
              subtitle = ?,
              max_value = ?,
              min_value = ?,
              default_value = ?,
              option_text = ?,
              variable = ?,
              max_label = ?,
              min_label = ?
          WHERE onboarding_question_id = ?;`,
        [
          type,
          title,
          subtitle ?? null,
          max_value ?? null,
          min_value ?? null,
          default_value,
          options_text ?? null,
          variable,
          max_label ?? null,
          min_label ?? null,
          questionid,
        ]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  deleteOnBoardingQuestion: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { questionid } = req.body;

      if (!questionid) {
        return res
          .status(400)
          .json({ status: "error", message: "Question ID is required" });
      }

      const [results, fields] = await connection.execute(
        `DELETE FROM experiment_onboarding_questions WHERE onboarding_question_id = ?;`,
        [questionid]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  swapOnBoardingQuestionNumbers: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { questionid, direction } = req.body;

      if (!questionid || !direction) {
        return res.status(400).json({
          status: "error",
          message: "Question ID AND Direction are required",
        });
      }

      const [results, fields] = await connection.execute(
        `CALL swap_onboarding_question_order(?, ?);`,
        [questionid, direction]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  getOnBoardingQuestionByExpId: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { experimentid } = req.body;

      if (!experimentid) {
        return res
          .status(400)
          .json({ status: "error", message: "Experiment ID is required" });
      }

      const [results, fields] = await connection.execute(
        `SELECT * FROM experiment_onboarding_questions where experiment_id = ? order by question_number;`,
        [experimentid]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  checkOnBoardingStats: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { experimentid } = req.body;

      if (!experimentid) {
        return res
          .status(400)
          .json({ status: "error", message: "Experiment ID is required" });
      }

      const [results, fields] = await connection.execute(
        `CALL CheckExperimentVariableCoverage(?);`,
        [experimentid]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  updateDiaryQuestions: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const {
        diary_id,
        type,
        title,
        subtitle,
        required,
        max_value,
        min_value,
        default_value,
        options,
        max_label,
        min_label,
        question_id,
      } = req.body;

      if (!diary_id || !type || !title || !required || !question_id) {
        return res.status(400).json({
          status: "error",
          message:
            "Atleast Diary ID , type, Title, required and question ID are required",
        });
      }

      const [results, fields] = await connection.execute(
        `UPDATE questions
              SET diary_id = ?, 
                  type_ = ?,
                  title = ?,  
                  subtitle = ?,
                  required = ?,
                  max_value = ?,
                  min_value = ?,
                  default_value = ?,
                  option_text = ?,
                  max_label = ?,
                  min_label = ?
            WHERE question_id = ?;`,
        [
          diary_id,
          type,
          title,
          subtitle || null,
          required,
          max_value || null,
          min_value || null,
          default_value || null,
          options || "",
          max_label || null,
          min_label || null,
          question_id,
        ]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  createStudyNotification: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { studyid, title, subtitle, time, cancellable } = req.body;

      if (!studyid || !title || !subtitle || !time || !cancellable) {
        return res.status(400).json({
          status: "error",
          message:
            "Atleast studyid, title, subtitle, time and cancellable are required",
        });
      }

      const [results, fields] = await connection.execute(
        `INSERT INTO study_notifications 
        (study_id, title, subtitle, time, cancellable) 
          VALUES 
        (?, ?, ?, ?, ?)`,
        [studyid, title, subtitle, time, cancellable]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  deleteStudyNotification: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { notificationid } = req.body;

      if (!notificationid) {
        return res
          .status(400)
          .json({ status: "error", message: "Notification ID is required" });
      }

      const [results, fields] = await connection.execute(
        `DELETE FROM study_notifications
         WHERE notification_id = ?;`,
        [notificationid]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  getStudyNotification: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { experiment_id } = req.body;
      if (!experiment_id) {
        return res
          .status(400)
          .json({ status: "error", message: "Experiment ID is required" });
      }

      const [results, fields] = await connection.execute(
        `SELECT sn.notification_id, 
          sn.title, 
          sn.subtitle, 
          sn.time
        FROM study s
        JOIN study_notifications sn ON s.study_id = sn.study_id
        WHERE s.experiment_id = ?;`,
        [experiment_id]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  createDiaryNotification: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { diaryid, title, subtitle, time } = req.body;

      if (!diaryid || !title || !subtitle || !time) {
        return res.status(400).json({
          status: "error",
          message: "Diary ID , title, subtitle and time are required",
        });
      }

      const [results, fields] = await connection.execute(
        `INSERT INTO diary_notifications 
        (diary_id, title, subtitle, time) 
          VALUES 
        (?, ?, ?, ?)`,
        [diaryid, title, subtitle, time]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  deleteDiaryNotification: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { notificationid } = req.body;

      if (!notificationid) {
        return res
          .status(400)
          .json({ status: "error", message: "Notification ID is required" });
      }

      const [results, fields] = await connection.execute(
        `DELETE FROM diary_notifications
         WHERE notification_id = ?;`,
        [notificationid]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  getDiaryNotification: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { experiment_id } = req.body;
      if (!experiment_id) {
        return res
          .status(400)
          .json({ status: "error", message: "Experiment ID is required" });
      }

      const [results, fields] = await connection.execute(
        `SELECT dn.notification_id, 
              dn.title, 
              dn.subtitle, 
              dn.time, 
              dn.diary_id
        FROM study s
        JOIN diaries d ON s.study_id = d.study_id
        JOIN diary_notifications dn ON d.diary_id = dn.diary_id
        WHERE s.experiment_id = ?;
        `,
        [experiment_id]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  updateDiaryNotification: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { notification_id, diaryid, title, subtitle, time } = req.body;

      if (!notification_id || !diaryid || !title || !subtitle || !time) {
        return res.status(400).json({
          status: "error",
          message:
            "Notification ID ,dioary id, title, subtitle and time are required",
        });
      }

      const [results, fields] = await connection.execute(
        `UPDATE diary_notifications
          SET diary_id=?, title=?, subtitle=?, time=? WHERE notification_id=?;`,
        [diaryid, title, subtitle, time, notification_id]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  createParticipantVariableQuestions: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
      const { userid, variable_questions } = req.body;

      if (!userid || !variable_questions) {
        return res
          .status(400)
          .json({
            status: "error",
            message:
              "User ID and questions are required",
          });
      }

      const [results, fields] = await connection.execute(
        `UPDATE user
          SET variable_questions = ?
          WHERE user_id = ?;`,
        [variable_questions,userid]
      );

      res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
  sendMessegetoParticipant: async (req, res) => {
    const connection = await getValidatedConnection();
    try {
          const { title, message, token, service,ImageUrl,ImageIconUrl,SmallImageIconUrl,IconReference } = req.body;

          if (!title || !message || !token || !service) {
            return res.status(400).json({
              status: "error",
              message: 'Missing required fields: title, message, token, or service.',
            });
          }
        
          const applicationId = process.env.PUSH_APPLICATION_ID; // Use environment variables
          const client = new PinpointClient({ region: process.env.PUSH_REGION,
            credentials: {
            accessKeyId: process.env.PUSH_ACCESS_KEY_ID,
            secretAccessKey: process.env.PUSH_SECRET_ACCESS_KEY_ID,
          }
        });
        
          const createMessageRequest = () => {
            const config = {
              Addresses: {
                [token]: { ChannelType: service },
              },
              MessageConfiguration: {},
            };
        
            if (service === 'GCM') {
              config.MessageConfiguration.GCMMessage = {
                Action: 'OPEN_APP',
                Body: message,
                Title: title,
                Priority: 'high',
                SilentPush: false,
                TimeToLive: 3600,
                ImageUrl:ImageUrl,
                ImageIconUrl:ImageIconUrl,
                SmallImageIconUrl:SmallImageIconUrl,
                IconReference:IconReference
              };
            }else if (service === 'APNS') {
              messageRequest.MessageConfiguration.APNSMessage = {
                'Action': action,
                'Body': message,
                'Priority': priority,
                'SilentPush': silent,
                'Title': title,
                'TimeToLive': ttl,
                'Url': url,
              };
            } else {
              throw new Error('Invalid service type. Use GCM (Android) or APNS (iOS).');
            }
        
            return config;
          };
        
          try {
            const params = {
              ApplicationId: applicationId,
              MessageRequest: createMessageRequest(),
            };
            const response = await client.send(new SendMessagesCommand(params));
            //res.json({ message: 'Notification sent successfully!', response });
            res.status(200).json({ status: "success", data: response });
          } catch (error) {
            console.error('Error sending notification:', error);
            //res.status(500).json({ message: 'Failed to send notification', error: error.message });
            res.status(500).json({ status: "error", data: "Failed to send notification" });
          }
      //res.status(200).json({ status: "success", data: results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error" });
    } finally {
      connection.release();
    }
  },
};

export default researcherController;
