import styled from "styled-components";

export default function SelectTime({
  register,
  department,
  specialty,
  doctor,
  schedule,
  onTimeClick,
}) {
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
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    return dayMap[dayIndex];
  };

  const getMonday = (date) => {
    const day = date.getDay();
    const diff = day === 0 ? -7 : 0 - day;
    return new Date(date.setDate(date.getDate() + diff));
  };

  function formatWeeklyDates(startDate) {
    let formattedDates = [];
    for (let i = 0; i < 28; i++) {
      let currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      let day = currentDate.getDate() + 1;
      let month = currentDate.getMonth() + 1;

      let dayKey = getDayKey(currentDate.getDay());

      formattedDates.push(`${month}/${day} ${daysOfWeek[dayKey]}`);
    }
    let weeks = [];
    for (let i = 0; i < formattedDates.length; i += 7) {
      weeks.push(formattedDates.slice(i, i + 7));
    }

    return weeks;
  }
  const isDisabled = (dateStr) => {
    const [monthDay] = dateStr.split(" (");
    const [month, day] = monthDay.split("/").map(Number);

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    if (month < currentMonth || (month === currentMonth && day <= currentDay)) {
      return true;
    }
    return false;
  };
  const timeSlots = {
    morning: "上午",
    afternoon: "下午",
    evening: "夜間",
  };

  const monday = getMonday(today);
  const weeks = formatWeeklyDates(monday);

  return (
    <>
      <CalendarContainer>
        <ConfirmedContainer>
          <Confirmed>
            <ConfirmedTitle>科別 : </ConfirmedTitle>
            <ConfirmedValue type="text" value={specialty.specialty} readOnly />
          </Confirmed>
          <Confirmed>
            <ConfirmedTitle>醫師 : </ConfirmedTitle>
            <ConfirmedValue
              type="text"
              value={doctor.physician_name}
              readOnly
            />
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
                      {day}
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
                          (schedule) =>
                            schedule.department_id === department.id &&
                            schedule.doctor_id === doctor.uid &&
                            getDayKey(dayIndex) in schedule.shift_rules &&
                            Array.isArray(
                              schedule.shift_rules[getDayKey(dayIndex)]
                            ) &&
                            schedule.shift_rules[getDayKey(dayIndex)].includes(
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
    </>
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
  width: 55px;
`;

const ConfirmedValue = styled.input`
  font-weight: bold;
  height: 50px;
  border: 1px solid #244a8b;
  border-radius: 4px;
  background-color: #8282828a;
  cursor: not-allowed;
  padding-left: 10px;
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
