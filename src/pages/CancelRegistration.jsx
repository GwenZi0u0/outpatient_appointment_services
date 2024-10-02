import { create } from "zustand";
import styled from "styled-components";
import { useEffect } from "react";
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
  result: [],
  setIdNumber: (value) => set({ idNumber: value }),
  setError: (value) => set({ error: value }),
  setIsOpened: (value) => set({ isOpened: value }),
  setMockDatabase: (value) => set({ mockDatabase: value }),
  setResult: (value) => set({ result: value }),
}));

export default function CancelRegistrationPage() {
  const {
    idNumber,
    isOpened,
    mockDatabase,
    result,
    setIdNumber,
    setError,
    setIsOpened,
    setMockDatabase,
    setResult,
  } = useCancelRegistrationStore();

  const {
    data: registrationData,
    error,
    refetch: refetchRegistrationData,
  } = useQuery({
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

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setIdNumber(value);
  };

  const handleSearch = async () => {
    const regex = /^[A-Z]{1}[0-9]{9}$/;
    if (!idNumber.match(regex) || idNumber.length !== 10) {
      setError("身分證號碼格式不正確");
      setIsOpened(false);
      setMockDatabase([]);
    } else {
      setError("");
      const filteredData = registrationData?.filter(
        (data) =>
          data.personal_id_number === idNumber && data.status === "confirmed"
      );
      if (filteredData && filteredData.length > 0) {
        setMockDatabase(filteredData);
        setIsOpened(true);
      } else {
        setError("查無此身分證號碼的掛號資料");
        setIsOpened(false);
        setMockDatabase([]);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCancel = async (confirmData) => {
    if (window.confirm("確定要取消掛號嗎？")) {
      try {
        if (
          !mockDatabase ||
          !Array.isArray(mockDatabase) ||
          confirmData < 0 ||
          confirmData >= mockDatabase.length
        ) {
          throw new Error("無效的掛號數據");
        }

        const registrationToCancel = mockDatabase[confirmData];
        if (!registrationToCancel || !registrationToCancel.id) {
          throw new Error("找不到要取消的掛號記錄");
        }

        const docRef = doc(fireDb, "registrations", registrationToCancel.id);

        await updateDoc(docRef, {
          status: "cancelled",
        });
        const updatedMockDatabase = mockDatabase.filter(
          (_, index) => index !== confirmData
        );
        setMockDatabase(updatedMockDatabase);
        await refetchRegistrationData();

        alert("掛號已取消");
      } catch (error) {
        console.error("取消掛號時出現錯誤：", error);
        alert(`取消掛號時出現錯誤：${error.message}`);
      }
    }
  };

  useEffect(() => {
    if (Array.isArray(mockDatabase)) {
      const filteredResult = filterRegistrationDataByCurrentDate(mockDatabase);
      setResult(filteredResult);
    }
  }, [mockDatabase]);

  return (
    <MainContainer>
      <Container>
        <Title>查詢/取消你的掛號</Title>
        <SearchContainer>
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
        </SearchContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {isOpened && (
          <Table $isOpened={isOpened}>
            <TableHeader>
              <TableHeaderRow>
                <TableHeaderCell>科別</TableHeaderCell>
                <TableHeaderCell>日期</TableHeaderCell>
                <TableHeaderCell>時段</TableHeaderCell>
                <TableHeaderCell>診間號碼</TableHeaderCell>
                <TableHeaderCell>醫師</TableHeaderCell>
                <TableHeaderCell>看診號</TableHeaderCell>
                <TableHeaderCell>掛號狀態</TableHeaderCell>
              </TableHeaderRow>
            </TableHeader>
            <Tbody>
              {result.length > 0 ? (
                result
                  .sort((a, b) => a.OPD_date.toDate() - b.OPD_date.toDate())
                  .map((data, index) => {
                    const doctor = doctorData?.find(
                      (doctor) => doctor.uid === data.doctor_id
                    );
                    const department = departmentData?.find(
                      (department) =>
                        department.id === data.division.department_id
                    );
                    const specialtyData = department?.specialties.find(
                      (specialty) => specialty.id === data.division.specialty_id
                    );
                    const schedule = scheduleData?.find(
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
            </Tbody>
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
    padding: 80px 50px 40px;
  }
  @media (max-width: 480.1px) {
    padding: 80px 20px 40px;
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
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
  flex-direction: column;
  align-items: center;
  font-weight: 700;
  width: 100%;
  gap: 20px;
  @media (max-width: 1024.1px) {
    align-items: center;
  }
`;

const Label = styled.label`
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 10.4px;
  /* padding-left: 35px; */
  @media (max-width: 1440.1px) {
    font-size: 24px;
  }
  @media (max-width: 1024.1px) {
    font-size: 20px;
    letter-spacing: 7.2px;
    /* padding-left: 0; */
  }
`;

const Input = styled.input`
  width: 500px;
  height: 50px;
  padding: 10px;
  font-size: 18px;
  border: 1px solid #cccccc;
  border-radius: 5px;
  margin-left: 35px;
  &:focus {
    outline: none;
    border: 2px solid #244a8b;
  }
  @media (max-width: 1024.1px) {
    width: 300px;
    margin-left: 0;
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
  background-color: #00b0c1;
  color: white;
  height: 93px;
  border-radius: 10px;
`;

const TableHeaderRow = styled.tr`
  background-color: #00b0c1;
  height: 80px;
  border-radius: 10px;
`;

const TableRow = styled.tr`
  background-color: #ffffff;
  height: 80px;
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
  @media (max-width: 768.1px) {
    letter-spacing: 3.3px;
  }
`;

const TableHeaderCell = styled(TableCell).attrs({ as: "th" })`
  text-align: center;
  font-weight: 600;
  border: none;
  padding: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 11.4px;
  width: auto;
  @media (max-width: 1440.1px) {
    font-size: 24px;
  }
  @media (max-width: 1024.1px) {
    font-size: 22px;
    letter-spacing: 8.8px;
  }
  @media (max-width: 768.1px) {
    font-size: 20px;
    letter-spacing: 6.4px;
  }
  @media (max-width: 480.1px) {
    font-size: 18px;
    letter-spacing: 4.8px;
  }
`;

const Button = styled.button`
  color: white;
  background-color: #b7c3da;
  border: none;
  border-radius: 30px;
  padding: 12px 25px;
  font-size: 18px;
  letter-spacing: 5.6px;
  box-shadow: 0px 5px 5px 0px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  &:hover {
    background-color: #0052a3;
  }
  @media (max-width: 1024.1px) {
    font-size: 16px;
    letter-spacing: 4.8px;
    padding: 10px 20px;
  }
`;
