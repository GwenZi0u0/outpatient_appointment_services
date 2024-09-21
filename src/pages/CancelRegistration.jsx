import styled from "styled-components";
import { useEffect, useState } from "react";
import { useData } from "../contexts/DataContext";
import { doc, updateDoc } from "firebase/firestore";
import { fireDb } from "../firebase";


// K789456444

export default function CancelRegistrationPage() {
  const [idNumber, setIdNumber] = useState("K789456444");
  const [error, setError] = useState("");
  const [isOpened, setIsOpened] = useState(false);
  const { queries } = useData();
  const departmentData = queries[0]?.data || [];
  const doctorData = queries[1]?.data || [];
  const scheduleData = queries[2]?.data || [];
  const registrationData = queries[3]?.data || [];

  const timeSlots = {
    morning: "上午",
    afternoon: "下午",
    evening: "夜間",
  };
  const [mockDatabase, setMockDatabase] = useState([]);

  useEffect(() => {
    const filteredData =
      registrationData.filter(
        (data) =>
          data.personal_id_number === idNumber && data.status === "confirmed"
      ) || [];
    setMockDatabase(filteredData);
  }, [registrationData, idNumber]);

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

  const handleCancel = async (confirmData) => {
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

        alert("掛號已取消");
      } catch (error) {
        console.error("Error updating document: ", error);
        alert("取消掛號時出現錯誤，請稍後再試。");
      }
    }
  };

  const formatDate = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === "function") {
      const date = timestamp.toDate();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${month}/${day}`;
    }
    return "";
  };

  return (
    <>
      <MainContainer>
        <Container>
          <Title>查詢/取消你的掛號</Title>
          <Label>身分證號碼查詢</Label>
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
                  <TableHeaderCell>日期</TableHeaderCell>
                  <TableHeaderCell>時段</TableHeaderCell>
                  <TableHeaderCell>診間號碼</TableHeaderCell>
                  <TableHeaderCell>醫師</TableHeaderCell>
                  <TableHeaderCell>看診號</TableHeaderCell>
                  <TableHeaderCell>掛號狀態</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {mockDatabase.length > 0 ? (
                  mockDatabase?.map((data, index) => {
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
                        <TableCell>{specialtyData.specialty || ""}</TableCell>
                        <TableCell>{formatDate(data.OPD_date) || ""}</TableCell>
                        <TableCell>
                          {timeSlots[data.appointment_timeslot] || ""}
                        </TableCell>
                        <TableCell>{schedule.room || ""}</TableCell>
                        <TableCell>{doctor.physician_name || ""}</TableCell>
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
                    <TableCell colSpan={7}>無掛號資料</TableCell>
                  </TableRow>
                )}
              </tbody>
            </Table>
          )}
        </Container>
      </MainContainer>
    </>
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
