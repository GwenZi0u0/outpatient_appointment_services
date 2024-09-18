import { useState } from "react";
import styled from "styled-components";

export default function RegistrationInformation({
  register,
  specialty,
  doctor,
  date,
  time,
  schedule,
  // onRegistrationClick,
  defaultIdNumber,
  defaultBirthday,
  onResetClick,
  onSubmit,
}) {
  const timeSlots = {
    morning: "上午",
    afternoon: "下午",
    evening: "夜間",
  };

  const [idNumber, setIdNumber] = useState(defaultIdNumber || "");
  const [birthday, setBirthday] = useState(defaultBirthday || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    const regex = /^[A-Z]{1}[0-9]{0,9}$/;
    if (regex.test(value) || value === "") {
      setIdNumber(value);
    }
  };

  return (
    <FormContainer onSubmit={() => onSubmit(idNumber, birthday, name, phone)}>
      <h2>您欲預約的掛號資料為</h2>
      <Table>
        <thead>
          <tr>
            <Th>預約日期</Th>
            <Th>時段</Th>
            <Th>院區</Th>
            <Th>科別</Th>
            <Th>診間代號</Th>
            <Th>醫師姓名</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>{date || "undefined"}</Td>
            <Td>{timeSlots[time] || "undefined"}</Td>
            <Td>YOI Hospital</Td>
            <Td>{specialty.specialty || "undefined"}</Td>
            <Td>{schedule[0].room || "undefined"}</Td>
            <Td>{doctor?.physician_name || "undefined"}</Td>
          </tr>
        </tbody>
      </Table>
      <Label>請選擇身分別格式:</Label>
      <Select>
        <option>身分證(10碼)</option>
      </Select>
      <Input
        type="text"
        maxLength={10}
        value="A112234456"
        onChange={handleInputChange}
        {...register("idNumber", {
          required: "請輸入身分證號碼",
          pattern: {
            value: /^[A-Z]{1}[0-9]{9}$/,
          },
        })}
        required
      />

      <Label>出生年/月/日:</Label>
      <Input
        type="date"
        defaultValue={birthday}
        onChange={(e) => setBirthday(e.target.value)}
        {...register("birthday", { required: "請選擇出生日期" })}
        required
      />

      <Label>姓名:</Label>
      <Input
        type="text"
        {...register("name")}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Label>聯絡電話:</Label>
      <Input
        type="tel"
        maxLength={10}
        value="0912345666"
        onChange={(e) => setPhone(e.target.value)}
        {...register("phone", {
          required: "請輸入聯絡電話",
          pattern: {
            value: /^[0-9]{10}$/,
          },
        })}
        required
      />

      <ButtonContainer>
        <Button type="button" $btnColor={false} onClick={() => onResetClick()}>
          重新選擇
        </Button>
        <Button
          type="submit"
          $btnColor={true}
          // onClick={(e) =>
          //   onRegistrationClick(e, idNumber, birthday, name, phone)
          // }
        >
          確認掛號資訊
        </Button>
      </ButtonContainer>
    </FormContainer>
  );
}

const FormContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 5px;
`;

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

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const Select = styled.select`
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: ${(props) => (props.$btnColor ? "#244a8b" : "#D2CDCD")};
  color: ${(props) => (props.$btnColor ? "#fff" : "#000")};
  border: none;
  border-radius: 100px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.$btnColor ? "#1a356d" : "#bfbfbf")};
  }
`;
// "#D2CDCD" || "#244a8b"
