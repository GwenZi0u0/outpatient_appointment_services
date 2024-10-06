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
                      defaultValue={date}
                      {...register("date")}
                    >
                      {schedule?.find(
                        (scheduleItem) =>
                          scheduleItem.department_id === department.id &&
                          scheduleItem.doctor_id === doctor.uid &&
                          dayKeys[dayIndex] in scheduleItem.shift_rules &&
                          Array.isArray(
                            scheduleItem.shift_rules[dayKeys[dayIndex]]
                          ) &&
                          scheduleItem.shift_rules[dayKeys[dayIndex]].includes(
                            time
                          )
                      ) ? (
                        <CheckInput
                          type="radio"
                          name="doctor"
                          defaultValue={time}
                          onClick={() => onTimeClick(date, time)}
                          {...register("time")}
                          disabled={isDisabled(date)}
                        />
                      ) : null}
                    </TableData>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </StyledTable>
        ))}
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
  padding: 24px 30px;
`;

const Confirmed = styled.div`
  display: flex;
  flex-direction: row;
  width: 40%;
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
  cursor: not-allowed;
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
  text-align: left;
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
`;
