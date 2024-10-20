import { Timestamp } from "firebase/firestore";

const daysOfWeek = {
  monday: "(一)",
  tuesday: "(二)",
  wednesday: "(三)",
  thursday: "(四)",
  friday: "(五)",
  saturday: "(六)",
  sunday: "(日)",
};

export const timePeriods = {
  morning: "上午",
  afternoon: "下午",
  evening: "夜間",
};

export const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const getWeekdayByIndex = (dayIndex) => {
  return weekdays[dayIndex];
};

export const formatTimestampToDateString = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp.seconds * 1000);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}/${month}/${day}`;
};

export const formatDateToLocaleString = (data) => {
  const date = data instanceof Timestamp ? data.toDate() : new Date(data);
  return date
    .toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "/");
};

export const convertToFirebaseTimestamp = (data) => {
  const date = new Date(data);
  const firebaseTimestamp = Timestamp.fromDate(date);
  return firebaseTimestamp;
};

export const convertDateStringToTimestamp = (date) => {
  const datePart = date.split(" ")[0];
  const [year, month, day] = datePart.split("/").map(Number);
  const jsDate = new Date(year, month - 1, day);
  return Timestamp.fromDate(jsDate);
};

export const extractDateComponents = (data) => {
  if (!data) return null;
  const timestamp = data instanceof Timestamp ? data : Timestamp.fromDate(data);
  const dateFromSeconds = new Date(timestamp.seconds * 1000);
  return [
    dateFromSeconds.getFullYear(),
    String(dateFromSeconds.getMonth() + 1).padStart(2, "0"),
    String(dateFromSeconds.getDate()).padStart(2, "0"),
  ];
};

const getStartOfWeek = (date) => {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday;
};

const generateWeeklyDateFormat = (startDate) => {
  let formattedDates = [];
  for (let i = 0; i < 28; i++) {
    let currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1;
    let year = currentDate.getFullYear();

    let dayKey = getWeekdayByIndex(currentDate.getDay());

    formattedDates.push(`${year}/${month}/${day} ${daysOfWeek[dayKey]}`);
  }
  let weeks = [];
  for (let i = 0; i < formattedDates.length; i += 7) {
    weeks.push(formattedDates.slice(i, i + 7));
  }
  return weeks;
};

export const formatWeeklyDoctorDates = (startDate) => {
  let dateEntries = [];
  for (let i = 0; i < 56; i++) {
    let currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1;
    let year = currentDate.getFullYear();

    let dayKey = getWeekdayByIndex(currentDate.getDay());

    dateEntries.push(`${year}/${month}/${day} ${daysOfWeek[dayKey]}`);
  }
  let weeks = [];
  for (let i = 0; i < dateEntries.length; i += 7) {
    weeks.push(dateEntries.slice(i, i + 7));
  }
  return weeks;
};

const parseDateString = (dateStr) => {
  const [datePart] = dateStr.split(" (");
  return datePart.split("/").map(Number);
};

const isDateInPast = (year, month, day) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  return (
    year < currentYear ||
    (year === currentYear &&
      (month < currentMonth || (month === currentMonth && day <= currentDay)))
  );
};

export const isDateDisabled = (dateStr) => {
  const [year, month, day] = parseDateString(dateStr);
  return isDateInPast(year, month, day);
};

export const isDoctorDisabled = (dateStr) => {
  const [year, month, day] = parseDateString(dateStr);
  const inputDate = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fourWeeksLater = new Date(today);
  fourWeeksLater.setDate(today.getDate() + 28);

  return inputDate < today || inputDate < fourWeeksLater;
};

export const filterRegistrationDataByCurrentDate = (mockDatabase) => {
  if (!mockDatabase) return [];
  const currentDateFormatted = extractDateComponents(new Date());
  const filteredData = mockDatabase?.filter((data) => {
    const currentOPDDate = extractDateComponents(data.OPD_date);
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
  const filteredData = mockDatabase?.filter((data) => {
    const currentDateFormatted = extractDateComponents(new Date());
    const currentOPDDate = extractDateComponents(data.OPD_date);
    let isDateMatching = false;
    for (let i = 0; i < currentOPDDate.length; i++) {
      if (currentOPDDate[i] > currentDateFormatted[i]) {
        isDateMatching = true;
        break;
      }
    }
    let isToday = true;
    for (let i = 0; i < currentOPDDate.length; i++) {
      if (currentOPDDate[i] != currentDateFormatted[i]) {
        isToday = false;
        break;
      }
    }
    const isStatus = data.status === "confirmed";
    return (isDateMatching || isToday) && isStatus;
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
  return checkSum % 10 == 0;
};

export const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dayIndex = today.getDay();
  const dayKey = getWeekdayByIndex(dayIndex);

  return { date: `${year}/${month}/${day}`, daysOfWeek: dayKey };
};

export const calculateNextRegistrationNumber = (data, time, selectedDate) => {
  const extractedDate = selectedDate.split(" ")[0];
  const foundDate = data.filter(
    (item) => formatTimestampToDateString(item.OPD_date) === extractedDate
  );
  const foundTime = foundDate.filter(
    (item) => item.appointment_timeslot === time
  );
  const maxRegistrationNumber = Math.max(
    ...foundTime.map((item) => item.registration_number),
    0
  );
  return maxRegistrationNumber + 1;
};

const today = new Date();
const beginningOfWeek = getStartOfWeek(today);
export const formattedWeeklyDates = generateWeeklyDateFormat(beginningOfWeek);
export const formattedDoctorWeeklyDates =
  formatWeeklyDoctorDates(beginningOfWeek);
