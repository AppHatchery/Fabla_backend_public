/**
 * Creates a JSON object consisting of `Studies` and their respective diaries.
 *
 * Parameters:
 * - parsedResult: A JSON object containing experiment details including studies with diaries.
 * - user: A JSON object containing onboarding details for the user
 *
 * Returns:
 * A JSON object for the experiment with all studies and their calculated diaries.
 */

import {
  parseTime,
  isActiveDay,
  toLocalTime,
  parseNotifications,
} from "./timeUtils.mjs";

function processDiaries2(user, parsedResult) {
  const rolling_starts = parsedResult.rolling_starts === 1 ? true : false;

  user.timeVariables = extractTimeVariables(user);
  user.questions = JSON.parse(user.questions);
  // console.log(user);
  // console.log(parsedResult.studies[0].diaries);
  // console.log(user.questions);

  const studiesWithDiaries = parsedResult.studies
    .filter((study) => study.diaries && study.diaries.length > 0)
    .map((study) => processStudy(user, rolling_starts, study));

  return {
    studies: studiesWithDiaries,
  };
}

// Process each study to create its respective diaries using eligibleDays
function processStudy(user, rolling_starts, study) {
  let diaries = [];
  let startDate = new Date();
  let endDate = new Date();

  //For experiment with Rolling dates
  if (rolling_starts) {
    diaries = generateDiariesRolling(user, study, startDate, endDate);
  }
  //For experiments with fixed dates
  else {
    startDate = new Date(study.start_date);
    endDate = new Date(study.end_date);
    diaries = generateDiaries(user, study, startDate, endDate);
  }

  return {
    id: study.study_id,
    name: study.study_name,
    goal: {
      daily: study.daily_goal,
      weekly: study.weekly_goal,
    },
    incentive: {
      amount: study.diary_incentive.toFixed(2),
      bonus: study.bonus_amount.toFixed(2),
      currency: "$",
      threshold: study.bonus_threshold,
    },
    diaries,
  };
}

// Generate diaries for rolling experiments
function generateDiariesRolling(user, study, startDate) {
  let usedDays = 0;
  let totalDays = study.to_day;
  const duration = study.to_day - study.from_day;

  const diaries = [];
  const diaryTemplates = filterAndSortDiaries(
    study.diaries,
    user.timeVariables
  );
  let currentDate = new Date(startDate);
  const extras = JSON.parse(user.extra);

  // Move eligible days logic down to the diary level
  diaryTemplates.forEach((diary) => {
    // console.log(diary.questions);
    // Determine active days or work days for the diary
    let active_days = [];
    if (JSON.parse(diary.active_days) == "Work_days") {
      active_days = JSON.parse(extras.Work_days);
    } else {
      active_days = JSON.parse(diary.active_days);
    }

    // Generate eligible days based on diary's active days
    const eligibleDays = [];
    let tempDate = new Date(startDate);
    while (eligibleDays.length <= totalDays) {
      if (isActiveDay(tempDate, active_days)) {
        eligibleDays.push(new Date(tempDate)); // Add eligible day as a Date object
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Store eligible days in the diary entry

    diary.eligible_days = eligibleDays.slice(study.from_day - 1, study.to_day);
  });

  // Create diary entries for each eligible day and diary
  while (usedDays < duration) {
    diaryTemplates.forEach((diary) => {
      diary.eligible_days.forEach((eligibleDay) => {
        const start = parseTime(
          eligibleDay,
          diary.start_time,
          user.timeVariables
        );
        const end = parseTime(eligibleDay, diary.end_time, user.timeVariables);
        const questions = extractQuestions(user, diary.questions);
        diary.questions = questions;
        diaries.push(
          createDiaryEntry(
            toLocalTime(start),
            toLocalTime(end),
            diary,
            parseNotifications(
              eligibleDay,
              user.timeVariables,
              diary.notifications
            ),
            diary.active_days
          )
        );
        usedDays += 1; // Track how many eligible days have been used
      });
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return diaries;
}

// Generate diaries for a study within the given date range
function generateDiaries(user, study, startDate, endDate) {
  const diaries = [];
  // Filter out diaires that do not have any questions

  let currentDate = new Date(startDate);

  const extras = JSON.parse(user.extra);
  // Initialize last execution dates for each diary template:: only for weekly and monthly diaries
  const lastExecutionDates = study.diaries.reduce((acc, diary) => {
    if (diary.frequency === "Weekly" || diary.frequency === "Monthly") {
      acc[diary.diary_name] = new Date(startDate);
    }
    return acc;
  }, {});

  const filteredDiaries = filterAndSortDiaries(
    study.diaries,
    user.timeVariables
  );

  //Creating diaries only for the given period
  while (currentDate <= endDate) {
    //Normal Process if Diaries do not go beyond the knock off time
    filteredDiaries.forEach((diary) => {
      const questions = extractQuestions(user, diary.questions);
      diary.questions = questions;
      //Parsing the active days field to check whether to use user work hours or specified active days

      //To-Do:: Change to use different variables not just "Work days"
      let active_days = [];
      if (JSON.parse(diary.active_days) == "Work_days") {
        active_days = JSON.parse(extras.Work_days);
      } else {
        active_days = JSON.parse(diary.active_days);
      }
      const start = parseTime(
        currentDate,
        diary.start_time,
        user.timeVariables
      );
      const end = parseTime(currentDate, diary.end_time, user.timeVariables);
      //parse notifications

      //Different implementations for different frequencies
      switch (diary.frequency) {
        case "Daily":
          if (isActiveDay(currentDate, active_days)) {
            diaries.push(
              createDiaryEntry(
                toLocalTime(start),
                toLocalTime(end),
                diary,
                parseNotifications(
                  currentDate,
                  user.timeVariables,
                  diary.notifications
                ),
                active_days
              )
            );
          }
          break;

        //Weekly Diaries
        case "Weekly":
          const lastWeeklyExecution = lastExecutionDates[diary.diary_name];
          const nextWeeklyExecution = new Date(lastWeeklyExecution);
          nextWeeklyExecution.setDate(lastWeeklyExecution.getDate() + 6);
          if (
            currentDate >= nextWeeklyExecution &&
            nextWeeklyExecution <= endDate
          ) {
            diaries.push(
              createDiaryEntry(
                parseTime(
                  toLocalTime(lastWeeklyExecution),
                  toLocalTime(diary.start_time),
                  user.timeVariables
                ),
                parseTime(
                  nextWeeklyExecution,
                  diary.end_time,
                  user.timeVariables
                ),
                diary,
                parseNotifications(diary.notifications),
                active_days
              )
            );
            lastExecutionDates[diary.diary_name] = new Date(
              nextWeeklyExecution
            );
          }
          break;
      }
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return diaries;
}

// Filter out diaries without questions and sort by start time
function filterAndSortDiaries(diaries, timeVariables) {
  return diaries
    .filter((diary) => diary.questions && diary.questions.length > 0)
    .sort((a, b) => {
      const startA = parseTime(new Date(), a.start_time, timeVariables);
      const startB = parseTime(new Date(), b.start_time, timeVariables);
      return startA - startB;
    });
}

//Clean question data
function extractQuestions(user, diary_questions) {
  const questions = [];
  diary_questions.forEach((question) => {
    questions.push({
      question_id: question.question_id,
      type: question.type,
      title: question.title.startsWith("var_")
        ? user.questions[question.title] === undefined
          ? "Question is not defined for you, contact support!"
          : user.questions[question.title]
        : question.title,
      subtitle: question.subtitle,
      required: question.required,
      max_value: question.max_value,
      min_value: question.min_value,
      max_label: question.max_label,
      min_label: question.min_label,
      default_value: question.default_value,
      options: question.options,
    });
  });
  // console.log(questions);
  return questions;
}
//Extract user data
function extractTimeVariables(user) {
  const timeVariables = {};
  if (user.extra) {
    try {
      const extras = JSON.parse(user.extra);
      for (let [key, value] of Object.entries(extras)) {
        if (value.match(/^\d{2}:\d{2}:\d{2}$/)) {
          // Matches HH:MM:SS format
          timeVariables[key] = value;
        }
      }
      return timeVariables;
    } catch (error) {
      console.error("Error parsing user.extra:", error);
    }
  } else {
    console.warn("user.extra is not defined or is null");
  }
}

// Create a single diary entry
function createDiaryEntry(
  start,
  end,
  diaryTemplate,
  notifications,
  active_days
) {
  return {
    name: diaryTemplate.diary_name,
    start_time: start,
    end_time: end,
    entries: diaryTemplate.entries,
    active_days: diaryTemplate.frequency !== "Daily" ? active_days : null,
    questions: diaryTemplate.questions,
    notifications: notifications,
  };
}

// Process the diaries using the dummy data
export default processDiaries2;
