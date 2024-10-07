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
import {
  collection,
  addDoc,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { fireDb } from "../firebase";
import {
  timeSlots,
  isDoctorDisabled,
  doctorWeeks,
  convertToTimestamp,
  dayKeys,
} from "../utils/dateUtils";
import { PopUp } from "../components/PopUp";

const useClassSchedule = create((set) => ({
  selectedDateTimes: [],
  leaveDayToCancel: [],
  showPopup: false,
  popupMessage: "",
  confirmMessage: "",
  setShowPopup: (show) => set({ showPopup: show }),
  setPopupMessage: (message) => set({ popupMessage: message }),
  setConfirmMessage: (message) => set({ confirmMessage: message }),
  setLeaveDayToCancel: (days) => set({ leaveDayToCancel: days }),
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
  const {
    selectedDateTimes,
    toggleDateTime,
    showPopup,
    popupMessage,
    leaveDayToCancel,
    setShowPopup,
    setPopupMessage,
    setLeaveDayToCancel,
    confirmMessage,
    setConfirmMessage,
  } = useClassSchedule();

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
  const { data: requestLeaveData, refetch: refetchRequestLeaveData } = useQuery(
    {
      queryKey: ["request_leave"],
      queryFn: fetchRequestLeaveData,
    }
  );
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
    return doctorWeeks
      .map((week) =>
        week.filter((day) =>
          requestLeave?.some(
            (leave) => convertToTimestamp(day).seconds === leave.date.seconds
          )
        )
      )
      .flat();
  }, [doctorWeeks, requestLeave]);

  const handleCheckboxClick = (date, time) => {
    if (isDoctorDisabled(date)) return;
    const firebaseTimestamp = convertToTimestamp(date);
    toggleDateTime(firebaseTimestamp, time);
  };

  const handleSubmit = () => {
    setConfirmMessage("確定要休診嗎？");
    setShowPopup(true);
  };

  const handleConfirm = async () => {
    try {
      if (confirmMessage === "確定要休診嗎？") {
        const results = {
          create_time: Timestamp.now(),
          doctor_id: user.uid,
          date_times: selectedDateTimes,
        };

        await addDoc(collection(fireDb, "request_leave"), results);
        toggleDateTime([]);
        setPopupMessage("提交成功");
      } else if (confirmMessage === "確定要撤回這個休診申請嗎？") {
        const firebaseTimestamp = leaveDayToCancel.date;
        const findDoctor = requestLeaveData?.filter(
          (item) => item.doctor_id === user.uid
        );
        const matchingLeaveDays = findDoctor
          ?.flatMap((item) =>
            item.date_times.map((dateTime) => ({ ...dateTime, id: item.id }))
          )
          .filter(
            (dateTime) =>
              dateTime && dateTime.date.seconds === firebaseTimestamp.seconds
          );

        if (matchingLeaveDays.length > 0) {
          const leaveDayId = matchingLeaveDays[0].id;
          await deleteDoc(doc(fireDb, "request_leave", leaveDayId));
          setPopupMessage("休診申請已撤回");
        }
      }

      await refetchRequestLeaveData();
    } catch (error) {
      console.error("Error: ", error);
      setPopupMessage("操作失敗,請稍後再試");
    } finally {
      setConfirmMessage("");
      setShowPopup(true);
    }
  };

  const handleLeaveDayClick = (date, time) => {
    const firebaseTimestamp = convertToTimestamp(date);
    setLeaveDayToCancel({ date: firebaseTimestamp, time });
    setConfirmMessage("確定要撤回這個休診申請嗎？");
    setShowPopup(true);
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
        <HintContainer>
          <Hint>
            <HintTitle>排診注意事項</HintTitle>
            <HintContent>
              病患可預約時間為4周內，如需休診請於開放病患可預約時間前2天提出申請。
            </HintContent>
          </Hint>
        </HintContainer>
        <TableWrapper>
          {doctorWeeks.map((week, weekIndex) => (
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
                            ].includes(time)
                        ) ? (
                          isLeaveDay.includes(date) ? (
                            <LeaveDay
                              onClick={isDoctorDisabled(date) ? undefined : () => handleLeaveDayClick(date, time)}
                              isDisabled={isDoctorDisabled(date)}
                            >
                              休
                            </LeaveDay>
                          ) : isDoctorDisabled(date) ? (
                            <DisabledDay>
                              <CheckInput
                                type="checkbox"
                                name="doctor"
                                onChange={() => handleCheckboxClick(date, time)}
                                disabled={true}
                              />
                              <DisabledOverlay>診</DisabledOverlay>
                            </DisabledDay>
                          ) : (
                            <CheckInput
                              type="checkbox"
                              name="doctor"
                              onChange={() => handleCheckboxClick(date, time)}
                              disabled={false}
                            />
                          )
                        ) : (
                          "X"
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
      {showPopup && (
        <PopUp>
          <PopupContent>
            {confirmMessage ? (
              <>
                <PopupMessage>{confirmMessage}</PopupMessage>
                <ButtonGroup>
                  <ConfirmButton onClick={handleConfirm}>確定</ConfirmButton>
                  <CancelButton onClick={() => setShowPopup(false)}>
                    取消
                  </CancelButton>
                </ButtonGroup>
              </>
            ) : (
              <>
                <PopupMessage>{popupMessage}</PopupMessage>
                <CloseButton onClick={() => setShowPopup(false)}>
                  關閉
                </CloseButton>
              </>
            )}
          </PopupContent>
        </PopUp>
      )}
    </>
  );
}

const HintContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 85%;
  padding: 20px;
`;

const Hint = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  border: 5px dashed #b7c3da;
  border-radius: 10px;
  background-color: #ffc18849;
  gap: 10px;
`;

const HintTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2.5px;
`;

const HintContent = styled.div`
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 2.5px;
`;

const LeaveDay = styled.div`
  background-color: #ffc288;
  color: #244a8b;
  font-weight: 700;
  padding: 2px;
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};
  &:hover {
    background-color: ${({ isDisabled }) => (isDisabled ? '#ffc288' : '#244a8b')};
    color: ${({ isDisabled }) => (isDisabled ? '#244a8b' : '#fff')};
  }
`;

const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const BaseButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
`;

const ConfirmButton = styled(BaseButton)`
  background-color: #244a8b;
  color: white;
  &:hover {
    background-color: #1c3a6e;
  }
`;

const PopupMessage = styled.p`
  font-size: 20px;
  font-weight: 500;
`;

const CancelButton = styled(BaseButton)`
  background-color: #f0f0f0;
  color: #333;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const CloseButton = styled(BaseButton)`
  background-color: #244a8b;
  color: white;
  &:hover {
    background-color: #1c3a6e;
  }
`;

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ccc;
  padding: 100px 200px 20px;
  @media (max-width: 1440.1px) {
    padding: 100px 150px 20px;
  }
  @media (max-width: 1280.1px) {
    padding: 100px 100px 20px;
  }
  @media (max-width: 1024.1px) {
    padding: 100px 50px 20px;
  }
  @media (max-width: 768.1px) {
    padding: 100px 0px 20px;
  }
`;

const ConfirmedContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 20px 30px;
  width: 85%;
`;

const Confirmed = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  font-size: 20px;
`;

const ConfirmedTitle = styled.div`
  display: flex;
  font-weight: bold;
  letter-spacing: 2.5px;
  width: auto;
`;

const Button = styled.button`
  background-color: #00b1c1de;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  width: 500px;
  height: 50px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 5.5px;
  cursor: pointer;
  &:hover {
    background-color: #00b1c1;
  }
`;

const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 85%;
  border-collapse: collapse;
  align-items: center;
  padding: 20px;
  font-size: 20px;
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
  background-color: #b7c3da;
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

  &:checked {
    background-color: #ffc288;
  }
`;

const DisabledDay = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const DisabledOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666;
  font-size: 20px;
  font-weight: 700;
`;
