import { create } from "zustand";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchProgressData, fetchRegistrationData } from "../api";
import { Timestamp } from "firebase/firestore";
import { useEffect, useMemo } from "react";
import { fireDb } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function CancelRegistrationPage() {
  const useControlProgressStore = create((set) => ({
    isOpen: false,
    currentTime: new Date(),
    currentNumber: null,
    currentPeriod: null,
    period: "",
    selectedPeriod: null,
    setIsOpen: (isOpen) => set({ isOpen }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setCurrentNumber: (currentNumber) => set({ currentNumber }),
    setCurrentPeriod: (currentPeriod) => set({ currentPeriod }),
    setPeriod: (period) => set({ period }),
    toggleIsOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
  }));

  const {
    isOpen,
    currentTime,
    currentNumber,
    currentPeriod,
    period,
    setCurrentTime,
    setCurrentNumber,
    setCurrentPeriod,
    setPeriod,
    toggleIsOpen,
    selectedPeriod,
    setSelectedPeriod,
  } = useControlProgressStore();

  const { user } = useAuth();

  const { data: registrationData } = useQuery({
    queryKey: ["registration"],
    queryFn: () => fetchRegistrationData(),
    staleTime: 30 * 1000,
    cacheTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: progressData, refetch: refetchProgressData } = useQuery({
    queryKey: ["progress"],
    queryFn: () => fetchProgressData(),
    staleTime: 30 * 1000,
    cacheTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [setCurrentTime]);

  const getCurrentDateInfo = (data) => {
    const date = data instanceof Timestamp ? data.toDate() : new Date(data);
    return date
      .toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "/");
  };

  const handleButtonClick = (selectedPeriod) => {
    setPeriod(selectedPeriod);
    setSelectedPeriod(selectedPeriod);
  };

  const filterRegistrationDataByCurrentDate = (registrationData) => {
    const currentDateFormatted = getCurrentDateInfo(new Date());
    const filteredData = registrationData?.filter((data) => {
      const isDateMatching =
        getCurrentDateInfo(data.OPD_date) === currentDateFormatted;
      const isDoctorMatching = user.uid === data.doctor_id;
      const isStatus = data.status === "confirmed";
      const isPeriodMatching = period === data.appointment_timeslot;
      return isDateMatching && isDoctorMatching && isStatus && isPeriodMatching;
    });
    return filteredData?.sort(
      (a, b) => a.registration_number - b.registration_number
    );
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
        await Promise.all(querySnapshot.docs.map((doc) => deleteDoc(doc.ref)));
        console.log("Document deleted");
      } catch (e) {
        console.error("Error deleting document", e);
      }

      setCurrentNumber(null);
      setCurrentPeriod(null);
    } else {
      try {
        await addDoc(collection(fireDb, "progress"), {
          date: new Date(),
          time: period,
          doctor_id: user.uid || null,
          number: null,
        });
        if (["morning", "afternoon", "evening"].includes(period)) {
          setCurrentPeriod(period);
        }
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
    toggleIsOpen();
  };

  const filterProgressData = (result) =>
    result?.filter(
      (data) =>
        user.uid === data.doctor_id && data.registration_number > currentNumber
    );
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const result = useMemo(
    () => filterRegistrationDataByCurrentDate(registrationData),
    [registrationData, period, user.uid]
  );
  const filteredData = useMemo(
    () => filterProgressData(result),
    [result, currentNumber, user.uid]
  );

  const handleNext = async () => {
    await refetchProgressData();
    let progressDoc = progressData?.find(
      (data) => data.doctor_id === user.uid && data.time === period
    );
    if (!progressDoc) {
      const querySnapshot = await getDocs(
        query(
          collection(fireDb, "progress"),
          where("doctor_id", "==", user.uid),
          where("time", "==", period)
        )
      );
      if (!querySnapshot.empty) {
        progressDoc = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data(),
        };
      }
    }

    const firstValidNumber = filteredData[0]?.registration_number || null;
    if (firstValidNumber) {
      setCurrentNumber(firstValidNumber);
      if (progressDoc && progressDoc.id) {
        try {
          const docRef = doc(fireDb, "progress", progressDoc.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            await updateDoc(docRef, {
              number: firstValidNumber,
            });
            console.log("Document updated successfully");
          } else {
            console.error("No such document");
          }
        } catch (error) {
          console.error("Error updating document: ", error);
        }
      } else {
        console.error("No valid progress document found");
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
            <PeopleNumber>{result?.length}</PeopleNumber>
          </NumberRegisteredPeopleText>
          <OpenClinicButton
            onClick={handleNext}
            disabled={!isOpen}
            $isColor={true}
          >
            <Text>下一位</Text>
          </OpenClinicButton>
          <ProgressNumberDisplayArea $isOpen={isOpen}>
            <CurrentNumber>
              <Text>目前看診號碼</Text>
              <Number>{currentNumber}</Number>
            </CurrentNumber>
            <NextNumber>
              <Text>下一位看診號碼</Text>
              <Number>{filteredData?.[0]?.registration_number || null}</Number>
            </NextNumber>
          </ProgressNumberDisplayArea>
          <ButtonArea>
            <OpenClinicButton
              onClick={() => handleButtonClick("morning")}
              disabled={currentPeriod && currentPeriod !== "morning"}
              $isActive={selectedPeriod === "morning"}
              $isColor={false}
            >
              <Text>上午</Text>
            </OpenClinicButton>
            <OpenClinicButton
              onClick={() => handleButtonClick("afternoon")}
              disabled={currentPeriod && currentPeriod !== "afternoon"}
              $isActive={selectedPeriod === "afternoon"}
              $isColor={false}
            >
              <Text>下午</Text>
            </OpenClinicButton>
            <OpenClinicButton
              onClick={() => handleButtonClick("evening")}
              disabled={currentPeriod && currentPeriod !== "evening"}
              $isActive={selectedPeriod === "evening"}
              $isColor={false}
            >
              <Text>夜間</Text>
            </OpenClinicButton>
          </ButtonArea>
          <OpenClinicButton onClick={toggleClinic} $isColor={true}>
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
  gap: 20px;
  @media (max-width: 768.1px) {
    gap: 10px;
  }
`;

const MainContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  height: auto;
  min-height: 100vh;
  padding-top: 80px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: transparent;
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
    width: 100%;
    padding: 50px 50px 40px;
  }
  @media (max-width: 480.1px) {
    padding: 40px 20px 40px;
    gap: 50px;
  }
`;

const DateContext = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 50px;
  @media (max-width: 768.1px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 30px;
  }
`;

const DateText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 9.6px;
  @media (max-width: 768.1px) {
    justify-content: flex-start;
    width: 100%;
    font-size: 20px;
    letter-spacing: 8.2px;
  }
`;

const OpenClinicButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
  background-color: ${(props) => {
    if (props.disabled) return "#cccccc";
    if (props.$isColor) return "#00b1c1de";
    return props.$isActive ? "#0267b5de" : "#808080";
  }};
  color: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  &:hover {
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
    opacity: ${(props) => (props.disabled ? 0.5 : 0.8)};
  }
`;

const NumberRegisteredPeopleText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 9.6px;
  gap: 50px;
  @media (max-width: 768.1px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 30px;
  }
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
