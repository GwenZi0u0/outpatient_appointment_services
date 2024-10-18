import { Timestamp } from "firebase/firestore";

export const timePeriods = {
  morning: "上午",
  afternoon: "下午",
  evening: "夜間",
};

const daysOfWeek = {
  monday: "(一)",
  tuesday: "(二)",
  wednesday: "(三)",
  thursday: "(四)",
  friday: "(五)",
  saturday: "(六)",
  sunday: "(日)",
};

const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const getWeekdayName = (dayIndex) => {
  return weekdays[dayIndex];
};

export const dayKeys = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const getMonday = (date) => {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday;
};

const formatWeeklyDates = (startDate) => {
  let formattedDates = [];
  for (let i = 0; i < 28; i++) {
    let currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1;
    let year = currentDate.getFullYear();

    let dayKey = getWeekdayName(currentDate.getDay());

    formattedDates.push(`${year}/${month}/${day} ${daysOfWeek[dayKey]}`);
  }
  let weeks = [];
  for (let i = 0; i < formattedDates.length; i += 7) {
    weeks.push(formattedDates.slice(i, i + 7));
  }
  return weeks;
};

export const formatWeeklyDoctorDates = (startDate) => {
  let formattedDates = [];
  for (let i = 0; i < 56; i++) {
    let currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1;
    let year = currentDate.getFullYear();

    let dayKey = getWeekdayName(currentDate.getDay());

    formattedDates.push(`${year}/${month}/${day} ${daysOfWeek[dayKey]}`);
  }
  let weeks = [];
  for (let i = 0; i < formattedDates.length; i += 7) {
    weeks.push(formattedDates.slice(i, i + 7));
  }
  return weeks;
};

const today = new Date();
const monday = getMonday(today);
export const weeks = formatWeeklyDates(monday);
export const doctorWeeks = formatWeeklyDoctorDates(monday);

export const isDisabled = (dateStr) => {
  const [datePart] = dateStr.split(" (");
  const [year, month, day] = datePart.split("/").map(Number);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  if (
    year < currentYear ||
    (year === currentYear &&
      (month < currentMonth || (month === currentMonth && day <= currentDay)))
  ) {
    return true;
  }
  return false;
};

export const isDoctorDisabled = (dateStr) => {
  const [datePart] = dateStr.split(" (");
  const [year, month, day] = datePart.split("/").map(Number);
  const inputDate = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fourWeeksLater = new Date(today);
  fourWeeksLater.setDate(today.getDate() + 28);

  if (inputDate < today) {
    return true;
  } else if (inputDate < fourWeeksLater) {
    return true;
  } else {
    return false;
  }
};

export const convertToTimestamp = (date) => {
  const datePart = date.split(" ")[0];
  const [year, month, day] = datePart.split("/").map(Number);
  const jsDate = new Date(year, month - 1, day);
  return Timestamp.fromDate(jsDate);
};

export const getCurrentDateInfo = (data) => {
  if (!data) return null;
  const timestamp = data instanceof Timestamp ? data : Timestamp.fromDate(data);
  const dateFromSeconds = new Date(timestamp.seconds * 1000);
  return [
    dateFromSeconds.getFullYear(),
    String(dateFromSeconds.getMonth() + 1).padStart(2, "0"),
    String(dateFromSeconds.getDate()).padStart(2, "0"),
  ];
};

export const filterRegistrationDataByCurrentDate = (mockDatabase) => {
  if (!mockDatabase) return [];
  const currentDateFormatted = getCurrentDateInfo(new Date());
  const filteredData = mockDatabase?.filter((data) => {
    const currentOPDDate = getCurrentDateInfo(data.OPD_date);
    const isDateMatching = currentOPDDate?.every(
      (component, index) => component === currentDateFormatted[index]
    );
    const isStatus = data.status === "confirmed";
    return isDateMatching && isStatus;
  });
  return filteredData;
};

export const filterRegistrationDataByFutureDate = (mockDatabase) => {
  if (!mockDatabase) return [];
  const currentDateFormatted = getCurrentDateInfo(new Date());
  const filteredData = mockDatabase?.filter((data) => {
    const currentOPDDate = getCurrentDateInfo(data.OPD_date);
    const isDateMatching = currentOPDDate?.every(
      (component, index) => component >= currentDateFormatted[index]
    );
    const isStatus = data.status === "confirmed";
    return isDateMatching && isStatus;
  });
  return filteredData;
};

export const isValidTaiwanID = (id) => {
  id = id.trim();
  let verification = id.match("^[A-Z][12]\\d{8}$");
  if (!verification) {
    return false;
  }

  let convert = "ABCDEFGHJKLMNPQRSTUVXYWZIO";
  let weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];

  id = String(convert.indexOf(id[0]) + 10) + id.slice(1);

  let checkSum = 0;
  for (let i = 0; i < id.length; i++) {
    let c = parseInt(id[i]);
    let w = weights[i];
    checkSum += c * w;
  }
  console.log(checkSum);
  return checkSum % 10 == 0;
};

export const formatFirestoreTimestamp = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp.seconds * 1000);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}/${month}/${day}`;
};

export const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dayIndex = today.getDay();
  const dayKey = getWeekdayName(dayIndex);

  return { date: `${year}/${month}/${day}`, daysOfWeek: dayKey };
};
