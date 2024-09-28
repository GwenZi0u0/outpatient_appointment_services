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
import { filterRegistrationDataByCurrentDate } from "../utils/dateUtils";
// K789456444
// A123456789

const useProgressStore = create((set) => ({
  idNumber: "A112234456",
  setIdNumber: (idNumber) => set({ idNumber }),
  error: "",
  setError: (error) => set({ error }),
  isOpened: false,
  setIsOpened: (isOpened) => set({ isOpened }),
}));

export default function ProgressPage() {
  const { idNumber, setIdNumber, error, setError, isOpened, setIsOpened } =
    useProgressStore();
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

  const mockDatabase = useMemo(() => 
    registrationData?.filter(
      (data) =>
        data.personal_id_number === idNumber && data.status === "confirmed"
    ),
    [registrationData, idNumber]
  );

  const result = useMemo(() => 
    filterRegistrationDataByCurrentDate(mockDatabase),
    [mockDatabase]
  );

  const handleInputChange = useCallback((e) => {
    setIdNumber(e.target.value.toUpperCase());
  }, [setIdNumber]);

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
    </MainContainer>
  );
}

const ErrorMessage = styled.p`
  color: red;
`;

const MainContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  height: auto;
  min-height: 100vh;
`;

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding-top: 160px;
  background-color: transparent;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
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
