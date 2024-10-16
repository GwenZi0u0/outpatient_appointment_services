import styled from "styled-components";
import { create } from "zustand";
import { timeSlots } from "../../utils/dateUtils";

const useRegistrationInformationStore = create((set) => ({
  idNumber: "",
  birthday: "",
  name: "",
  phone: "",
  setIdNumber: (value) => set({ idNumber: value }),
  setBirthday: (value) => set({ birthday: value }),
  setName: (value) => set({ name: value }),
  setPhone: (value) => set({ phone: value }),
}));

export default function RegistrationInformation({
  register,
  specialty,
  doctor,
  date,
  time,
  schedule,
  onResetClick,
  registrationData,
  getNextRegistrationNumber,
  onSubmit,
}) {
  const {
    idNumber,
    birthday,
    name,
    phone,
    setIdNumber,
    setBirthday,
    setName,
    setPhone,
  } = useRegistrationInformationStore();

  const nextRegistrationNumber = getNextRegistrationNumber(
    registrationData,
    time
  );

  const handleReset = () => {
    setIdNumber("");
    setBirthday("");
    setName("");
    setPhone("");
    onResetClick();
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setIdNumber(value);
  };

  const currentSchedule = schedule.find((s) => s.doctor_id === doctor?.uid);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(idNumber, birthday, name, phone, nextRegistrationNumber);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <Title>您欲預約的掛號資料為</Title>
      <Table>
        <TableHeader>
          <TableHeaderRow>
            <TableHeaderCell>預約日期</TableHeaderCell>
            <TableHeaderCell>時段</TableHeaderCell>
            <TableHeaderCell>院區</TableHeaderCell>
            <TableHeaderCell>科別</TableHeaderCell>
            <TableHeaderCell>診間代號</TableHeaderCell>
            <TableHeaderCell>醫師姓名</TableHeaderCell>
          </TableHeaderRow>
        </TableHeader>
        <Tbody>
          <TableRow>
            <TableCell>{date || ""}</TableCell>
            <TableCell>{timeSlots[time] || ""}</TableCell>
            <TableCell>YOI Hospital</TableCell>
            <TableCell>{specialty.specialty || ""}</TableCell>
            <TableCell>{currentSchedule?.room || ""}</TableCell>
            <TableCell>{doctor?.physician_name || ""}</TableCell>
          </TableRow>
        </Tbody>
      </Table>
      <Label>身分證(10碼) :</Label>
      <Input
        type="text"
        maxLength={10}
        placeholder="A123456789"
        onChange={handleInputChange}
        {...register("idNumber", {
          required: "請輸入身分證號碼",
          pattern: {
            value: /^[A-Z]{1}[0-9]{9}$/,
            message: "請輸入有效的身分證號碼",
          },
        })}
        required
      />
      <Label>出生年/月/日 :</Label>
      <Input
        type="date"
        defaultValue={birthday}
        onChange={(e) => setBirthday(e.target.value)}
        {...register("birthday", { required: "請選擇出生日期" })}
        max={new Date().toISOString().split("T")[0]}
        required
      />
      <Label>姓名 :</Label>
      <Input
        type="text"
        value={name}
        {...register("name", { required: "請輸入姓名" })}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Label>聯絡電話 :</Label>
      <Input
        type="tel"
        maxLength={10}
        placeholder="0912345666"
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
        <Button type="button" $btnColor={false} onClick={handleReset}>
          重新選擇
        </Button>
        <Button type="submit" $btnColor={true}>
          確認掛號資訊
        </Button>
      </ButtonContainer>
    </FormContainer>
  );
}

const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 5px;
`;

const Title = styled.p`
  font-size: 28px;
  font-weight: 500;
  letter-spacing: 2px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  font-size: 22px;
`;

const TableHeader = styled.thead`
  background-color: #cccccc;
  color: #000000;
  height: 50px;
  border-radius: 10px;
`;

const TableHeaderRow = styled.tr`
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 5.6px;
`;

const TableHeaderCell = styled.th`
  text-align: center;
  background-color: #b7c3da;
  padding: 10px;
  border: 1px solid #ddd;
`;

const Tbody = styled.tbody`
  height: 55px;
`;

const TableRow = styled.tr`
  background-color: #ffffff;
  height: 55px;
  border-bottom: 1px solid #ddd;
  @media (max-width: 1440.1px) {
    height: 65px;
  }
`;

const TableCell = styled.td`
  text-align: center;
  padding: 8px;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 2px;
  border: 1px solid #ddd;
  @media (max-width: 1440.1px) {
    font-size: 18px;
  }
  @media (max-width: 1024.1px) {
    font-size: 18px;
  }
  @media (max-width: 480.1px) {
    font-size: 16px;
  }
`;

const Label = styled.label`
  font-size: 24px;
  display: block;
  margin-bottom: 15px;
`;

// const Select = styled.select`
//   width: 100%;
//   padding: 15px;
//   margin-bottom: 10px;
//   font-size: 20px;
// `;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  margin-bottom: 15px;
  font-size: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const Button = styled.button`
  padding: 14px 32px;
  font-size: 24px;
  background-color: ${(props) => (props.$btnColor ? "#244a8b" : "#D2CDCD")};
  color: ${(props) => (props.$btnColor ? "#fff" : "#000")};
  border: none;
  border-radius: 100px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.$btnColor ? "#1a356d" : "#bfbfbf")};
  }
`;
