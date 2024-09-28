import { create } from "zustand";
import { useMemo } from "react";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import {
  fetchDepartmentsData,
  fetchDoctorsData,
  fetchSchedulesData,
  fetchRequestLeaveData,
} from "../api";
import { useAuth } from "../contexts/AuthContext";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { fireDb } from "../firebase";
import {
  timeSlots,
  isDisabled,
  weeks,
  convertToTimestamp,
  dayKeys,
} from "../utils/dateUtils";

const useClassSchedule = create((set) => ({
  selectedDateTimes: [],
  setSelectedDateTimes: (updater) =>
    set((state) => {
      const newSelectedDateTimes = updater(state.selectedDateTimes);
      return { selectedDateTimes: newSelectedDateTimes };
    }),
  toggleDateTime: (firebaseTimestamp, time) =>
    set((state) => {
      const prevState = state.selectedDateTimes;
      const dateIndex = prevState.findIndex((item) =>
        item.date.isEqual(firebaseTimestamp)
      );
      let newState;

      if (dateIndex === -1) {
        newState = [...prevState, { date: firebaseTimestamp, times: [time] }];
      } else {
        const updatedTimes = [...prevState[dateIndex].times];
        const timeIndex = updatedTimes.indexOf(time);

        if (timeIndex === -1) {
          updatedTimes.push(time);
        } else {
          updatedTimes.splice(timeIndex, 1);
        }

        if (updatedTimes.length === 0) {
          newState = prevState.filter(
            (item) => !item.date.isEqual(firebaseTimestamp)
          );
        } else {
          newState = [...prevState];
          newState[dateIndex] = {
            ...newState[dateIndex],
            times: updatedTimes,
          };
        }
      }

      return { selectedDateTimes: newState };
    }),
}));

export default function ClassSchedulePage() {
  const { selectedDateTimes, toggleDateTime } = useClassSchedule();
  const { user } = useAuth();
  const { data: departmentData } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartmentsData,
  });
  const { data: doctorData } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctorsData,
  });
  const { data: scheduleData } = useQuery({
    queryKey: ["schedules"],
    queryFn: fetchSchedulesData,
  });
  const { data: requestLeaveData } = useQuery({
    queryKey: ["request_leave"],
    queryFn: fetchRequestLeaveData,
  });
  const doctor = doctorData?.find((doc) => doc.uid === user.uid) ?? {};
  const department = departmentData?.find(
    (dep) => dep.id === doctor?.division?.division_id
  );
  const specialty =
    department?.specialties.find((specialty) => specialty.id) ?? {};
  const schedule =
    scheduleData?.filter((schedule) => schedule.doctor_id === user.uid) ?? [];
  const requestLeave = requestLeaveData
    ?.filter((item) => item.doctor_id === user.uid)
    ?.flatMap((item) => item.date_times);

  const isLeaveDay = useMemo(() => {
    return weeks
      .map((week) =>
        week.filter((day) =>
          requestLeave?.some(
            (leave) => convertToTimestamp(day).seconds === leave.date.seconds
          )
        )
      )
      .flat();
  }, [weeks, requestLeave]);

  const handleCheckboxClick = (date, time) => {
    if (isDisabled(date)) return;
    const firebaseTimestamp = convertToTimestamp(date);
    toggleDateTime(firebaseTimestamp, time);
  };

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
      toggleDateTime([]);
      window.location.reload();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("提交失敗,請稍後再試");
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
