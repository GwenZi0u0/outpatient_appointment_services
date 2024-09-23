import styled from "styled-components";
import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { fireDb } from "../firebase";

export default function ClassSchedulePage() {
  const { user } = useAuth();
  const { queries } = useData();
  const departmentData = queries[0]?.data || [];
  const doctorData = queries[1]?.data || [];
  const doctor = doctorData?.find((doc) => doc.uid === user.uid) || {};
  const department = departmentData.find(
    (dep) => dep.id === doctor?.division.division_id
  );
  const specialty =
    department?.specialties.find((specialty) => specialty.id) || {};
  const scheduleData = queries[2]?.data || [];
  const schedule =
    scheduleData.filter((schedule) => schedule.doctor_id === user.uid) || [];
  const [selectedDateTimes, setSelectedDateTimes] = useState([]);
  const requestLeaveData = queries[7]?.data || [];

  const requestLeave = requestLeaveData
    .filter((item) => item.doctor_id === user.uid)
    .flatMap((item) => item.date_times);

  const daysOfWeek = {
    monday: "(一)",
    tuesday: "(二)",
    wednesday: "(三)",
    thursday: "(四)",
    friday: "(五)",
    saturday: "(六)",
    sunday: "(日)",
  };

  const today = new Date();

  const getDayKey = (dayIndex) => {
    const dayMap = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return dayMap[dayIndex];
  };

  const getMonday = (date) => {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday;
  };

  function formatWeeklyDates(startDate) {
    let formattedDates = [];
    for (let i = 0; i < 28; i++) {
      let currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      let day = currentDate.getDate();
      let month = currentDate.getMonth() + 1;
      let year = currentDate.getFullYear();

      let dayKey = getDayKey(currentDate.getDay());

      formattedDates.push(`${year}/${month}/${day} ${daysOfWeek[dayKey]}`);
    }
    let weeks = [];
    for (let i = 0; i < formattedDates.length; i += 7) {
      weeks.push(formattedDates.slice(i, i + 7));
    }

    return weeks;
  }

  const isDisabled = (dateStr) => {
    const [monthDay] = dateStr.split(" ");
    const [month, day] = monthDay.split("/").map(Number);

    const today = new Date();
    const selectedDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const date = new Date(today.getFullYear(), month - 1, day);

    return date < selectedDate;
  };

  const timeSlots = {
    morning: "上午",
    afternoon: "下午",
    evening: "夜間",
  };

  const convertToTimestamp = (date) => {
    const datePart = date.split(" ")[0];
    const [year, month, day] = datePart.split("/").map(Number);
    const jsDate = new Date(year, month - 1, day);
    return Timestamp.fromDate(jsDate);
  };

  const monday = getMonday(today);
  const weeks = formatWeeklyDates(monday);

  const isLeaveDay = weeks
    .map((week) =>
      week.filter((day) =>
        requestLeave.some(
          (leave) => convertToTimestamp(day).seconds === leave.date.seconds
        )
      )
    )
    .flat();

  const handleCheckboxClick = (date, time) => {
    const firebaseTimestamp = convertToTimestamp(date);

    setSelectedDateTimes((prevState) => {
      const dateIndex = prevState.findIndex((item) =>
        item.date.isEqual(firebaseTimestamp)
      );

      if (dateIndex === -1) {
        return [...prevState, { date: firebaseTimestamp, times: [time] }];
      } else {
        const updatedTimes = [...prevState[dateIndex].times];
        const timeIndex = updatedTimes.indexOf(time);

        if (timeIndex === -1) {
          updatedTimes.push(time);
        } else {
          updatedTimes.splice(timeIndex, 1);
        }

        if (updatedTimes.length === 0) {
          return prevState.filter(
            (item) => !item.date.isEqual(firebaseTimestamp)
          );
        }

        const updatedState = [...prevState];
        updatedState[dateIndex] = {
          ...updatedState[dateIndex],
          times: updatedTimes,
        };

        return updatedState;
      }
    });
  };
  const dayKeys = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const handleSubmit = async () => {
    const confirmSubmission = window.confirm("確定要休診嗎？");

    if (!confirmSubmission) {
      return;
    }
    try {
      const results = {
        create_time: Timestamp.now(),
        doctor_id: user.uid,
        date_times: selectedDateTimes,
      };

      await addDoc(collection(fireDb, "request_leave"), results);
      console.log("Document written with ID: ", results);
      setSelectedDateTimes([]);
      window.location.reload();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <>
      <CalendarContainer>
        <ConfirmedContainer>
          <Confirmed>
            <ConfirmedTitle>科別 : {specialty.specialty}</ConfirmedTitle>
          </Confirmed>
          <Confirmed>
            <ConfirmedTitle>醫師 : {doctor.physician_name}</ConfirmedTitle>
          </Confirmed>
          <Confirmed>
            <ConfirmedTitle>
              診間 : {schedule.map((item) => item.room)}
            </ConfirmedTitle>
          </Confirmed>
        </ConfirmedContainer>
        <TableWrapper>
          {weeks.map((week, weekIndex) => (
            <StyledTable key={weekIndex}>
              <Thead>
                <Tr>
                  <TableHeader></TableHeader>
                  {week.map((day, dayIndex) => (
                    <TableHeader
                      key={`${weekIndex}-${dayIndex}`}
                      as={dayIndex >= 5 ? WeekendCell : undefined}
                    >
                      {day.slice(5)}
                    </TableHeader>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {Object.entries(timeSlots).map(([time, slot]) => (
                  <Tr key={time}>
                    <TimeSlot>{slot}</TimeSlot>
                    {week.map((date, dayIndex) => (
                      <TableData
                        key={`${weekIndex}-${dayIndex}`}
                        as={dayIndex >= 5 ? WeekendCell : undefined}
                      >
                        {schedule?.find(
                          (scheduleItem) =>
                            scheduleItem.department_id === department.id &&
                            scheduleItem.doctor_id === user.uid &&
                            dayKeys[dayIndex] in scheduleItem.shift_rules &&
                            Array.isArray(
                              scheduleItem.shift_rules[dayKeys[dayIndex]]
                            ) &&
                            scheduleItem.shift_rules[
                              dayKeys[dayIndex]
                            ].includes(time) &&
                            !isLeaveDay.includes(date)
                        ) ? (
                          <CheckInput
                            type="checkbox"
                            name="doctor"
                            onChange={() => handleCheckboxClick(date, time)}
                            disabled={isDisabled(date)}
                          />
                        ) : (
                          "休"
                        )}
                      </TableData>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </StyledTable>
          ))}
          <Button onClick={handleSubmit}>休診提交</Button>
        </TableWrapper>
      </CalendarContainer>
    </>
  );
}

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ccc;
  padding-top: 100px;
`;

const ConfirmedContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px 30px;
  width: 85%;
`;

const Confirmed = styled.div`
  display: flex;
  flex-direction: row;
  width: 40%;
  font-size: 20px;
`;

const ConfirmedTitle = styled.div`
  display: flex;
  font-weight: bold;
  letter-spacing: 2.5px;
  width: auto;
`;

const Button = styled.button`
  width: 500px;
  height: 50px;
`;

const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 85%;
  border-collapse: collapse;
  align-items: center;
  padding: 20px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
`;
const Thead = styled.thead``;
const Tr = styled.tr``;
const Tbody = styled.tbody``;

const TableHeader = styled.th`
  text-align: center;
  padding: 15px;
  background-color: #8282828a;
  color: #000;
  border: 1px solid #000;
  width: 80px;
`;

const TableData = styled.td`
  border: 1px solid #000;
  padding: 10px;
  text-align: center;
  position: relative;
`;

const WeekendCell = styled(TableData)`
  background-color: #f9dedc;
`;

const TimeSlot = styled(TableData)`
  width: 80px;
  background-color: #f2f2f2;
`;

const CheckInput = styled.input`
  width: 50%;
  height: 70%;
  position: absolute;
  top: 15%;
  left: 25%;
  cursor: pointer;
`;
