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
            <TableHeader $bgColor={false}>
              <TableHeaderRow>
                <TableHeaderCell $CellWidth={"auto"}>科別</TableHeaderCell>
                <TableHeaderCell $CellWidth={"20%"}>診間號碼</TableHeaderCell>
                <TableHeaderCell $CellWidth={"20%"}>醫師</TableHeaderCell>
                <TableHeaderCell $CellWidth={"20%"}>看診號</TableHeaderCell>
                <TableHeaderCell $CellWidth={"20%"}>看診進度</TableHeaderCell>
              </TableHeaderRow>
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
          <TableHeader $bgColor={true}>
            <TableHeaderRow>
              <TableHeaderCell $CellWidth={"40%"}>科別</TableHeaderCell>
              <TableHeaderCell $CellWidth={"20%"}>診間號碼</TableHeaderCell>
              <TableHeaderCell $CellWidth={"20%"}>醫師</TableHeaderCell>
              <TableHeaderCell $CellWidth={"20%"}>看診進度</TableHeaderCell>
            </TableHeaderRow>
          </TableHeader>
          <Tbody>
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
          </Tbody>
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
  padding: 80px 316px 40px;
  gap: 80px;
  @media (max-width: 1440.1px) {
    padding: 80px 200px 40px;
  }
  @media (max-width: 1280.1px) {
    padding: 80px 180px 40px;
  }
  @media (max-width: 1024.1px) {
    padding: 80px 150px 40px;
  }
  @media (max-width: 768.1px) {
    padding: 80px 100px 40px;
  }
  @media (max-width: 480.1px) {
    padding: 80px 50px 40px;
  }
`;

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  background-color: transparent;
  width: 100%;
  padding-top: 84px;
  gap: 40px;
  @media (max-width: 1024.1px) {
    align-items: center;
  }
`;

const Title = styled.span`
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  letter-spacing: 9.6px;
  @media (max-width: 1440.1px) {
    font-size: 28px;
  }
  @media (max-width: 1024.1px) {
    font-size: 24px;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  font-weight: 700;
  align-items: center;
  width: 100%;
  gap: 20px;
  @media (max-width: 1024.1px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  width: 73%;
  height: 56px;
  padding: 10px;
  font-size: 20px;
  border: 1px solid #cccccc;
  border-radius: 5px;
  &:focus {
    outline: none;
    border: 2px solid #244a8b;
  }

  @media (max-width: 1440.1px) {
    width: 70%;
  }
  @media (max-width: 1280.1px) {
    width: 67%;
  }
  @media (max-width: 1024.1px) {
    font-size: 18px;
    width: 100%;
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 10.4px;
  padding-left: 35px;
  @media (max-width: 1440.1px) {
    font-size: 24px;
  }
  @media (max-width: 1024.1px) {
    font-size: 20px;
    letter-spacing: 7.2px;
    width: 100%;
    padding-left: 0;
  }
`;

const Table = styled.table`
  display: ${(props) => (props.$isOpened ? "table" : "none")};
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
`;

const Tbody = styled.tbody`
  border: none;
`;

const TableHeader = styled.thead`
  background-color: ${(props) => (props.$bgColor ? "#0267B5" : "#00b0c1")};
  color: white;
  height: 93px;
  border-radius: 10px;
`;

const TableHeaderRow = styled.tr``;

const TableRow = styled.tr`
  background-color: #ffffff;
  height: 75px;
  border-bottom: 1px solid #ddd;
  @media (max-width: 1440.1px) {
    height: 65px;
  }
`;

const TableCell = styled.td`
  text-align: center;
  padding: 8px;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 5.6px;
  @media (max-width: 1440.1px) {
    font-size: 20px;
  }
  @media (max-width: 1024.1px) {
    font-size: 18px;
    letter-spacing: 4.4px;
  }
  @media (max-width: 480.1px) {
    font-size: 16px;
    letter-spacing: 3.3px;
  }
`;

const TableHeaderCell = styled(TableCell).attrs({ as: "th" })`
  text-align: center;
  font-weight: 600;
  border: none;
  padding: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 11.4px;
  width: ${(props) => props.$CellWidth || "auto"};
  @media (max-width: 1440.1px) {
    font-size: 24px;
  }
  @media (max-width: 1024.1px) {
    font-size: 22px;
    letter-spacing: 8.8px;
  }
  @media (max-width: 480.1px) {
    font-size: 20px;
    letter-spacing: 6.4px;
  }
`;

const AllContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  background-color: transparent;
  width: 100%;
  gap: 30px;
  @media (max-width: 1024.1px) {
    align-items: center;
  }
`;

const Button = styled.button`
  display: block;
  height: 75px;
  width: 100%;
  background-color: #0267B5;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 10.4px;
  margin-top: 5px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
  &:hover {
    background-color: #0052a3;
  }
  @media (max-width: 1440.1px) {
    font-size: 24px;
  }
  @media (max-width: 1024.1px) {
    font-size: 22px;
    letter-spacing: 8.8px;
  }
  @media (max-width: 480.1px) {
    font-size: 20px;
    letter-spacing: 6.6px;
    height: 60px;
  }
`;
