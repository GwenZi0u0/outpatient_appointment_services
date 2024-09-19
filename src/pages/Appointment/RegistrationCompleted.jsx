import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { fetchRegistrationData } from "../../api";

export default function RegistrationCompleted({
  specialty,
  doctor,
  date,
  time,
  schedule,
  idNumber,
  onCompletedClick,
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
    return "undefined";
  };

  const foundItem = Array.isArray(data)
    ? data.find((item) => item.personal_id_number === idNumber)
    : null;
    
  const currentSchedule = schedule.find(
    (schedule) => schedule.doctor_id === doctor.uid
  );

  const timeSlots = {
    morning: "上午",
    afternoon: "下午",
    evening: "夜間",
  };

  return (
    <div>
      <h1>您預約的掛號資料為</h1>
      <Table>
        <thead>
          <tr>
            <Th>預約日期</Th>
            <Th>時段</Th>
            <Th>院區</Th>
            <Th>科別</Th>
            <Th>診間代號</Th>
            <Th>掛號號碼</Th>
            <Th>醫師姓名</Th>
          </tr>
        </thead>
        <tbody>
          {foundItem ? (
            <>
              <tr>
                <Td>{date || "undefined"}</Td>
                <Td>{timeSlots[time] || "undefined"}</Td>
                <Td>YOI Hospital</Td>
                <Td>{specialty?.specialty || "undefined"}</Td>
                <Td>{currentSchedule?.room || "undefined"}</Td>
                <Td>{foundItem?.registration_number || "undefined"}</Td>
                <Td>{doctor?.physician_name || "undefined"}</Td>
              </tr>
              <tr>
                您的身分證字號為：{foundItem.personal_id_number || "undefined"}
              </tr>
              <tr>您的姓名為：{foundItem.name || "undefined"}</tr>
              <tr>
                您的生日為：{formatDate(foundItem.birth_date) || "undefined"}
              </tr>
            </>
          ) : null}
        </tbody>
      </Table>
      <ButtonContainer>
        <Button
          type="button"
          $btnColor={false}
          onClick={() => onCompletedClick()}
        >
          完成
        </Button>
      </ButtonContainer>
    </div>
  );
}

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
`;

const Th = styled.th`
  background-color: #f2f2f2;
  padding: 10px;
  text-align: left;
  border: 1px solid #ddd;
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #244a8b;
  color: #fff;
  border: none;
  border-radius: 100px;
  cursor: pointer;

  &:hover {
    background-color: #1a356d;
  }
`;
