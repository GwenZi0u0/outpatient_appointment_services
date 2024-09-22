import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import DoctorImage from "../assets/physicianImag.png";

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const { queries } = useData();
  const departmentData = queries[0]?.data;
  const doctorData = queries[1]?.data;

  function calculateAge(timestamp) {
    const { seconds, nanoseconds } = timestamp;
    const birthDate = new Date(
      seconds * 1000 + Math.floor(nanoseconds / 1000000)
    );
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    const dayDiff = currentDate.getDate() - birthDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age;
  }

  return (
    <MainContainer>
      {doctorData &&
        doctorData
          .filter((data) => data.uid === user.uid)
          .map((data) => (
            <ProfileContainer key={data.uid}>
              <Title>醫師簡介</Title>
              <ProfileContent>
                <ImageContainer>
                  <ProfileImage src={DoctorImage} alt={data.physician_name} />
                </ImageContainer>
                <InfoContainer>
                  <Name>{data.physician_name}</Name>
                  <Position>專長</Position>
                  <SpecialtiesContainer>
                    {data.expertises.map((expertise) => (
                      <SpecialtyTag key={expertise}>{expertise}</SpecialtyTag>
                    ))}
                  </SpecialtiesContainer>
                  <DetailsList>
                    <DetailItem>
                      年齡：{calculateAge(data.physician_birth_date)}
                    </DetailItem>
                    {departmentData &&
                      (() => {
                        const department = departmentData
                          .find(
                            (department) =>
                              department.id === data.division.division_id
                          )
                          ?.specialties.find(
                            (specialty) =>
                              specialty.id === data.division.specialty_id
                          )?.specialty;

                        return (
                          <>
                            <DetailItem>科別：{department}</DetailItem>
                            <DetailItem>主治：{department}</DetailItem>
                          </>
                        );
                      })()}
                    <DetailItem>學歷：{data.degree}</DetailItem>
                    <DetailItem>現任職務：{data.duty}</DetailItem>
                  </DetailsList>
                </InfoContainer>
              </ProfileContent>
              <AdditionalInfo>{data.content}</AdditionalInfo>
            </ProfileContainer>
          ))}
    </MainContainer>
  );
}

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 100vh;
  padding-top: 80px;
`;

const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const Title = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
`;

const ProfileContent = styled.div`
  display: flex;
  border: 1px solid #4a90e2;
  border-radius: 8px;
  padding: 20px;
`;

const ImageContainer = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const InfoContainer = styled.div`
  flex: 1;
`;

const Name = styled.h3`
  font-size: 20px;
  color: #4a90e2;
  margin-bottom: 10px;
`;

const Position = styled.p`
  font-weight: bold;
  margin-bottom: 10px;
`;

const SpecialtiesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`;

const SpecialtyTag = styled.span`
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
`;

const DetailsList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const DetailItem = styled.li`
  margin-bottom: 5px;
`;

const AdditionalInfo = styled.div`
  background-color: #fff0f5;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
`;
