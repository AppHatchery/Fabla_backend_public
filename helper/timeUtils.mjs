export function combineDateTime(date, timeString) {
  const timeParts = timeString.split(":");
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    throw new Error("Invalid time format");
  }

  const combinedDate = new Date(date);
  combinedDate.setUTCHours(hours);
  combinedDate.setUTCMinutes(minutes);
  combinedDate.setSeconds(seconds);

  return combinedDate;
}

//Function for process formulas from Retool
export function parseTime(currentDate, timeStr, variables) {
  try {
    // Helper function to convert HH:MM:SS time format to total minutes
    function timeToMinutes(timeStr) {
      const [hours, minutes, seconds] = timeStr.split(":").map(Number);
      return hours * 60 + minutes + (seconds || 0) / 60;
    }

    // Helper function to convert total minutes back to HH:MM:SS format
    function minutesToTime(minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      const secs = Math.round((minutes % 1) * 60); // Handle fractional minutes as seconds
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
        2,
        "0"
      )}:${String(secs).padStart(2, "0")}`;
    }
    //If timestr is a proper time object
    //CHeck the for the HH:MM:SS format
    if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
      // Matches HH:MM:SS format
      const parsedTime = combineDateTime(currentDate, timeStr);
      return parsedTime;
    } else {
      // Replace variable names with their corresponding time values from the 'variables' object
      const expression = timeStr.replace(
        /([a-zA-Z_]\w*|\d+(\.\d+)?)/g,
        (match) => {
          // console.log(match);
          if (variables.hasOwnProperty(match)) {
            return timeToMinutes(variables[match]); // Replace with minutes equivalent
          } else if (!isNaN(match)) {
            // console.log("match: " + match);
            return match;
          } else {
            throw new Error(
              `Variable "${match}" not found and is not a valid number.`
            );
          }
        }
      );
      // console.log(expression);
      // Evaluate the expression using Function() - now the expression is in terms of minutes
      const evaluatedMinutes = new Function("return " + expression)();

      if (typeof evaluatedMinutes === "number") {
        // Convert evaluated result (in minutes) back to HH:MM:SS
        const finalTimeStr = minutesToTime(evaluatedMinutes);

        // Combine with current date
        const parsedTime = new Date(currentDate);
        const [hours, minutes, seconds] = finalTimeStr.split(":").map(Number);
        parsedTime.setUTCHours(hours);
        parsedTime.setUTCMinutes(minutes);
        parsedTime.setUTCSeconds(seconds);

        return parsedTime;
      } else {
        throw new Error("Expression did not evaluate to a number");
      }
    }
  } catch (error) {
    console.error("Error parsing time string:", error);
    return currentDate;
  }
}

// Check if the current date is an active day for the diary
export function isActiveDay(currentDate, activeDays) {
  const dayOfWeek = currentDate.getDay();
  return activeDays.includes(dayOfWeek);
}

//Manually convert time from UTC to local without changing the intended times for consumption
export function toLocalTime(utcdate) {
  const year = utcdate.getUTCFullYear();
  const month = String(utcdate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utcdate.getUTCDate()).padStart(2, "0");
  const hour = String(utcdate.getUTCHours()).padStart(2, "0");
  const minute = String(utcdate.getUTCMinutes()).padStart(2, "0");
  const second = String(utcdate.getUTCSeconds()).padStart(2, "0");

  // Return the combined date and time string without the "Z" for UTC
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

//Clean Diary Notifications
export function parseNotifications(currentDate, timeVariables, nots) {
  const notifications = [];

  nots.forEach((notification) => {
    //Format time to HH:MM
    const timeStr = parseTime(currentDate, notification.time, timeVariables);
    const hour = String(timeStr.getUTCHours()).padStart(2, "0");
    const minute = String(timeStr.getUTCMinutes()).padStart(2, "0");
    const time = `${hour}:${minute}`;
    notifications.push({
      id: notification.id,
      title: notification.title,
      content: notification.subtitle,
      time: time,
    });
  });

  return notifications;
}
