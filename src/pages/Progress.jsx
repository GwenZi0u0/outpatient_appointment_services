import { create } from "zustand";
import { useMemo, useCallback } from "react";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import {
  fetchDepartmentsData,
  fetchDoctorsData,
  fetchSchedulesData,
  fetchRegistrationData,
  fetchProgressData,
} from "../api";
import {
  filterRegistrationDataByCurrentDate,
  getToday,
} from "../utils/dateUtils";
// K789456444
// A123456789

const useProgressStore = create((set) => ({
  idNumber: "A112234456",
  error: "",
  isOpened: false,
  visibleRows: 5,
  setIdNumber: (idNumber) => set({ idNumber }),
  setError: (error) => set({ error }),
  setIsOpened: (isOpened) => set({ isOpened }),
  setVisibleRows: (visibleRows) => set({ visibleRows }),
}));

export default function ProgressPage() {
  const {
    idNumber,
    setIdNumber,
    error,
    setError,
    isOpened,
    setIsOpened,
    visibleRows,
    setVisibleRows,
  } = useProgressStore();
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
  const { data: registrationData } = useQuery({
    queryKey: ["registration"],
    queryFn: fetchRegistrationData,
  });
  const { data: progressData } = useQuery({
    queryKey: ["progress"],
    queryFn: fetchProgressData,
  });

  const mockDatabase = useMemo(
    () =>
      registrationData?.filter(
        (data) =>
          data.personal_id_number === idNumber && data.status === "confirmed"
      ),
    [registrationData, idNumber]
  );

  const result = useMemo(
    () => filterRegistrationDataByCurrentDate(mockDatabase),
    [mockDatabase]
  );

  const handleInputChange = useCallback(
    (e) => {
      setIdNumber(e.target.value.toUpperCase());
    },
    [setIdNumber]
  );

  const handleSearch = useCallback(() => {
    const regex = /^[A-Z]{1}[0-9]{9}$/;
    if (
      !idNumber.match(regex) ||
      !mockDatabase.some((data) => data.personal_id_number === idNumber)
    ) {
      setError("查無此身分證號碼");
      setIsOpened(false);
    } else {
      setError("");
      setIsOpened(true);
    }
  }, [idNumber, mockDatabase, setError, setIsOpened]);

  const handleKeyDown = (e, registrationData) => {
    if (e.key === "Enter") {
      handleSearch(registrationData);
    }
  };

  const allAppointmentProgress = useMemo(() => {
    if (!departmentData || !doctorData || !scheduleData || !progressData) {
      return [];
    }

    const today = getToday().daysOfWeek;

    return departmentData.flatMap((department) =>
      doctorData
        .filter((doctor) => doctor.division.division_id === department.id)
        .map((doctor) => {
          const specialty =
            department.specialties?.find(
              (specialty) => specialty.id === doctor.division.specialty_id
            )?.specialty || "";
          const schedule = scheduleData.find(
            (schedule) => schedule.doctor_id === doctor.uid
          );

          if (schedule && schedule.shift_rules) {
            const todayShift = schedule.shift_rules[today];

            if (todayShift) {
              const progressInfo = progressData.find(
                (progress) => progress.doctor_id === doctor.uid
              );
              return {
                department: specialty,
                doctor: doctor.physician_name,
                room: schedule.room,
                status:
                  progressInfo?.number !== null &&
                  progressInfo?.number !== undefined
                    ? progressInfo.number
                    : "未開診",
              };
            }
          }
          return null;
        })
        .filter(Boolean)
    );
  }, [departmentData, doctorData, scheduleData, progressData]);

  return (
    <MainContainer>
      <Container>
        <Title>今日門診進度</Title>
        <SearchContainer>
          <Label htmlFor="idNumberInput">身分證號碼查詢 </Label>
          <Input
            id="idNumberInput"
            name="idNumber"
            type="text"
            placeholder="請輸入身分證號碼"
            maxLength={10}
            value={idNumber}
            onChange={handleInputChange}
            onKeyDown={(e) => handleKeyDown(e, registrationData)}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </SearchContainer>
        {isOpened && (
          <Table $isOpened={isOpened}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>科別</TableHeaderCell>
                <TableHeaderCell>診間號碼</TableHeaderCell>
                <TableHeaderCell>醫師</TableHeaderCell>
                <TableHeaderCell>看診號</TableHeaderCell>
                <TableHeaderCell>看診進度</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {result.length > 0 ? (
                result?.map((data, index) => {
                  const doctor =
                    doctorData?.find(
                      (doctor) => doctor.uid === data.doctor_id
                    ) || {};
                  const department =
                    departmentData?.find(
                      (department) =>
                        department.id === data.division.department_id
                    ) || {};
                  const specialtyData =
                    department.specialties?.find(
                      (specialty) => specialty.id === data.division.specialty_id
                    ) || {};
                  const schedule =
                    scheduleData?.find(
                      (schedule) => schedule.doctor_id === data.doctor_id
                    ) || {};
                  const progress =
                    progressData?.find(
                      (progress) => progress.doctor_id === data.doctor_id
                    ) || {};

                  return (
                    <TableRow key={index}>
                      <TableCell>{specialtyData?.specialty || ""}</TableCell>
                      <TableCell>{schedule?.room || ""}</TableCell>
                      <TableCell>{doctor?.physician_name || ""}</TableCell>
                      <TableCell>{data.registration_number || ""}</TableCell>
                      <TableCell>{progress?.number || "尚未開診"}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>查無資料</TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        )}
      </Container>
      <AllContainer>
        <Title>全院門診看診進度</Title>
        <Table $isOpened={true}>
          <TableHeader>
            <tr>
              <TableHeaderCell>科別</TableHeaderCell>
              <TableHeaderCell>診間號碼</TableHeaderCell>
              <TableHeaderCell>醫師</TableHeaderCell>
              <TableHeaderCell>看診進度</TableHeaderCell>
            </tr>
          </TableHeader>
          <tbody>
            {allAppointmentProgress
              .slice(0, visibleRows)
              .map((appointment, index) => (
                <TableRow key={index}>
                  <TableCell>{appointment.department}</TableCell>
                  <TableCell>{appointment.room}</TableCell>
                  <TableCell>{appointment.doctor}</TableCell>
                  <TableCell>{appointment.status}</TableCell>
                </TableRow>
              ))}
          </tbody>
        </Table>
        {allAppointmentProgress.length > visibleRows && (
          <Button onClick={() => setVisibleRows(visibleRows + 5)}>
            查看更多
          </Button>
        )}
      </AllContainer>
    </MainContainer>
  );
}

const ErrorMessage = styled.p`
  color: red;
`;

const MainContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  height: auto;
  min-height: 100vh;
  padding: 0 350px;
`;

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding-top: 120px;
  background-color: transparent;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 20px;
  letter-spacing: 9.6px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const Input = styled.input.attrs((props) => ({
  id: props.id,
  name: props.name,
}))`
  width: auto;
  height: 50px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #000000;
  border-radius: 5px;
`;

const Label = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 10.4px;
  width: 100%;
  height: 93px;
  padding-left: 35px;
`;

const Table = styled.table`
  display: ${(props) => (props.$isOpened ? "table" : "none")};
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
`;

const TableHeader = styled.thead`
  background-color: #00b0c1;
  color: white;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 10.4px;
  height: 93px;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const TableCell = styled.td`
  text-align: center;
  padding: 8px;
  border: 1px solid #ddd;
`;

const TableHeaderCell = styled(TableCell).attrs({ as: "th" })`
  text-align: center;
  font-weight: bold;
`;

const AllContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding-top: 80px;
  background-color: transparent;
  width: 100%;
`;

const Button = styled.button`
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #0052a3;
  }
`;
