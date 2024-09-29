import styled from "styled-components";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import ProfileDoctor from "../../assets/profileDoctor.svg";
import AuthImage from "../../assets/auth.svg";

export default function ProfileDemo({
  calculateAge,
  departmentData,
  doctorData,
}) {
  const { doctorId } = useParams();

  const selectedDoctor = useMemo(
    () => doctorData?.find((doctor) => doctor.uid === doctorId),
    [doctorData, doctorId]
  );

  return (
    <MainContainer>
      {selectedDoctor ? (
        <ProfileContainer key={selectedDoctor.uid}>
          <TitleContainer>
            <Title>
              <TitleImg src={ProfileDoctor} alt="profile" />
              醫師簡介
            </Title>
          </TitleContainer>
          <ProfileContent>
            <ProfileInfoContainer>
              <ImageContainer>
                <ProfileImage
                  src={selectedDoctor?.physician_imag || AuthImage}
                  alt={selectedDoctor?.physician_name}
                />
                <Name>{selectedDoctor?.physician_name || ""}</Name>
              </ImageContainer>
              <InfoContainer>
                <DetailsList>
                  <DetailItem>
                    年齡：
                    {calculateAge(selectedDoctor?.physician_birth_date) || ""}
                  </DetailItem>
                  {departmentData && (
                    <>
                      <DetailItem>
                        系别：
                        {
                          departmentData.find(
                            (department) =>
                              department.id ===
                              selectedDoctor.division.division_id
                          )?.department
                        }
                      </DetailItem>
                      <DetailItem>
                        主治：
                        {
                          departmentData
                            .find(
                              (department) =>
                                department.id ===
                                selectedDoctor.division.division_id
                            )
                            ?.specialties.find(
                              (specialty) =>
                                specialty.id ===
                                selectedDoctor.division.specialty_id
                            )?.specialty
                        }
                      </DetailItem>
                    </>
                  )}
                  <DetailItem>學歷：{selectedDoctor?.degree || ""}</DetailItem>
                  <DetailItem>
                    現任職務：{selectedDoctor?.duty || ""}
                  </DetailItem>
                </DetailsList>
              </InfoContainer>
            </ProfileInfoContainer>
            <PositionContainer>
              <Position>專長</Position>
              <SpecialtiesContainer>
                {selectedDoctor.expertises.map((expertise) => (
                  <SpecialtyTag key={expertise}>{expertise || ""}</SpecialtyTag>
                ))}
              </SpecialtiesContainer>
            </PositionContainer>
            <AdditionalInfo>{selectedDoctor?.content || ""}</AdditionalInfo>
          </ProfileContent>
        </ProfileContainer>
      ) : null}
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
  width: 850px;
  margin: 0 auto;
  border-radius: 8px;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  font-size: 32px;
  margin-bottom: 20px;
`;

const TitleImg = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 15px;
`;

const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  border: 5px dashed #B7C3DA;
  border-radius: 8px;
  padding: 20px;
  gap: 20px;
`;

const ImageContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: auto;
  height: auto;
  overflow: hidden;
  padding: 20px;
  gap: 20px;
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
`;

const InfoContainer = styled.div`
  flex: 1;
`;

const Name = styled.h3`
  letter-spacing: 4px;
  font-size: 25px;
  color: #0267B5;
  margin-bottom: 10px;
`;

const PositionContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 22px;
  font-weight: 400;
  gap: 10px;
  padding: 10px;
`;

const ProfileInfoContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 25px;
`;

const Position = styled.p`
  font-weight: 700;
  font-size: 24px;
  letter-spacing: 2px;
`;

const SpecialtiesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`;

const SpecialtyTag = styled.span`
  background-color: #f0f0f0;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 22px;
  letter-spacing: 2px;
`;

const DetailsList = styled.ul`
  list-style-type: none;
  padding: 0;
  letter-spacing: 2px;
  line-height: 2.2;
`;

const DetailItem = styled.li`
  text-align: left;
  font-size: 22px;
  font-weight: 450;
`;

const AdditionalInfo = styled.div`
  font-size: 20px;
  background-color: #ffc18848;
  border-radius: 8px;
  padding: 15px;
  letter-spacing: 2px;
  line-height: 2.2;
  min-height: 100px;
`;
