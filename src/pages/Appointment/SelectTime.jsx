import { useState } from "react";
import styled from "styled-components";
import { timeSlots, weeks, isDisabled, dayKeys } from "../../utils/dateUtils";

export default function SelectTime({
  register,
  department,
  specialty,
  doctor,
  schedule,
  onTimeClick,
}) {
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const handleTimeSelection = (date, time) => {
    setSelectedDateTime({ date, time });
  };

  const handleNextStep = () => {
    if (selectedDateTime) {
      onTimeClick(selectedDateTime.date, selectedDateTime.time);
    }
  };
  return (
    <CalendarContainer>
      <ConfirmedContainer>
        <Confirmed>
          <ConfirmedTitle>科別 : </ConfirmedTitle>
          <ConfirmedValue>{specialty.specialty}</ConfirmedValue>
        </Confirmed>
        <Confirmed>
          <ConfirmedTitle>醫師 : </ConfirmedTitle>
          <ConfirmedValue>{doctor.physician_name}</ConfirmedValue>
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
                    isLastHeader={dayIndex === week.length - 1}
                  >
                    {day.slice(5)}
                  </TableHeader>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {Object.entries(timeSlots).map(
                ([time, slot], rowIndex, array) => (
                  <Tr key={time}>
                    <TimeSlot>{slot}</TimeSlot>
                    {week.map((date, dayIndex) => (
                      <TableData
                        key={`${weekIndex}-${dayIndex}`}
                        as={dayIndex >= 5 ? WeekendCell : undefined}
                        defaultValue={date}
                        {...register("date")}
                        isLastRow={rowIndex === array.length - 1}
                        isLastCell={dayIndex === week.length - 1}
                      >
                        {schedule?.find(
                          (scheduleItem) =>
                            scheduleItem.department_id === department.id &&
                            scheduleItem.doctor_id === doctor.uid &&
                            dayKeys[dayIndex] in scheduleItem.shift_rules &&
                            Array.isArray(
                              scheduleItem.shift_rules[dayKeys[dayIndex]]
                            ) &&
                            scheduleItem.shift_rules[
                              dayKeys[dayIndex]
                            ].includes(time)
                        ) ? (
                          <CheckInput
                            type="radio"
                            name="time"
                            defaultValue={time}
                            onClick={() => handleTimeSelection(date, time)}
                            {...register("time")}
                            disabled={isDisabled(date)}
                            checked={
                              selectedDateTime &&
                              selectedDateTime.date === date &&
                              selectedDateTime.time === time
                            }
                          />
                        ) : null}
                      </TableData>
                    ))}
                  </Tr>
                )
              )}
            </Tbody>
          </StyledTable>
        ))}
        <ButtonContainer>
          <Button onClick={handleNextStep} disabled={!selectedDateTime}>
            下一步
          </Button>
        </ButtonContainer>
      </TableWrapper>
    </CalendarContainer>
  );
}

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
`;

const ConfirmedContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 24px 30px 0;
`;

const Confirmed = styled.div`
  display: flex;
  flex-direction: row;
  width: 40%;
  cursor: default;
`;

const ConfirmedTitle = styled.div`
  display: flex;
  align-items: center;
  font-weight: bold;
  width: 80px;
  font-size: 20px;
`;

const ConfirmedValue = styled.span`
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  height: 50px;
  border-radius: 4px;
  background-color: transparent;
  padding-left: 10px;
  width: 100%;
`;

const TableWrapper = styled.div`
  width: 100%;
  border-collapse: collapse;
  padding: 20px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 20px;
`;
const Thead = styled.thead``;

const Tr = styled.tr`
  &:first-child {
    th:first-child {
      border-top-left-radius: 10px;
    }
    th:last-child {
      border-top-right-radius: 10px;
    }
  }
  &:last-child {
    td:first-child {
      border-bottom-left-radius: 10px;
    }
  }
`;

const Tbody = styled.tbody`
  border-radius: 0 0 10px 10px;
`;

const TableHeader = styled.th`
  font-size: 18px;
  letter-spacing: 0.5px;
  text-align: center;
  padding: 15px;
  background-color: #b7c3da63;
  color: #000;
  border: 1px solid #8282828a;
  width: 80px;
  ${({ isLastHeader }) => isLastHeader && "border-top-right-radius: 10px;"}
`;

const TableData = styled.td`
  font-size: 18px;
  letter-spacing: 0.5px;
  border: 1px solid #8282828a;
  padding: 10px;
  text-align: center;
  position: relative;
  ${({ isLastRow, isLastCell }) => `
    ${isLastRow && isLastCell ? "border-bottom-right-radius: 10px;" : ""}
  `}
`;

const WeekendCell = styled(TableData)`
  background-color: #f9dedc;
`;

const TimeSlot = styled(TableData)`
  width: 80px;
  background-color: #f2f2f2;
`;

const CheckInput = styled.input`
  appearance: none;
  width: 24px;
  height: 24px;
  border: 2px solid #b7c3da;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.2s ease-in-out;

  &:checked {
    background-color: #0267b5;
    border-color: #0267b5;
  }

  &:checked::after {
    content: "";
    position: absolute;
    top: 48.2%;
    left: 48.2%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: white;
  }

  &:hover {
    box-shadow: 0 0 5px rgba(2, 103, 181, 0.5);
  }

  &:disabled {
    border-color: #ccc;
    background-color: #f0f0f0;
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:disabled::before {
    content: "\\2716";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 20px;
    color: #999;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px 0;
`;

const Button = styled.button`
  border-radius: 15px;
  font-size: 20px;
  letter-spacing: 1.5px;
  color: #ffffff;
  opacity: 0.8;
  background-color: #0267b5;
  width: 200px;
  height: 50px;
  border: none;
  &:hover {
    opacity: 1;
    background-color: #0267b5;
    box-shadow: 0 0 5px 0 #000;
  }
`;
