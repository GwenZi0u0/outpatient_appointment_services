import { create } from "zustand";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchDepartmentsData, fetchDoctorsData } from "../../api";
import { useEffect } from "react";
import { fireDb, fireStorage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import AuthImage from "../../assets/auth.svg";
import ProfileDoctor from "../../assets/profileDoctor.svg";

const useEditProfileStore = create((set) => ({
  isEditing: false,
  newExpertise: "",
  doctor: null,
  setIsEditing: (isEditing) => set({ isEditing }),
  setNewExpertise: (newExpertise) => set({ newExpertise }),
  setDoctor: (doctor) => set({ doctor }),
}));

export default function EditProfile({ calculateAge }) {
  const { doctorId } = useParams();
  const { data: departmentData } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartmentsData,
  });
  const { data: doctorData } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctorsData,
  });
  const { doctor, setDoctor } = useEditProfileStore();
  const userData = doctorData?.find((doctor) => doctor.uid === doctorId);
  useEffect(() => {
    if (userData) {
      setDoctor(userData);
    }
  }, [userData, setDoctor]);

  const { isEditing, setIsEditing, newExpertise, setNewExpertise } =
    useEditProfileStore((state) => ({
      isEditing: state.isEditing,
      setIsEditing: state.setIsEditing,
      newExpertise: state.newExpertise,
      setNewExpertise: state.setNewExpertise,
    }));

  const selectFile = () => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        resolve(file);
      };
      input.click();
    });
  };

  const handleEditImage = async () => {
    setIsEditing(true);
    const file = await selectFile();
    if (file) {
      const storageRef = ref(fireStorage, `userAvatar/${doctorId}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(fireDb, "doctors", doctorId), {
        physician_imag: downloadURL,
      });
      setDoctor((prev) => ({ ...prev, physician_imag: downloadURL }));
    }
  };

  const handleDegreeChange = (value) => {
    setDoctor((prev) => ({ ...prev, degree: value }));
  };

  const handleDutyChange = (value) => {
    setDoctor((prev) => ({ ...prev, duty: value }));
    console.log(doctor.duty);
  };

  const handleContentChange = (value) => {
    setDoctor((prev) => ({ ...prev, content: value }));
  };

  const handleRemoveExpertise = (index) => {
    const updatedExpertises = [...userData.expertises];
    updatedExpertises.splice(index, 1);
    setDoctor((prev) => ({ ...prev, expertises: updatedExpertises }));
    console.log(updatedExpertises);
  };

  const handleDragDrop = (fromIndex, toIndex) => {
    const updatedExpertises = [...userData.expertises];
    const [removed] = updatedExpertises.splice(fromIndex, 1);
    updatedExpertises.splice(toIndex, 0, removed);
    setDoctor((prev) => ({ ...prev, expertises: updatedExpertises }));
    console.log(updatedExpertises);
  };

  const handleAddExpertise = (newExpertise) => {
    setDoctor((prev) => ({
      ...prev,
      expertises: [...prev.expertises, newExpertise],
    }));
    console.log(doctor?.expertises);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  return (
    <MainContainer>
      {userData ? (
        <ProfileContainer key={userData.uid}>
          <TitleContainer>
            <Title>
              <TitleImg src={ProfileDoctor} alt="profile" />
              醫師簡介
            </Title>
            <EditButtonContainer>
              {isEditing ? (
                <EditButton onClick={handleSaveProfile}>儲存</EditButton>
              ) : (
                <EditButton onClick={handleEditProfile}>修改</EditButton>
              )}
            </EditButtonContainer>
          </TitleContainer>
          <ProfileContent>
            <ProfileInfoContainer>
              <ImageContainer>
                <ProfileImage
                  src={userData.physician_imag || AuthImage}
                  alt={userData.physician_name}
                />
                {isEditing && (
                  <EditImageButton
                    type="button"
                    onClick={() => handleEditImage()}
                  >
                    編輯
                  </EditImageButton>
                )}
                <Name>{userData.physician_name}</Name>
              </ImageContainer>
              <InfoContainer>
                <DetailsList>
                  <DetailItem>
                    年齡：
                    {calculateAge(userData.physician_birth_date)}
                  </DetailItem>
                  {departmentData && (
                    <>
                      <DetailItem>
                        系别：
                        {
                          departmentData.find(
                            (department) =>
                              department.id === userData.division.division_id
                          )?.department
                        }
                      </DetailItem>
                      <DetailItem>
                        主治：
                        {
                          departmentData
                            .find(
                              (department) =>
                                department.id === userData.division.division_id
                            )
                            ?.specialties.find(
                              (specialty) =>
                                specialty.id === userData.division.specialty_id
                            )?.specialty
                        }
                      </DetailItem>
                    </>
                  )}
                  <DetailItem>
                    學歷：
                    {isEditing ? (
                      <EditableInput
                        type="text"
                        value={doctor?.degree}
                        onChange={(e) => handleDegreeChange(e.target.value)}
                        id="degree"
                        name="degree"
                      />
                    ) : (
                      userData?.degree || ""
                    )}
                  </DetailItem>
                  <DetailItem>
                    現任職務：
                    {isEditing ? (
                      <EditableInput
                        type="text"
                        value={doctor?.duty}
                        onChange={(e) => handleDutyChange(e.target.value)}
                        id="duty"
                        name="duty"
                      />
                    ) : (
                      userData?.duty || ""
                    )}
                  </DetailItem>
                </DetailsList>
              </InfoContainer>
            </ProfileInfoContainer>
            {isEditing ? (
              <EditableTextArea
                value={userData?.content}
                onChange={(e) => handleContentChange(e.target.value)}
                id="content"
                name="content"
              />
            ) : (
              <AdditionalInfo>{userData.content}</AdditionalInfo>
            )}
            <PositionContainer>
              <Position>專長</Position>
              <SpecialtiesContainer>
                {userData?.expertises.map((expertise, index) => (
                  <SpecialtyTag
                    key={index}
                    draggable={true}
                    onDragStart={(e) =>
                      e.dataTransfer.setData("text/plain", index)
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = parseInt(
                        e.dataTransfer.getData("text/plain"),
                        10
                      );
                      handleDragDrop(fromIndex, index);
                    }}
                  >
                    {isEditing ? (
                      <>
                        {expertise}
                        <RemoveExpertiseButton
                          onClick={() => handleRemoveExpertise(index)}
                        >
                          X
                        </RemoveExpertiseButton>
                      </>
                    ) : (
                      expertise
                    )}
                  </SpecialtyTag>
                ))}
              </SpecialtiesContainer>
              {isEditing && (
                <TagContainer>
                  <EditableInput
                    type="text"
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    placeholder="輸入新專長"
                    id="newExpertise"
                    name="newExpertise"
                  />
                  <AddExpertiseButton
                    onClick={() => {
                      if (newExpertise.trim()) {
                        handleAddExpertise(newExpertise);
                        setNewExpertise("");
                      }
                    }}
                  >
                    新增
                  </AddExpertiseButton>
                </TagContainer>
              )}
            </PositionContainer>
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
  margin: 20px auto;
  padding: 20px;
  border-radius: 8px;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleImg = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 15px;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  font-size: 32px;
  margin-bottom: 20px;
`;

const EditButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const EditButton = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
`;

const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #4a90e2;
  border-radius: 8px;
  padding: 20px;
  gap: 20px;
`;

const ProfileInfoContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 25px;
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

const EditImageButton = styled.button`
  position: absolute;
  top: 140px;
  left: 60px;
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
`;

const InfoContainer = styled.div`
  flex: 1;
`;

const Name = styled.h3`
  letter-spacing: 4px;
  font-size: 25px;
  color: #4a90e2;
  margin-bottom: 10px;
`;

const Position = styled.p`
  font-weight: bold;
  font-size: 24px;
  letter-spacing: 2px;
  line-height: 2.2;
`;

const SpecialtiesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`;

const PositionContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 22px;
  font-weight: 400;
  gap: 10px;
  padding: 10px;
`;

const SpecialtyTag = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 22px;
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
  background-color: #fff0f5;
  border-radius: 8px;
  padding: 15px;
  letter-spacing: 2px;
  line-height: 2.2;
`;

const AddExpertiseButton = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
`;

const EditableInput = styled.input.attrs((props) => ({
  id: props.id,
  name: props.name,
}))`
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const TagContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const EditableTextArea = styled.textarea.attrs((props) => ({
  id: props.id,
  name: props.name,
}))`
  width: 100%;
  font-size: 22px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const RemoveExpertiseButton = styled.button`
  background-color: transparent;
  color: #d2d2d2;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
`;
