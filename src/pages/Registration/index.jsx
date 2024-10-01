import styled, { keyframes } from "styled-components";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDepartmentsData } from "../../api";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BackGround from "../../assets/background.svg";
import BackGroundMobile from "../../assets/background_mobile.svg";
import AnnouncementImg from "../../assets/announcementImage.svg";
import Loading from "../../assets/loading.gif";
import CusService from "../../components/CusService";
import AiRobot from "../../components/AiRobot";

const carouselData = new Map([
  // [
  //   "兒童保健暨疫苗接種時間\n週一至週五下午13:30~15:30\n週六上午9:00-10:30\n108年1月起恢復卡介苗接種\n接種時間：每周三下午13:30-14:30",
  // ],
  [
    "門診看診時間\n上午 9:00~12:00 下午 13:30~16:30 夜間 17:30~20:30\n(星期六下午及國定例假日休診.)\n上午診請於11:30前至診間候診、下午診請於16:00前至診間候診、\n夜診請於20:00前至診間候診。",
  ],
  // [
  //   "櫃台掛號開放時間\n上午：8:00~11:00 下午：13:00~16:00 夜間：17:00~20:00",
  //   "其他掛號方式：\n自動掛號機(依院區門診時間)、網路、電話語音(02-21811995)、\n客服中心(02-25553000)、台北市民當家熱線1999轉888(免付費電話)\n掛號開放時間：00:00~24:00",
  // ],
]);

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
        <ButtonContainer>
          <Button $bgcolor="#0267b5de" onClick={handleButtonClick}>
            網路掛號
          </Button>
          <Button $bgcolor="#00b1c1de" onClick={() => navigate("progress")}>
            看診進度
          </Button>
        </ButtonContainer>
      </Container>
      <AnnouncementContainer>
        <AnnouncementImage />
        <NoticeContainer>
          <NoticeTitle style={{ animationDelay: "0s" }}>公告欄</NoticeTitle>
          <NoticeContent>
            {Array.from(carouselData).map(([key, value], index) => (
              <NoticeItem key={index}>
                <div style={{ marginRight: "50px" }}>
                  <strong>
                    {key?.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </strong>{" "}
                  {value?.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
              </NoticeItem>
            ))}
          </NoticeContent>
        </NoticeContainer>
      </AnnouncementContainer>
      <RemindText id="select-region">
        預約掛號天數為28天內<br />
        就醫時請攜帶健保IC卡，未貼照片者請攜帶身分證、駕照、戶口名簿、
        <br />
        外籍居留證、敬老卡或身心障礙手冊等證明文件以核對。
      </RemindText>
      <SelectRegion>
        <SelectTitle id="select-department">
          掛號、看診進度請選擇以下系別
        </SelectTitle>
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

const NoticeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  background-color: transparent;
  gap: 20px;
  overflow: hidden;
  @media (max-width: 1024.1px) {
    width: 100%;
    padding: 0 30px;
  }
`;

const NoticeTitle = styled.div`
  color: #244a8b;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 10px;
  width: auto;
`;

const NoticeContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding-right: 10px;
  border-radius: 30px;
  line-height: 2;
`;

const NoticeItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 1px;
  background-color: transparent;
  border-radius: 30px;
  padding: 20px;
  gap: 20px;
  position: relative;

  &:hover {
    color: #244a8b;
    border-color: #b7c3da63;
  }
`;

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
  @media (max-width: 1024.1px) {
    background-position: center;
    background-size: cover;
    height: 40vh;
    min-height: 40vh;
    background-image: url(${BackGroundMobile});
  }
`;
const RemindText = styled.div`
  text-align: center;
  font-size: 28px;
  letter-spacing: 8px;
  line-height: 56px;
  font-weight: 600;
  width: 100%;
  height: auto;
  background-color: #ffffffb5;
  color: #000000;
  padding: 100px 100px;
  @media (max-width: 1280.1px) {
    font-size: 24px;
  }
  @media (max-width: 1024.1px) {
    text-align: left;
    font-size: 22px;
    padding: 50px 30px;
    line-height: 1.8;
  }
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 160px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  gap: 40px;
  @media (max-width: 1024.1px) {
    bottom: -100px;
    gap: 15px;
    padding: 0 20px;
  }
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
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 1024.1px) {
    width: 50%;
    height: 90px;
    border-radius: 10px;
  }
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
  height: 80px;
  overflow: hidden;
  background-color: rgba(255, 194, 136, 0.7);
  padding-bottom: 20px;
  @media (max-width: 1024.1px) {
    height: 60px;
    bottom: 0;
  }
  @media (max-width: 768.1px) {
    height: 50px;
  }
`;

const TextCarousel = styled.div`
  display: inline-block;
  font-size: 28px;
  line-height: 80px;
  font-weight: bold;
  white-space: nowrap;
  color: #b3261e;
  animation: ${scrollAnimation} 100s linear infinite;
  @media (max-width: 1024.1px) {
    font-size: 22px;
    line-height: 60px;
  }
  @media (max-width: 768.1px) {
    font-size: 18px;
    line-height: 50px;
  }
`;

const AnnouncementContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-top: 90px;
  background-color: transparent;
  width: 100%;
  height: auto;
  gap: 100px;
  @media (max-width: 1024.1px) {
    padding-top: 130px;
  }
`;
const AnnouncementImage = styled.div`
  width: 348px;
  height: 550px;
  margin: 0 100px;
  background-color: #ffffff;
  background-image: url(${AnnouncementImg});
  @media (max-width: 1024.1px) {
    display: none;
  }
`;

const SelectRegion = styled.div`
  display: flex;
  flex-direction: column;
  height: auto;
  background-color: transparent;
  margin-top: 10px;
  padding: 20px 165px 100px;
  gap: 40px;
  @media (max-width: 1280.1px) {
    padding: 20px 70px 100px;
  }
  @media (max-width: 1024.1px) {
    padding: 20px 30px 100px;
  }
  @media (max-width: 768.1px) {
    padding: 20px 30px 100px;
    gap: 20px;
  }
  @media (max-width: 480.1px) {
    padding: 20px 10px 100px;
  }
`;

const SelectTitle = styled.div`
  font-size: 38px;
  font-weight: 600;
  color: #000000;
  width: 100%;
  background-color: transparent;
  @media (max-width: 1024.1px) {
    font-size: 28px;
  }
`;

const SelectCards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background-color: #ffffff;
  gap: 40px;
  @media (max-width: 1024.1px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
  @media (max-width: 768.1px) {
    gap: 20px;
  }
  @media (max-width: 480.1px) {
    grid-template-columns: repeat(1, 1fr);
    gap: 10px;
  }
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
  @media (max-width: 1440.1px) {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  @media (max-width: 768.1px) {
    padding: 10px;
  }
  @media (max-width: 480.1px) {
    position: relative;
    width: 80%;
  }
`;

export const ContentContainer = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  @media (max-width: 480.1px) {
    position: absolute;
    align-items: center;
    width: 100%;
    top: 90px;
    left: 0;
  }
`;

export const SelectCardTitle = styled.span`
  font-size: 24px;
  color: #1e1e1e;
  margin-bottom: 10px;
  @media (max-width: 480.1px) {
    color: #ffffff;
  }
`;

export const SelectCardImage = styled.img`
  flex: 1;
  margin-right: 20px;
  width: 160px;
  height: 160px;
  background-color: lightgray;
  border-radius: 10px;
  @media (max-width: 1440.1px) {
    margin-right: 0;
  }
  @media (max-width: 768.1px) {
    margin-right: 0;
  }
  @media (max-width: 480.1px) {
    background-color: #000000;
    width: 200px;
    height: 200px;
  }
`;

const SelectContent = styled.span`
  text-align: left;
  font-size: 16px;
  color: #757575;
  line-height: 1.5;
  @media (max-width: 768.1px) {
    display: none;
  }
`;
