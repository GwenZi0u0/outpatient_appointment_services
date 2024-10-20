import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { fetchRegistrationData } from "../../api";
import { timePeriods } from "../../utils/dateUtils";

export default function RegistrationCompleted({
  specialty,
  doctor,
  date,
  time,
  schedule,
  idNumber,
  onCompletedClick,
  name,
  birthday,
}) {
  const { data } = useQuery({
    queryKey: ["registrations"],
    queryFn: fetchRegistrationData,
  });

  const formatDate = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === "function") {
      const date = timestamp.toDate();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}/${month}/${day}`;
    }
    if (typeof timestamp === "string") {
      return timestamp.replace(/-/g, "/");
    }
    return "";
  };

  const foundItem = Array.isArray(data)
    ? data.find(
        (item) =>
          item.personal_id_number === idNumber && item.status === "confirmed" && item.doctor_id === doctor.uid
      )
    : null;

  const currentSchedule = schedule.find(
    (schedule) => schedule.doctor_id === doctor.uid
  );

  return (
    <Container>
      <Title>您預約的掛號資料為</Title>
      {foundItem ? (
        <>
          <Table>
            <TableHeader>
              <TableHeaderRow>
                <TableHeaderCell>預約日期</TableHeaderCell>
                <TableHeaderCell>時段</TableHeaderCell>
                <TableHeaderCell>院區</TableHeaderCell>
                <TableHeaderCell>科別</TableHeaderCell>
                <TableHeaderCell>診間代號</TableHeaderCell>
                <TableHeaderCell>掛號號碼</TableHeaderCell>
                <TableHeaderCell>醫師姓名</TableHeaderCell>
              </TableHeaderRow>
            </TableHeader>
            <Tbody>
              <TableRow>
                <TableCell>{date || ""}</TableCell>
                <TableCell>{timePeriods[time] || ""}</TableCell>
                <TableCell>YOI Hospital</TableCell>
                <TableCell>{specialty?.specialty || ""}</TableCell>
                <TableCell>{currentSchedule?.room || ""}</TableCell>
                <TableCell>{foundItem?.registration_number || ""}</TableCell>
                <TableCell>{doctor?.physician_name || ""}</TableCell>
              </TableRow>
            </Tbody>
          </Table>
          <CellContainer>
            <Cell>您的身分證字號為：{idNumber || ""}</Cell>
            <Cell>您的姓名為：{name || ""}</Cell>
            <Cell>您的生日為：{formatDate(birthday) || ""}</Cell>
          </CellContainer>
        </>
      ) : null}

      <ButtonContainer>
        <Button
          type="button"
          $btnColor={false}
          onClick={() => onCompletedClick()}
        >
          完成
        </Button>
      </ButtonContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 35px 20px;
`;

const Title = styled.span`
  font-size: 30px;
  font-weight: 500;
`;

const Table = styled.table`
  display: table;
  width: 100%;
  border-collapse: collapse;
  border-radius: 10px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
`;

const Tbody = styled.tbody`
  height: 55px;
`;

const TableHeader = styled.thead`
  background-color: #cccccc;
  color: #000000;
  height: 53px;
  border-radius: 10px;
`;

const TableHeaderRow = styled.tr`
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 2.6px;
`;

const TableHeaderCell = styled.th`
  text-align: center;
  background-color: #b7c3da;
  padding: 10px;
  border: 1px solid #ddd;
`;

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
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 2.2px;
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

const CellContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  gap: 5px;
`;

const Cell = styled.span`
  text-align: left;
  padding: 10px;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 2px;
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const Button = styled.button`
  padding: 15px 50px;
  background-color: #0267b5;
  color: #fff;
  border: none;
  border-radius: 30px;
  cursor: pointer;

  &:hover {
    background-color: #1a356d;
    opacity: 0.9;
  }
`;
