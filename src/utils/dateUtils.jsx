import { Timestamp } from "firebase/firestore";

const getCurrentDateInfo = (data) => {
  const timestamp = data instanceof Timestamp ? data : Timestamp.fromDate(data);
  const dateFromSeconds = new Date(timestamp.seconds * 1000);
  return [
    dateFromSeconds.getFullYear(),
    String(dateFromSeconds.getMonth() + 1).padStart(2, "0"),
    String(dateFromSeconds.getDate()).padStart(2, "0"),
  ];
};

export const filterRegistrationDataByCurrentDate = (mockDatabase) => {
  const currentDateFormatted = getCurrentDateInfo(new Date());
  return mockDatabase.filter((data) => {
    const currentOPDDate = getCurrentDateInfo(data.OPD_date);
    const isDateMatching = currentOPDDate.every(
      (component, index) => component === currentDateFormatted[index]
    );
    return isDateMatching && data.status === "confirmed";
  });
};