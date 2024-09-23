import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useData } from "../../contexts/DataContext";
import DoctorImage from "../../assets/physicianImag.png";

export default function ProfileDemo({ calculateAge }) {
  const { doctorId } = useParams();
  const { queries } = useData();
  const departmentData = queries[0]?.data;
  const doctorData = queries[1]?.data;

  const selectedDoctor = doctorData?.find((doctor) => doctor.uid === doctorId);

  return (
    <MainContainer>
      {selectedDoctor ? (
        <ProfileContainer key={selectedDoctor.uid}>
          <Title>醫師簡介</Title>
          <ProfileContent>
            <ImageContainer>
              <ProfileImage
                src={DoctorImage}
                alt={selectedDoctor.physician_name}
              />
            </ImageContainer>
            <InfoContainer>
              <Name>{selectedDoctor.physician_name}</Name>
              <Position>專長</Position>
              <SpecialtiesContainer>
                {selectedDoctor.expertises.map((expertise) => (
                  <SpecialtyTag key={expertise}>{expertise}</SpecialtyTag>
                ))}
              </SpecialtiesContainer>
              <DetailsList>
                <DetailItem>
                  年齡：{calculateAge(selectedDoctor.physician_birth_date)}
                </DetailItem>
                {departmentData &&
                  (() => {
                    const department = departmentData
                      .find(
                        (department) =>
                          department.id === selectedDoctor.division.division_id
                      )
                      ?.specialties.find(
                        (specialty) =>
                          specialty.id === selectedDoctor.division.specialty_id
                      )?.specialty;

                    return (
                      <>
                        <DetailItem>科別：{department}</DetailItem>
                        <DetailItem>主治：{department}</DetailItem>
                      </>
                    );
                  })()}
                <DetailItem>學歷：{selectedDoctor.degree}</DetailItem>
                <DetailItem>現任職務：{selectedDoctor.duty}</DetailItem>
              </DetailsList>
            </InfoContainer>
          </ProfileContent>
          <AdditionalInfo>{selectedDoctor.content}</AdditionalInfo>
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
