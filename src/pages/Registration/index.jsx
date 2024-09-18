import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { fetchDepartmentsData } from "../../api";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function Registration() {
  const { setValue } = useForm();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartmentsData,
  });

  const handleCardClick = (department) => {
    setValue("department", department);
    navigate("/appointment", { state: { department } });
  };

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>發生錯誤: {error.message}</div>;

  const handleButtonClick = () => {
    navigate("/");
    setTimeout(() => {
      document
        .getElementById("select-region")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <MainContainer>
      <Container>
        <ContainerText>
          「預約掛號天數為28天內，內容詳見掛號須知。」
        </ContainerText>
        <ButtonContainer>
          <Button onClick={() => handleButtonClick()}>網路掛號</Button>
          <Button onClick={() => navigate("progress")}>看診進度</Button>
        </ButtonContainer>
        <Carousel>
          <TextCarousel>
            「****113/1/25~113/5/31日止，接種COVID-19疫苗免掛號費****」
            因應疫情變化，醫師看診時間將進行滾動式調整，請留意院區掛號網頁，造成不便，敬祈見諒。
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
      <SelectRegion>
        <SelectTitle>掛號、看診進度請選擇以下系別</SelectTitle>
        <SelectCards>
          {data.map((department) => (
            <SelectCard
              key={department.id}
              onClick={() => handleCardClick(department)}
            >
              <SelectCardImage />
              <ContentContainer>
                <SelectCardTitle>{department.department}</SelectCardTitle>
                <SelectContent>{department.description}</SelectContent>
              </ContentContainer>
            </SelectCard>
          ))}
        </SelectCards>
      </SelectRegion>
    </MainContainer>
  );
}

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 100vh;
`;

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  background-color: lightgray;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  position: relative;
`;

const ContainerText = styled.div`
  font-size: 28px;
  letter-spacing: 5px;
  line-height: 56px;
  font-weight: 500;
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
  font-weight: 500;
  width: 100%;
  height: auto;
  background-color: #ffffffb5;
  color: #000000;
  padding: 100px 185px;
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 195px;
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
`;

const Carousel = styled.div`
  position: absolute;
  bottom: 20px;
  width: 100%;
  height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background-color: #ffffffb5;
  padding-bottom: 20px;
`;

const TextCarousel = styled.div`
  font-size: 32px;
  line-height: 100px;
  font-weight: bold;
  width: auto;
`;

const AnnouncementContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 90px 0 100px 0;
  background-color: #f5f5f5;
  width: 100%;
  height: 100vh;
  margin-top: 10px;
  gap: 200px;
`;
const AnnouncementImage = styled.div`
  width: 348px;
  height: 550px;
  background-color: #ffffff;
`;

const Announcement = styled.div`
  width: 837px;
  height: 736px;
  background-color: #ffffff;
  color: #000000;
  display: flex;
  flex-direction: column;
`;

const SelectRegion = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: transparent;
  margin-top: 10px;
  padding: 20px 165px 20px;
  gap: 20px;
`;

const SelectTitle = styled.div`
  font-size: 38px;
  font-weight: bold;
  color: #000000;
  width: 100%;
  background-color: transparent;
`;

const SelectCards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background-color: #ffffff;
  gap: 48px;
`;

const SelectCard = styled.button`
  display: flex;
  border-radius: 10px;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  margin: 35.5px auto;
  border: 0.5px solid #d9d9d9;
  text-decoration: none;
  cursor: pointer;
`;

const ContentContainer = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const SelectCardTitle = styled.span`
  font-size: 24px;
  color: #1e1e1e;
  margin-bottom: 10px;
`;

const SelectCardImage = styled.img`
  flex: 1;
  margin-right: 20px;
  width: 160px;
  height: 160px;
  background-color: gray;
`;

const SelectContent = styled.span`
  text-align: left;
  font-size: 16px;
  color: #757575;
  line-height: 1.5;
`;
