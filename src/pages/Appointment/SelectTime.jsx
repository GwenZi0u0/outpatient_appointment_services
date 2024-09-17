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

  const formatWeeklyDates = (startDate) => {
    let formattedDates = [];
    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      let day = currentDate.getDate();
      let month = currentDate.getMonth() + 1;

      let dayKey = getDayKey(currentDate.getDay());

      formattedDates.push(`${month}/${day} ${daysOfWeek[dayKey]}`);
    }
    return formattedDates;
  };

  const timeSlots = {
    morning: "上午",
    afternoon: "下午",
    evening: "夜間",
  };

  const monday = getMonday(today);
  const formattedDates = formatWeeklyDates(monday);

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
        <CalendarHeader>
          {/* <Button>上一週</Button>
          <Button>下一週</Button> */}
        </CalendarHeader>
        <TableWrapper>
          <StyledTable>
            <thead>
              <tr>
                <TableHeader></TableHeader>
                {formattedDates.map((day, index) => (
                  <TableHeader
                    key={day}
                    as={index >= 5 ? WeekendCell : undefined}
                  >
                    {day}
                  </TableHeader>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(timeSlots).map(([time, slot]) => (
                <tr key={time}>
                  <TimeSlot>{slot}</TimeSlot>
                  {formattedDates?.map((date, index) => (
                    // console.log(date),
                    <TableData
                      key={index}
                      as={index >= 5 ? WeekendCell : undefined}
                      onClick={() => onTimeClick(date, time)}
                      {...register("date", "time")}
                      defaultValue={date}
                    >
                      {schedule?.find(
                        (schedule) =>
                          schedule.department_id === department.id &&
                          schedule.doctor_id === doctor.id &&
                          getDayKey(index) in schedule.shift_rules &&
                          time === schedule.shift_rules[getDayKey(index)]
                      ) ? (
                        <CheckInput
                          type="radio"
                          name="doctor"
                          defaultValue={time}
                        />
                      ) : null}
                    </TableData>
                  ))}
                </tr>
              ))}
            </tbody>
          </StyledTable>
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

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 30px;
  background-color: #ffffff;
`;

// const Button = styled.button`
//   padding: 5px 10px;
//   background-color: #e0e0e0;
//   border: none;
//   cursor: pointer;
// `;

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
`;

const TableWrapper = styled.div`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  padding: 15px;
  background-color: #8282828a;
  color: #000;
  text-align: left;
  border: 1px solid #000;
`;

const TableData = styled.td`
  border: 1px solid #000;
  padding: 10px;
  text-align: center;
`;

const WeekendCell = styled(TableData)`
  background-color: #f9dedc;
`;

const TimeSlot = styled(TableData)`
  width: 80px;
  background-color: #f2f2f2;
`;

const CheckInput = styled.input`
  position: absolute;
`;
