import { create } from "zustand";
import styled from "styled-components";
import { useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchRegistrationData,
  fetchDepartmentsData,
  fetchDoctorsData,
  fetchSchedulesData,
} from "../api";
import { doc, updateDoc } from "firebase/firestore";
import { fireDb } from "../firebase";
import {
  timeSlots,
  formatFirestoreTimestamp,
  filterRegistrationDataByCurrentDate,
} from "../utils/dateUtils";

const useCancelRegistrationStore = create((set) => ({
  idNumber: "K789456444",
  error: "",
  isOpened: false,
  mockDatabase: [],
  setIdNumber: (value) => set({ idNumber: value }),
  setError: (value) => set({ error: value }),
  setIsOpened: (value) => set({ isOpened: value }),
  setMockDatabase: (value) => set({ mockDatabase: value }),
}));

export default function CancelRegistrationPage() {
  const {
    idNumber,
    isOpened,
    mockDatabase,
    setIdNumber,
    setError,
    setIsOpened,
    setMockDatabase,
  } = useCancelRegistrationStore();

  const { data: registrationData, error } = useQuery({
    queryKey: ["registrations"],
    queryFn: fetchRegistrationData,
  });

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

  const updateMockDatabase = useCallback(() => {
    const filteredData = registrationData?.filter(
      (data) =>
        data.personal_id_number === idNumber && data.status === "confirmed"
    );

    if (JSON.stringify(filteredData) !== JSON.stringify(mockDatabase)) {
      setMockDatabase(filteredData);
    }
  }, [idNumber, registrationData, mockDatabase, setMockDatabase]);

  useEffect(() => {
    updateMockDatabase();
  }, [updateMockDatabase]);

  const result = useMemo(
    () => filterRegistrationDataByCurrentDate(mockDatabase),
    [mockDatabase]
  );

  const matchedIdNumber = useMemo(
    () => mockDatabase?.map((data) => data.personal_id_number),
    [mockDatabase]
  );

  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value.toUpperCase();
      setIdNumber(value);
    },
    [setIdNumber]
  );

  const handleSearch = useCallback(() => {
    const regex = /^[A-Z]{1}[0-9]{9}$/;
    if (!idNumber.match(regex) || !matchedIdNumber.includes(idNumber)) {
      setError("查無此身分證號碼");
      setIsOpened(false);
    } else {
      setError("");
      setIsOpened(true);
    }
  }, [idNumber, matchedIdNumber, setError, setIsOpened]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleCancel = useCallback(
    async (confirmData) => {
      if (window.confirm("確定要取消掛號嗎？")) {
        try {
          const docRef = doc(
            fireDb,
            "registrations",
            mockDatabase[confirmData].id
          );
          await updateDoc(docRef, {
            status: "cancelled",
          });
          // refresh(["registrations"]);
          alert("掛號已取消");
        } catch (error) {
          console.error("Error updating document: ", error);
          alert("取消掛號時出現錯誤，請稍後再試。");
        }
      }
    },
    [mockDatabase]
  );

  return (
    <MainContainer>
      <Container>
        <Title>查詢/取消你的掛號</Title>
        <Label htmlFor="idNumberInput">身分證號碼查詢</Label>
        <Input
          id="idNumberInput"
          name="idNumber"
          type="text"
          placeholder="請輸入身分證號碼"
          maxLength={10}
          value={idNumber}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {isOpened && (
          <Table $isOpened={isOpened}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>科別</TableHeaderCell>
                <TableHeaderCell>日期</TableHeaderCell>
                <TableHeaderCell>時段</TableHeaderCell>
                <TableHeaderCell>診間號碼</TableHeaderCell>
                <TableHeaderCell>醫師</TableHeaderCell>
                <TableHeaderCell>看診號</TableHeaderCell>
                <TableHeaderCell>掛號狀態</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {result.length > 0 ? (
                result?.map((data, index) => {
                  const doctor = doctorData.find(
                    (doctor) => doctor.uid === data.doctor_id
                  );
                  const department = departmentData.find(
                    (department) =>
                      department.id === data.division.department_id
                  );
                  const specialtyData = department.specialties.find(
                    (specialty) => specialty.id === data.division.specialty_id
                  );
                  const schedule = scheduleData.find(
                    (schedule) => schedule.doctor_id === data.doctor_id
                  );

                  return (
                    <TableRow key={index}>
                      <TableCell>{specialtyData?.specialty || ""}</TableCell>
                      <TableCell>
                        {formatFirestoreTimestamp(data.OPD_date).slice(5)}
                      </TableCell>
                      <TableCell>
                        {timeSlots[data.appointment_timeslot] || ""}
                      </TableCell>
                      <TableCell>{schedule?.room || ""}</TableCell>
                      <TableCell>{doctor?.physician_name || ""}</TableCell>
                      <TableCell>{data.registration_number || ""}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleCancel(index)}>
                          取消
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>查無掛號資料</TableCell>
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
  align-items: center;
  flex-direction: column;
  padding-top: 160px;
  background-color: transparent;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #000000;
  margin-bottom: 20px;
  letter-spacing: 10.4px;
`;

const Input = styled.input.attrs((props) => ({
  id: props.id,
  name: props.name,
}))`
  width: 300px;
  height: 50px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #000000;
  border-radius: 5px;
  margin-bottom: 20px;
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
`;

const Table = styled.table`
  display: ${(props) => (props.$isOpened ? "table" : "none")};
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;
`;

const TableHeader = styled.thead`
  background-color: gray;
  color: white;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const TableCell = styled.td`
  padding: 8px;
  border: 1px solid #ddd;
`;

const TableHeaderCell = styled(TableCell).attrs({ as: "th" })`
  font-weight: bold;
`;

const Button = styled.button`
  background-color: #e0e0e0;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  &:hover {
    background-color: #d0d0d0;
  }
`;
