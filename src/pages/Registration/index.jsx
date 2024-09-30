import styled, { keyframes } from "styled-components";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDepartmentsData } from "../../api";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BackGround from "../../assets/background.svg";
import AnnouncementImg from "../../assets/announcementImage.svg";
import Loading from "../../assets/loading.gif";
import CusService from "../../components/CusService";
import AiRobot from "../../components/AiRobot";

export default function Registration() {
  const { setValue } = useForm();
  const navigate = useNavigate();
  const [showAI, setShowAI] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartmentsData,
  });

  const handleCardClick = (department) => {
    setValue("department", department);
    navigate("/appointment", { state: { department } });
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingGif src={Loading} alt="載入中..." />
      </LoadingContainer>
    );
  }

  const handleButtonClick = () => {
    navigate("/");
    setTimeout(() => {
      document
        .getElementById("select-region")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleClick = () => {
    setShowAI(true);
    setUserQuestion(userQuestion);
  };

  const handleCloseAI = () => {
    setShowAI(false);
  };

  return (
    <MainContainer>
      <Container>
        <ContainerText>
          「預約掛號天數為28天內，內容詳見掛號須知。」
        </ContainerText>
        <ButtonContainer>
          <Button $bgcolor="#0267b5de" onClick={handleButtonClick}>
            網路掛號
          </Button>
          <Button $bgcolor="#00b1c1de" onClick={() => navigate("progress")}>
            看診進度
          </Button>
        </ButtonContainer>
        <Carousel>
          <TextCarousel>
            1.
            進入醫療機構請正確配戴口罩、遵循呼吸道衛生與咳嗽禮節、落實手部衛生。&nbsp;
            2. 若COVID19快篩陽性，請主動告知醫護人員。&nbsp; 3.
            21天內有出國旅遊史及職業史、接觸史、群聚史，請主動告知。&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            1.
            進入醫療機構請正確配戴口罩、遵循呼吸道衛生與咳嗽禮節、落實手部衛生。&nbsp;
            2. 若COVID19快篩陽性，請主動告知醫護人員。&nbsp; 3.
            21天內有出國旅遊史及職業史、接觸史、群聚史，請主動告知。
          </TextCarousel>
        </Carousel>
      </Container>
      <AnnouncementContainer>
        <AnnouncementImage />
        <Announcement>公告</Announcement>
      </AnnouncementContainer>
      <RemindText id="select-region">
        就醫時請攜帶健保IC卡，未貼照片者請攜帶身分證、駕照、戶口名簿、外籍居留證、敬老卡或身心障礙手冊等證明文件以核對。
      </RemindText>
      <SelectRegion id="select-department">
        <SelectTitle>掛號、看診進度請選擇以下系別</SelectTitle>
        <SelectCards>
          {data
            .sort((a, b) => a.department_id - b.department_id)
            .map((department) => (
              <SelectCard
                key={department.id}
                onClick={() => handleCardClick(department)}
              >
                <SelectCardImage
                  src={department.image}
                  alt={department.department}
                />
                <ContentContainer>
                  <SelectCardTitle>{department.department}</SelectCardTitle>
                  <SelectContent>{department.description}</SelectContent>
                </ContentContainer>
              </SelectCard>
            ))}
        </SelectCards>
      </SelectRegion>
      <CusService handleClick={handleClick} />
      {showAI && (
        <OverlayContainer>
          <AiRobot userAsk={userQuestion} handleCloseAI={handleCloseAI} />
        </OverlayContainer>
      )}
    </MainContainer>
  );
}

const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20000;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const LoadingGif = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 100vh;
`;

const Container = styled.div`
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  background-image: url(${BackGround});
  background-size: cover;
  background-repeat: no-repeat;
  background-color: lightgray;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  position: relative;
`;

const ContainerText = styled.div`
  font-size: 30px;
  letter-spacing: 5px;
  line-height: 56px;
  font-weight: 600;
  width: 100%;
  height: auto;
  background-color: #ffffffb5;
  color: #000000;
  padding: 0 10px;
`;

const RemindText = styled.div`
  font-size: 28px;
  letter-spacing: 5px;
  line-height: 56px;
  font-weight: 600;
  width: 100%;
  height: auto;
  background-color: #ffffffb5;
  color: #000000;
  padding: 100px 185px;
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 200px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  gap: 40px;
`;

const Button = styled.button`
  text-align: center;
  font-size: 24px;
  border: 2px solid #ffffff;
  border-radius: 100px;
  width: 185px;
  height: 65px;
  color: #ffffff;
  background-color: ${(props) => props.$bgcolor};
`;

const scrollAnimation = keyframes`
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
`;

const Carousel = styled.div`
  position: absolute;
  bottom: 20px;
  width: 100%;
  height: 100px;
  overflow: hidden;
  background-color: rgba(255, 194, 136, 0.7);
  padding-bottom: 20px;
`;

const TextCarousel = styled.div`
  display: inline-block;
  font-size: 32px;
  line-height: 100px;
  font-weight: bold;
  white-space: nowrap;
  color: #b3261e;
  animation: ${scrollAnimation} 40s linear infinite;
`;

const AnnouncementContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 90px 0 100px 0;
  background-color: transparent;
  width: 100%;
  height: 100vh;
  gap: 200px;
`;
const AnnouncementImage = styled.div`
  width: 348px;
  height: 550px;
  background-color: #ffffff;
  background-image: url(${AnnouncementImg});
`;

const Announcement = styled.div`
  width: 837px;
  height: 736px;
  background-color: #f2f2f2;
  color: #000000;
  display: flex;
  flex-direction: column;
`;

const SelectRegion = styled.div`
  display: flex;
  flex-direction: column;
  height: auto;
  background-color: transparent;
  margin-top: 10px;
  padding: 20px 165px 100px;
  gap: 40px;
`;

const SelectTitle = styled.div`
  font-size: 38px;
  font-weight: 600;
  color: #000000;
  width: 100%;
  background-color: transparent;
`;

const SelectCards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background-color: #ffffff;
  gap: 40px;
  ${(props) =>
    props.$specialty &&
    `
  `}
`;

export const SelectCard = styled.button`
  display: flex;
  border-radius: 10px;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  margin: 8px auto;
  border: 0.5px solid #d9d9d9;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    transform: scale(1.1);
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

export const ContentContainer = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const SelectCardTitle = styled.span`
  font-size: 24px;
  color: #1e1e1e;
  margin-bottom: 10px;
`;

export const SelectCardImage = styled.img`
  flex: 1;
  margin-right: 20px;
  width: 160px;
  height: 160px;
  background-color: lightgray;
`;

const SelectContent = styled.span`
  text-align: left;
  font-size: 16px;
  color: #757575;
  line-height: 1.5;
`;
