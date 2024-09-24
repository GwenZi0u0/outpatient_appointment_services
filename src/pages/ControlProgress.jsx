import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useData, refresh } from "../contexts/DataContext";
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { fireDb } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function CancelRegistrationPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentNumber, setCurrentNumber] = useState(null);
  const { user } = useAuth();
  const { queries } = useData();
  const registrationData = queries[3]?.data || [];
  const progressData = queries[6]?.data || [];
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [period, setPeriod] = useState("");

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

  const handleButtonClick = (selectedPeriod) => {
    setPeriod(selectedPeriod);
  };

  const filterRegistrationDataByCurrentDate = (registrationData) => {
    const currentDateFormatted = getCurrentDateInfo(new Date());

    const filteredData = registrationData.filter((data) => {
      const isDateMatching =
        getCurrentDateInfo(data.OPD_date) === currentDateFormatted;
      const isDoctorMatching = user.uid === data.doctor_id;
      const isStatus = data.status === "confirmed";
      const isPeriodMatching = period === data.appointment_timeslot;
      return isDateMatching && isDoctorMatching && isStatus && isPeriodMatching;
    });
    const sortedData = filteredData.sort(
      (a, b) => a.registration_number - b.registration_number
    );
    return sortedData;
  };

  const result = filterRegistrationDataByCurrentDate(registrationData);

  const filterProgressData = (result) => {
    const filteredData = result.filter((data) => {
      const isMatching =
        user.uid === data.doctor_id && data.registration_number > currentNumber;
      return isMatching;
    });
    return filteredData;
  };

  const toggleClinic = async () => {
    if (isOpen) {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(fireDb, "progress"),
            where("doctor_id", "==", user.uid)
          )
        );
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
          console.log("Document deleted with ID: ", doc.id);
        });
      } catch (e) {
        console.error("Error deleting document: ", e);
      }

      setCurrentNumber(null);
      setCurrentPeriod(null);
      refresh(["progress"]);
    } else {
      try {
        const registrationNumber = null;
        const docRef = await addDoc(collection(fireDb, "progress"), {
          date: new Date(),
          time: period,
          doctor_id: user.uid || null,
          number: registrationNumber,
        });
        console.log("Document written with ID: ", docRef.id);

        if (["morning", "afternoon", "evening"].includes(period)) {
          setCurrentPeriod(period);
        }
      } catch (e) {
        console.error("Error adding document: ", e);
      }
      refresh(["progress"]);
    }

    setIsOpen((prev) => !prev);
  };

  const filteredData = filterProgressData(result);

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleNext = async () => {
    const progressDataId = progressData.filter(
      (data) => data.doctor_id === user.uid
    )[0]?.id;
    console.log(progressDataId);
    const firstValidNumber = filteredData[0]?.registration_number || null;

    if (firstValidNumber) {
      setCurrentNumber(firstValidNumber);
      try {
        const docRef = doc(fireDb, "progress", progressDataId);
        await updateDoc(docRef, {
          number: firstValidNumber,
        });
        console.log("Document updated successfully");
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
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
          <ProgressNumberDisplayArea $isOpen={isOpen}>
            <CurrentNumber>
              <Text>目前看診號碼</Text>
              <Number>{currentNumber}</Number>
            </CurrentNumber>
            <NextNumber>
              <Text>下一位看診號碼</Text>
              <Number>{filteredData[0]?.registration_number || null}</Number>
            </NextNumber>
          </ProgressNumberDisplayArea>
          <ButtonArea>
            <OpenClinicButton
              onClick={() => handleButtonClick("morning")}
              disabled={currentPeriod && currentPeriod !== "morning"}
            >
              <Text>上午</Text>
            </OpenClinicButton>
            <OpenClinicButton
              onClick={() => handleButtonClick("afternoon")}
              disabled={currentPeriod && currentPeriod !== "afternoon"}
            >
              <Text>下午</Text>
            </OpenClinicButton>
            <OpenClinicButton
              onClick={() => handleButtonClick("evening")}
              disabled={currentPeriod && currentPeriod !== "evening"}
            >
              <Text>夜間</Text>
            </OpenClinicButton>
          </ButtonArea>
          <OpenClinicButton onClick={toggleClinic}>
            <Text>{isOpen ? "結束就診" : "開始就診"}</Text>
          </OpenClinicButton>
        </Container>
      </MainContainer>
    </>
  );
}
const ButtonArea = styled.div`
  display: flex;
  flex-direction: row;
`;

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
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
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
