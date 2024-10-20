import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { create } from "zustand";
import {
  fetchDepartmentsData,
  fetchDoctorsData,
  fetchProgressData,
  fetchRegistrationData,
  fetchSchedulesData,
} from "../api";
import {
  filterRegistrationDataByCurrentDate,
  getToday,
} from "../utils/dateUtils";

const useProgressStore = create((set) => ({
  idNumber: "",
  error: "",
  isOpened: false,
  visibleRows: 5,
  setIdNumber: (idNumber) => set({ idNumber }),
  setError: (error) => set({ error }),
  setIsOpened: (isOpened) => set({ isOpened }),
  setVisibleRows: (visibleRows) => set({ visibleRows }),
  resetState: () =>
    set({
      idNumber: "",
      error: "",
      isOpened: false,
      visibleRows: 5,
    }),
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
    resetState,
  } = useProgressStore();

  const location = useLocation();

  useEffect(() => {
    return () => resetState();
  }, [location, resetState]);

  const { data: departmentData } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartmentsData,
    staleTime: 5 * 60 * 1000,
  });

  const { data: doctorData } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctorsData,
    staleTime: 5 * 60 * 1000,
  });

  const { data: scheduleData } = useQuery({
    queryKey: ["schedules"],
    queryFn: fetchSchedulesData,
    staleTime: 5 * 60 * 1000,
  });

  const { data: registrationData } = useQuery({
    queryKey: ["registration"],
    queryFn: fetchRegistrationData,
    staleTime: 5 * 60 * 1000,
  });

  const { data: progressData, refetch: refetchProgressData } = useQuery({
    queryKey: ["progress"],
    queryFn: fetchProgressData,
    refetchInterval: 5000,
    staleTime: 0,
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

  const handleInputChange = (e) => {
    setIdNumber(e.target.value.toUpperCase());
    setError("");
    setIsOpened(false);
  };

  const handleSearch = async () => {
    if (!idNumber.trim()) {
      setError("請輸入身分證號碼");
      setIsOpened(false);
      return;
    }
    const regex = /^[A-Z]{1}[0-9]{9}$/;
    if (
      !idNumber.match(regex) ||
      !mockDatabase.some((data) => data.personal_id_number === idNumber)
    ) {
      setError("查無此身分證號碼");
      setIsOpened(false);
      return;
    } else {
      setError("");
      setIsOpened(true);
      await refetchProgressData();
    }
  };

  const handleKeyDown = (e, registrationData) => {
    if (e.key === "Enter") {
      e.preventDefault();
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
        <Title>你的今日門診進度</Title>
        <SearchContainer>
          <Label htmlFor="idNumberInput">身分證號碼查詢 </Label>
          <SearchFrame>
            <InputWrapper>
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
              <SearchButton onClick={handleSearch}>搜尋</SearchButton>
            </InputWrapper>
            <Hint>A123456789 / M114576287 / C201027260 / S205751804</Hint>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </SearchFrame>
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
            <Tbody>
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
            </Tbody>
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

const ErrorMessage = styled.span`
  color: red;
  font-weight: 400;
  letter-spacing: 5.6px;
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
    padding: 80px 80px 40px;
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
  width: auto;
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  letter-spacing: 9.6px;
  @media (max-width: 1440.1px) {
    font-size: 28px;
  }
  @media (max-width: 1024.1px) {
    font-size: 25px;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  font-weight: 700;
  width: 100%;
  gap: 20px;
  @media (max-width: 1024.1px) {
    align-items: center;
    flex-direction: column;
    gap: 20px;
  }
`;

const SearchFrame = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  width: 65%;
  gap: 10px;
  @media (max-width: 1024.1px) {
    width: 90%;
    padding-left: 15px;
  }
  @media (max-width: 768.1px) {
    width: 100%;
  }
  @media (max-width: 480.1px) {
    align-items: flex-start;
    padding-left: 0;
  }
`;

const Hint = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #666666;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  @media (max-width: 480.1px) {
    width: 90%;
  }
`;

const SearchButton = styled.button`
  background-color: #00b0c1;
  color: white;
  border: none;
  border-radius: 10px;
  width: 100px;
  height: 50px;
  padding: 0px 20px;
  font-size: 18px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1c3a6e;
  }

  @media (max-width: 1024.1px) {
    font-size: 18px;
  }
`;

const Input = styled.input`
  width: 100%;
  height: 50px;
  padding: 10px;
  font-size: 20px;
  border: 1px solid #cccccc;
  border-radius: 10px;
  &:focus {
    outline: none;
    border: 2px solid #244a8b;
  }
  @media (max-width: 1024.1px) {
    font-size: 18px;
  }
`;

const Label = styled.label`
  display: flex;
  width: auto;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 8.4px;
  margin-bottom: 15px;
  @media (max-width: 1440.1px) {
    font-size: 24px;
  }
  @media (max-width: 1024.1px) {
    font-size: 22px;
    letter-spacing: 7.2px;
    padding-left: 0;
    margin-top: 0;
  }
`;

const Table = styled.table`
  display: ${(props) => (props.$isOpened ? "table" : "none")};
  width: 100%;
  border-collapse: collapse;
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
  background-color: #0267b5;
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
