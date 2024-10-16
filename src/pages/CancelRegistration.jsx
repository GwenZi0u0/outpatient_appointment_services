import { useQuery } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { create } from "zustand";
import {
  fetchDepartmentsData,
  fetchDoctorsData,
  fetchRegistrationData,
  fetchSchedulesData,
} from "../api";
import { PopUp } from "../components/PopUp";
import { fireDb } from "../firebase";
import {
  filterRegistrationDataByFutureDate,
  formatFirestoreTimestamp,
  timeSlots,
} from "../utils/dateUtils";

const useCancelRegistrationStore = create((set) => ({
  idNumber: "",
  error: "",
  isOpened: false,
  result: [],
  popupMessage: "",
  confirmAction: null,
  showPopup: false,
  setIdNumber: (idNumber) => set({ idNumber }),
  setError: (error) => set({ error }),
  setIsOpened: (isOpened) => set({ isOpened }),
  setResult: (result) => set({ result }),
  setPopupMessage: (popupMessage) => set({ popupMessage }),
  setConfirmAction: (confirmAction) => set({ confirmAction }),
  setShowPopup: (showPopup) => set({ showPopup }),
  resetState: () =>
    set({
      idNumber: "",
      error: "",
      isOpened: false,
      result: [],
      popupMessage: "",
      showPopup: false,
      confirmAction: null,
    }),
}));

export default function CancelRegistrationPage() {
  const {
    idNumber,
    isOpened,
    result,
    error,
    setIdNumber,
    setError,
    setIsOpened,
    setResult,
    resetState,
    popupMessage,
    showPopup,
    setPopupMessage,
    setShowPopup,
    confirmAction,
    setConfirmAction,
  } = useCancelRegistrationStore();

  const location = useLocation();

  useEffect(() => {
    return () => resetState();
  }, [location, resetState]);

  const { data: registrationData, refetch: refetchRegistrationData } = useQuery(
    {
      queryKey: ["registrations"],
      queryFn: fetchRegistrationData,
    }
  );

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

  const mockDatabase = useMemo(
    () =>
      registrationData?.filter(
        (data) =>
          data.personal_id_number === idNumber && data.status === "confirmed"
      ),
    [registrationData, idNumber]
  );

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setIdNumber(value);
    setResult([]);
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
      const filteredData = filterRegistrationDataByFutureDate(mockDatabase);
      setResult(filteredData);
      setError("");
      setIsOpened(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleCancel = async (registrationId) => {
    setPopupMessage("確定要取消掛號嗎？");
    setShowPopup(true);
    setConfirmAction(() => cancelRegistration(registrationId));
  };

  const cancelRegistration = async (registrationId) => {
    try {
      const registrationToCancel = result.find(
        (reg) => reg.id === registrationId
      );
      if (!registrationToCancel) {
        throw new Error("找不到要取消的掛號記錄");
      }
      const docRef = doc(fireDb, "registrations", registrationId);
      await updateDoc(docRef, {
        status: "cancelled",
      });
      const updatedResult = result.filter((reg) => reg.id !== registrationId);
      setResult(updatedResult);
      await refetchRegistrationData();
      setPopupMessage("掛號已成功取消");
      setShowPopup(true);
    } catch (error) {
      setPopupMessage(`取消掛號時出現錯誤：${error.message}`);
      setShowPopup(true);
    }
  };

  const handleConfirm = async () => {
    if (confirmAction) {
      await confirmAction();
      setConfirmAction(null);
    }
    setShowPopup(false);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setConfirmAction(null);
  };

  useEffect(() => {
    if (Array.isArray(mockDatabase)) {
      const filteredResult = filterRegistrationDataByFutureDate(mockDatabase);
      setResult(filteredResult);
    }
  }, [mockDatabase]);

  return (
    <MainContainer>
      <Container>
        <Title>查詢/取消你的掛號</Title>
        <SearchContainer>
          <Label htmlFor="idNumberInput">身分證號碼查詢</Label>
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
                onKeyDown={handleKeyDown}
              />
              <SearchButton onClick={handleSearch}>搜尋</SearchButton>
            </InputWrapper>
            <Hint>A123456789 / M114576287 / C201027260 / S205751804 </Hint>
          </SearchFrame>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </SearchContainer>
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
                          <Button onClick={() => handleCancel(data.id)}>
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
      {showPopup && (
        <PopUp>
          <PopupContent>
            <p>{popupMessage}</p>
            {confirmAction ? (
              <ButtonGroup>
                <ConfirmButton onClick={handleConfirm}>確定</ConfirmButton>
                <CancelButton onClick={handleClosePopup}>取消</CancelButton>
              </ButtonGroup>
            ) : (
              <CloseButton onClick={handleClosePopup}>關閉</CloseButton>
            )}
          </PopupContent>
        </PopUp>
      )}
    </MainContainer>
  );
}

const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const BaseButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
`;

const ConfirmButton = styled(BaseButton)`
  background-color: #244a8b;
  color: white;
  &:hover {
    background-color: #1c3a6e;
  }
`;

const CancelButton = styled(BaseButton)`
  background-color: #f0f0f0;
  color: #333;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const CloseButton = styled(BaseButton)`
  background-color: #244a8b;
  color: white;
  &:hover {
    background-color: #1c3a6e;
  }
`;

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
  @media (max-width: 768.1px) {
  }
`;

const SearchFrame = styled.div`
  display: flex;
  flex-direction: column;
  width: 60%;
  padding-left: 35px;
  gap: 10px;
  @media (max-width: 1024.1px) {
    width: 80%;
    padding-left: 10px;
  }
  @media (max-width: 768.1px) {
    padding-left: 5px;
  }
  @media (max-width: 480.1px) {
    width: 90%;
    padding-left: 0;
  }
`;

const Label = styled.label`
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 10.4px;
  @media (max-width: 1440.1px) {
    font-size: 24px;
  }
  @media (max-width: 1024.1px) {
    font-size: 20px;
    letter-spacing: 7.2px;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
`;

const SearchButton = styled.button`
  background-color: #00b0c1;
  color: white;
  border: none;
  border-radius: 10px;
  width: 100px;
  min-width: 80px;
  height: 50px;
  padding: 0 20px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1c3a6e;
  }
`;

const Input = styled.input`
  width: 100%;
  min-width: 400px;
  height: 50px;
  padding: 10px;
  font-size: 18px;
  border: 1px solid #cccccc;
  border-radius: 10px;
  &:focus {
    outline: none;
    border: 2px solid #244a8b;
  }
  @media (max-width: 1024.1px) {
    min-width: 300px;
  }
  @media (max-width: 768.1px) {
    min-width: 200px;
  }
  @media (max-width: 480.1px) {
    min-width: 150px;
  }
`;

const Hint = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #666666;
  @media (max-width: 480.1px) {
    font-size: 12px;
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
    font-size: 17px;
    letter-spacing: 4.4px;
  }
  @media (max-width: 768.1px) {
    font-size: 16px;
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
