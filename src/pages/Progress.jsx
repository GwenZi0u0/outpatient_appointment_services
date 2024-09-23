import styled from "styled-components";
import { useEffect, useState } from "react";
import { refresh, useData } from "../contexts/DataContext";
import { Timestamp } from "firebase/firestore";
// K789456444
// A123456789

export default function ProgressPage() {
  const [idNumber, setIdNumber] = useState("A112234456");
  const [error, setError] = useState("");
  const [isOpened, setIsOpened] = useState(false);
  const { queries } = useData();
  const departmentData = queries[0]?.data || [];
  const doctorData = queries[1]?.data || [];
  const scheduleData = queries[2]?.data || [];
  const registrationData = queries[3]?.data || [];
  const progressData = queries[6]?.data || [];

  const [mockDatabase, setMockDatabase] = useState([]);

  useEffect(() => {
    const filteredData =
      registrationData.filter(
        (data) =>
          data.personal_id_number === idNumber && data.status === "confirmed"
      ) || [];

    if (JSON.stringify(filteredData) !== JSON.stringify(mockDatabase)) {
      setMockDatabase(filteredData);
    }
  }, [registrationData, idNumber, mockDatabase]);

  const getCurrentDateInfo = (data) => {
    const timestamp =
      data instanceof Timestamp ? data : Timestamp.fromDate(data);
    const seconds = timestamp.seconds;
    const dateFromSeconds = new Date(seconds * 1000);

    const year = dateFromSeconds.getFullYear();
    const month = String(dateFromSeconds.getMonth() + 1).padStart(2, "0");
    const day = String(dateFromSeconds.getDate()).padStart(2, "0");
    return [year, month, day];
  };

  const filterRegistrationDataByCurrentDate = (mockDatabase) => {
    const currentDateFormatted = getCurrentDateInfo(new Date());

    const filteredData = mockDatabase.filter((data) => {
      const currentOPDDate = getCurrentDateInfo(data.OPD_date);
      const isDateMatching = currentOPDDate.every(
        (component, index) => component === currentDateFormatted[index]
      );

      const isStatus = data.status === "confirmed";
      refresh();
      return isDateMatching && isStatus;
    });

    return filteredData;
  };

  const result = filterRegistrationDataByCurrentDate(mockDatabase);

  const matchedIdNumber = mockDatabase.map((data) => data.personal_id_number);

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setIdNumber(value);
  };

  const handleSearch = () => {
    const regex = /^[A-Z]{1}[0-9]{9}$/;
    if (!idNumber.match(regex) || !matchedIdNumber.includes(idNumber)) {
      setError("查無此身分證號碼");
      setIsOpened(false);
    } else {
      setError("");
      setIsOpened(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <MainContainer>
      <Container>
        <Title>今日門診進度</Title>
        <Label>身分證號碼查詢 </Label>
        <Input
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
                  <TableCell colSpan={7}>尚未開診</TableCell>
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
  padding-top: 80px;
  background-color: transparent;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #000000;
  margin-bottom: 20px;
  letter-spacing: 9.6px;
`;

const Input = styled.input`
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
  text-align: center;
  padding: 8px;
  border: 1px solid #ddd;
`;

const TableHeaderCell = styled(TableCell).attrs({ as: "th" })`
  text-align: center;
  font-weight: bold;
`;
