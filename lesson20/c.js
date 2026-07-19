const dateRegex = /([0-2][1-9]|[1-3]0|31).(0[1-9]|1[0-2]).((19|20)\d{2})|((19|20)\d{2})-(0[1-9]|1[0-2])-([0-2][1-9]|[1-3]0|31)/g;
const text = "Today is 15.01.2025 and tomorrow is 2025-01-16. Invalid: 32.13.2025";

const dates = text.match(dateRegex);
console.log(dates); // ["15.01.2025", "2025-01-16"]