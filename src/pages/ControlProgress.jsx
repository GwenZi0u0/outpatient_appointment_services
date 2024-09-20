import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function CancelRegistrationPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentNumber, setCurrentNumber] = useState(null);
  const [nextNumber, setNextNumber] = useState(null);
  const [validNumbers, setValidNumbers] = useState([]);
  const { user } = useAuth();
  const { queries } = useData();
  const registrationData = queries[3]?.data || [];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getCurrentDateInfo = (data) => {
    const timestamp =
      data instanceof Timestamp ? data : Timestamp.fromDate(data);
    const seconds = timestamp.seconds;
    const dateFromSeconds = new Date(seconds * 1000);
    const year = dateFromSeconds.getFullYear();
    const month = String(dateFromSeconds.getMonth() + 1).padStart(2, "0");
    const day = String(dateFromSeconds.getDate()).padStart(2, "0");

    return `${year}/${month}/${day}`;
  };

  const filterRegistrationDataByCurrentDate = (registrationData) => {
    const currentDateFormatted = getCurrentDateInfo(new Date());

    const filteredData = registrationData.filter((data) => {
      const isDateMatching =
        getCurrentDateInfo(data.OPD_date) === currentDateFormatted;
      const isDoctorMatching = user.uid === data.doctor_id;
      const isStatus = data.status === "confirmed";
      return isDateMatching && isDoctorMatching && isStatus;
    });
    return filteredData;
  };

  const result = filterRegistrationDataByCurrentDate(registrationData);

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const currentDateFormatted = getCurrentDateInfo(new Date());

    const filteredData = registrationData.filter((data) => {
      const isDateMatching =
        getCurrentDateInfo(data.OPD_date) === currentDateFormatted;
      const isDoctorMatching = user.uid === data.doctor_id;
      const isStatus = data.status === "confirmed";
      return isDateMatching && isDoctorMatching && isStatus;
    });

    const numbers = filteredData
      .filter((data) => data.registration_number)
      .map((data) => data.registration_number);
    setValidNumbers(numbers.sort((a, b) => a - b));
    if (numbers.length > 0) {
      setNextNumber(numbers[0]);
    }
  }, [registrationData, user.uid]);

  const handleNext = () => {
    if (validNumbers.length > 0) {
      if (currentNumber === null) {
        setCurrentNumber(validNumbers[0]);
        setNextNumber(validNumbers[1] || null);
      } else {
        const currentIndex = validNumbers.indexOf(currentNumber);
        if (currentIndex < validNumbers.length - 1) {
          setCurrentNumber(validNumbers[currentIndex + 1]);
          setNextNumber(validNumbers[currentIndex + 2] || null);
        } else {
          setCurrentNumber(validNumbers[currentIndex]);
          setNextNumber("");
        }
      }
    }
  };

  const toggleClinic = () => {
    if (isOpen) {
      setCurrentNumber(null);
      setNextNumber(validNumbers[0] || null);
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <MainContainer>
        <Container>
          <DateContext>
            <DateText>日期 : {getCurrentDateInfo(new Date())}</DateText>
            <DateText>現在時間 : {formatTime(currentTime)}</DateText>
          </DateContext>
          <NumberRegisteredPeopleText>
            當日掛號人數
            <PeopleNumber>{result.length}</PeopleNumber>
          </NumberRegisteredPeopleText>
          <OpenClinicButton onClick={handleNext} disabled={!isOpen}>
            <Text>下一位</Text>
          </OpenClinicButton>
          <ProgressNumberDisplayArea isOpen={isOpen}>
            <CurrentNumber>
              <Text>目前看診號碼</Text>
              <Number>{currentNumber !== null ? currentNumber : " "}</Number>
            </CurrentNumber>
            <NextNumber>
              <Text>下一位看診號碼</Text>
              <Number>{nextNumber !== null ? nextNumber : " "}</Number>
            </NextNumber>
          </ProgressNumberDisplayArea>
          <OpenClinicButton onClick={toggleClinic}>
            <Text>{isOpen ? "結束就診" : "開始就診"}</Text>
          </OpenClinicButton>
        </Container>
      </MainContainer>
    </>
  );
}

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 100vh;
  padding-top: 80px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: transparent;
  padding: 70px 320px 0;
  gap: 80px;
`;

const DateContext = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 50px;
`;

const DateText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 9.6px;
`;

const OpenClinicButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
`;

const NumberRegisteredPeopleText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 9.6px;
  gap: 50px;
`;

const PeopleNumber = styled.span`
  font-size: 80px;
  font-weight: 700;
  letter-spacing: 38.4px;
`;

const ProgressNumberDisplayArea = styled.div`
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  height: 350px;
  gap: 85px;
`;

const CurrentNumber = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
`;

const Text = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 10.4px;
  width: 100%;
  height: 93px;
`;

const Number = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 70px;
  font-weight: 700;
  letter-spacing: 21px;
  height: 156px;
`;

const NextNumber = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
`;
