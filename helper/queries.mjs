// queries.js

export const getUserProtocolQuery = `
   SELECT JSON_OBJECT(
        'rolling_starts', e.has_rolling_dates,
        'studies', COALESCE(
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'study_id', s.study_id,
                    'study_name', s.study_name,
                    'start_date', s.start_date,
                    'end_date', s.end_date,
                    'from_day', s.from_day,
                    'to_day', s.to_day,
                    'daily_goal', s.daily_goal,
                    'weekly_goal', s.weekly_goal,
                    'diary_incentive', s.diary_incentive,
                    'bonus_amount', s.bonus_amount,
                    'bonus_threshold', s.bonus_threshold,
                    'study_notifications', COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', sn.notification_id,
                                'title', sn.title,
                                'subtitle', sn.subtitle,
                                'time', sn.time
                            )
                            ORDER BY sn.time -- Order study notifications by time
                        )
                        FROM study_notifications sn
                        WHERE sn.study_id = s.study_id
                    ), JSON_ARRAY()
                    ),
                    'diaries', COALESCE(
                        (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'diary_id', d.diary_id,
                                    'diary_name', d.diary_name,
                                    'start_time', d.start_time,
                                    'end_time', d.end_time,
                                    'active_days', COALESCE(d.active_days, ''),
                                    'frequency', d.frequency,
                                    'entries', d.entries,
                                    'notifications', COALESCE(
                                        (
                                            SELECT JSON_ARRAYAGG(
                                                JSON_OBJECT(
                                                    'id', n.notification_id,
                                                    'title', n.title,
                                                    'subtitle', n.subtitle,
                                                    'time', n.time,
                                                    'cancellable', CASE
                                                        WHEN n.cancellable = 1 THEN TRUE
                                                        ELSE FALSE
                                                    END
                                                )
                                            )
                                            FROM diary_notifications n
                                            WHERE n.diary_id = d.diary_id
                                        ), JSON_ARRAY()
                                    ),
                                    'questions', COALESCE(
                                        (
                                            SELECT JSON_ARRAYAGG(
                                                JSON_OBJECT(
                                                    'question_id', q.question_id,
                                                    'question_number', q.question_number,
                                                    'type', q.type_,
                                                    'title', q.title,
                                                    'subtitle', q.subtitle,
                                                    'required', CASE
                                                        WHEN q.required = 1 THEN TRUE
                                                        ELSE FALSE
                                                    END,
                                                    'max_value', q.max_value,
                                                    'min_value', q.min_value,
                                                    'max_label', q.max_label,
                                                    'min_label', q.min_label,
                                                    'default_value', q.default_value,
                                                    'options', JSON_EXTRACT(q.option_text, '$')
                                                )
                                                ORDER BY q.question_number -- Order questions by question_number
                                            )
                                            FROM questions q
                                            WHERE q.diary_id = d.diary_id
                                        ), JSON_ARRAY()
                                    )
                                )
                            )
                            FROM diaries d
                            WHERE d.study_id = s.study_id
                        ), JSON_ARRAY()
                    )
                )
            ), JSON_ARRAY()
        )
    ) AS protocol
FROM experiment e
LEFT JOIN study s ON e.experiment_id = s.experiment_id
WHERE e.researcher_logincode = ?
GROUP BY e.experiment_id;
`;

export const getVariables = `
    SELECT 
        experiment_variables
    FROM 
        experiment
    WHERE 
        researcher_logincode = ?;
    `;

export const getolduserprotocolquery = `SELECT
    JSON_OBJECT(
        'version', 1,
        'daily_goal', 3,  -- Placeholder value for daily_goal
        'weekly_goal', 15,  -- Placeholder value for weekly_goal
        'diaries', JSON_ARRAYAGG(
            JSON_OBJECT(
                'type', D.type_,
                'start_date', D.start_date,
                'end_date', D.end_date,
                'start_time', D.start_time,
                'end_time', D.end_time,
                'entries', D.entries,
                'questions', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'type', Q.type_,
                            'title', Q.title,
                            'subtitle', Q.subtitle,
                            'required', Q.required,
                            'max_value', Q.max_value,
                            'min_value', Q.min_value,
                            'default_value', Q.default_value,
                            'options', JSON_ARRAY(Q.option_text)
                        )
                    )
                    FROM questions Q
                    JOIN user_on_question UQ ON Q.question_id = UQ.question_id
                    WHERE Q.diary_id = D.diary_id
                    AND UQ.user_id = U.user_id
                    AND UQ.is_disabled = 0
                )
            )
        )
    ) AS json_data
    FROM
    diaries D
    JOIN questions Q ON D.diary_id = Q.diary_id
    JOIN user_on_question UQ ON Q.question_id = UQ.question_id
    JOIN user U ON UQ.user_id = U.user_id
    WHERE
    U.studycode = ?
    GROUP BY U.user_id;`;

export const verifyuserquery = `
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN true
            ELSE false
        END AS result
    FROM 
        user u
    JOIN 
        experiment e ON u.experimentid = e.experiment_id
    WHERE LOWER(u.studycode) = LOWER(?) 
    AND LOWER(e.researcher_logincode) = LOWER(?)
    ;

`;

export const updateuserextraquery = `
    UPDATE user u
        JOIN experiment e ON u.experimentid = e.experiment_id
    SET u.extra = ?,
    u.user_token = ?,
    u.service = ?
    WHERE u.studycode = ?
    AND e.researcher_logincode = ?;
    `;

export const getuserinfoquery = ` 
       SELECT 
        u.user_id,
        u.studycode,
        u.experimentid,
        IFNULL(
            CASE
                WHEN JSON_VALID(u.extra) THEN u.extra
                ELSE '{}'
            END, 
        '{}') AS extra,
         IFNULL(
            CASE
                WHEN JSON_VALID(u.variable_questions) THEN u.variable_questions
                ELSE '{}'
            END, 
        '{}') AS questions
    FROM 
        user u
    JOIN 
        experiment e ON u.experimentid = e.experiment_id
    WHERE 
        u.studycode = ? 
    AND 
        e.researcher_logincode = ?;
`;
