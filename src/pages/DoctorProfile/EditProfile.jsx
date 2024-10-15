import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { create } from "zustand";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import styled from "styled-components";
import { fireDb, fireStorage } from "../../firebase";
import AuthMenImg from "../../assets/authMen.png";
import AuthWomenImg from "../../assets/authWomen.png";
import ProfileDoctor from "../../assets/profileDoctor.svg";
import EditImage from "../../assets/editImage.svg";
import EditProfileIcon from "../../assets/editProfileIcon.svg";
import SaveProfile from "../../assets/save.svg";
import CancelIcon from "../../assets/x-square.svg";
import RemoveIcon from "../../assets/x.svg";
import { PopUp } from "../../components/PopUp";

const useEditProfile = create((set) => ({
  showPopup: false,
  popupMessage: "",
  confirmMessage: "",
  currentAction: null,
  setShowPopup: (show) => set({ showPopup: show }),
  setPopupMessage: (message) => set({ popupMessage: message }),
  setConfirmMessage: (message) => set({ confirmMessage: message }),
  setCurrentAction: (action) => set({ currentAction: action }),
}));

export default function EditProfile({
  calculateAge,
  departmentData,
  doctorData,
  refetchDoctorData,
}) {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const currentUser = doctorData?.find((doctor) => doctor.uid === doctorId);
  const {
    showPopup,
    confirmMessage,
    popupMessage,
    currentAction,
    setShowPopup,
    setConfirmMessage,
    setCurrentAction,
  } = useEditProfile();

  const [userData, setUserData] = useState(currentUser);
  const [modifiedData, setModifiedData] = useState(userData || {});
  const [isEditing, setIsEditing] = useState(false);
  const [newExpertise, setNewExpertise] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const isModified = useMemo(() => {
    if (!modifiedData || !userData) return false;
    return JSON.stringify(modifiedData) !== JSON.stringify(userData);
  }, [modifiedData, userData]);

  useEffect(() => {
    setModifiedData(userData);
    setUserData(currentUser);
  }, [currentUser]);

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
    let file;
    try {
      setIsUploadingImage(true);
      file = await selectFile();
      if (!file) {
        setIsUploadingImage(false);
        return;
      }
      const storageRef = ref(fireStorage, `userAvatar/${doctorId}.png`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      const docRef = doc(fireDb, "doctors", userData.id);
      const updatedFields = {
        physician_imag: downloadURL,
      };
      await updateDoc(docRef, updatedFields);
      await refetchDoctorData();
    } catch (error) {
      console.error("上傳失敗：", error);
    } finally {
      if (file) {
        setIsUploadingImage(false);
      }
    }
  };

  const handleInputChange = (field) => (value) => {
    setModifiedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRemoveExpertise = (index) => {
    setModifiedData((prev) => ({
      ...prev,
      expertises: prev.expertises.filter((_, i) => i !== index),
    }));
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDrop = (e, toIndex) => {
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    setModifiedData((prev) => {
      const updatedExpertises = [...prev.expertises];
      const [removed] = updatedExpertises.splice(fromIndex, 1);
      updatedExpertises.splice(toIndex, 0, removed);
      return { ...prev, expertises: updatedExpertises };
    });
  };

  const handleAddExpertise = () => {
    const trimmedExpertise = newExpertise.trim();
    if (!trimmedExpertise) return;
    setModifiedData((prev) => ({
      ...prev,
      expertises: [...prev.expertises, trimmedExpertise],
    }));
    setNewExpertise("");
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setModifiedData(userData);
  };

  const handleSaveProfile = () => {
    if (!isModified) return;
    setConfirmMessage("確定要儲存嗎？");
    setCurrentAction("save");
    setShowPopup(true);
  };

  const handleCancelEdit = () => {
    setConfirmMessage("確定要放棄編輯嗎？所有更改將不會保存。");
    setCurrentAction("cancel");
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    if (currentAction === "leave") {
      window.history.pushState(null, "", window.location.pathname);
    }
  };

  const saveProfileChanges = async () => {
    try {
      const docRef = doc(fireDb, "doctors", userData.id);
      const updatedFields = {
        degree: modifiedData.degree || "",
        duty: modifiedData.duty || "",
        content: modifiedData.content || "",
        expertises: modifiedData.expertises || [],
      };
      await updateDoc(docRef, updatedFields);
      await refetchDoctorData();
      setIsEditing(false);
    } catch (error) {
      console.error("儲存失敗：", error);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isEditing) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    const handlePopState = () => {
      if (isEditing) {
        setConfirmMessage("確定要離開嗎？所有未保存的更改將丟失。");
        setCurrentAction("leave");
        setShowPopup(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isEditing, setConfirmMessage, setCurrentAction, setShowPopup]);

  const handleConfirmAction = async () => {
    if (currentAction === "save") {
      await saveProfileChanges();
    } else if (currentAction === "cancel") {
      setModifiedData(userData);
      setIsEditing(false);
    } else if (currentAction === "leave") {
      setIsEditing(false);
      navigate(-1);
    }
    setShowPopup(false);
    setCurrentAction(null);
  };

  const getDefaultImage = (gender) => {
    return gender === 1 ? AuthMenImg : AuthWomenImg;
  };

  if (!userData) return null;

  return (
    <MainContainer>
      <ProfileContainer>
        <TitleContainer>
          <Title>
            <TitleImg src={ProfileDoctor} alt="profile" />
            醫師簡介
          </Title>
          <EditButtonContainer>
            {isEditing ? (
              <>
                <EditButton onClick={handleSaveProfile} disabled={!isModified}>
                  <ProfileIcon src={SaveProfile} alt="save" />
                </EditButton>
                <EditButton onClick={handleCancelEdit}>
                  <ProfileIcon src={CancelIcon} alt="cancel" />
                </EditButton>
              </>
            ) : (
              <EditButton onClick={handleEditProfile}>
                <ProfileIcon src={EditProfileIcon} alt="edit" />
              </EditButton>
            )}
          </EditButtonContainer>
        </TitleContainer>
        <ProfileContent>
          <ProfileInfoContainer>
            <ImageContainer>
              <ProfileImage
                src={
                  userData.physician_imag ||
                  getDefaultImage(userData.physician_gender)
                }
                alt={userData.physician_name}
              />
              <EditImageButton
                type="button"
                onClick={handleEditImage}
                disabled={isUploadingImage}
              >
                <EditImageIcon src={EditImage} alt="editImage" />
              </EditImageButton>
              <Name>{userData.physician_name || ""}</Name>
            </ImageContainer>
            <InfoContainer>
              <DetailsList>
                <DetailItem>
                  年齡：{calculateAge(userData.physician_birth_date) || ""}
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
                      value={modifiedData?.degree || ""}
                      onChange={(e) =>
                        handleInputChange("degree")(e.target.value)
                      }
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
                      value={modifiedData?.duty || ""}
                      onChange={(e) =>
                        handleInputChange("duty")(e.target.value)
                      }
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
          <PositionContainer>
            <Position>專長</Position>
            <SpecialtiesContainer>
              {isEditing
                ? modifiedData?.expertises.map((expertise, index) => (
                    <SpecialtyTag
                      key={index}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <>
                        {expertise || ""}
                        {expertise && (
                          <RemoveExpertiseButton
                            onClick={() => handleRemoveExpertise(index)}
                          >
                            <RemoveExpertiseIcon
                              src={RemoveIcon}
                              alt="remove"
                            />
                          </RemoveExpertiseButton>
                        )}
                      </>
                    </SpecialtyTag>
                  ))
                : userData?.expertises.map((expertise, index) => (
                    <SpecialtyTag key={index}>{expertise || ""}</SpecialtyTag>
                  ))}
            </SpecialtiesContainer>
            {isEditing && (
              <TagContainer>
                <EditableInput
                  type="text"
                  value={newExpertise || ""}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  placeholder="輸入新專長"
                  id="newExpertise"
                  name="newExpertise"
                />
                <AddExpertiseButton onClick={handleAddExpertise}>
                  新增
                </AddExpertiseButton>
              </TagContainer>
            )}
          </PositionContainer>
          {isEditing ? (
            <EditableTextArea
              value={modifiedData?.content || ""}
              onChange={(e) => handleInputChange("content")(e.target.value)}
              id="content"
              name="content"
            />
          ) : (
            <AdditionalInfo>{userData.content || ""}</AdditionalInfo>
          )}
        </ProfileContent>
      </ProfileContainer>
      {showPopup && (
        <PopUp>
          <PopupContent>
            {confirmMessage ? (
              <>
                <PopupMessage>{confirmMessage}</PopupMessage>
                <ButtonGroup>
                  <ConfirmButton onClick={handleConfirmAction}>
                    確定
                  </ConfirmButton>
                  <CancelButton onClick={handleClosePopup}>取消</CancelButton>
                </ButtonGroup>
              </>
            ) : (
              <>
                <PopupMessage>{popupMessage}</PopupMessage>
                <CloseButton onClick={handleClosePopup}>關閉</CloseButton>
              </>
            )}
          </PopupContent>
        </PopUp>
      )}
    </MainContainer>
  );
}

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 100vh;
  padding: 80px 0 40px;
  @media (max-width: 768.1px) {
    padding: 80px 20px 40px;
  }
`;

const ProfileContainer = styled.div`
  width: 850px;
  margin: 0 auto;
  border-radius: 10px;
  @media (max-width: 768.1px) {
    width: 100%;
  }
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
  @media (max-width: 480.1px) {
    font-size: 28px;
  }
`;

const TitleImg = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 15px;
`;

const EditButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.disabled ? "#a0a0a0" : "#0267B5")};
  color: white;
  border: none;
  padding: 10px 10px;
  border-radius: 35px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.disabled ? "#a0a0a0" : "#3a80d2")};
  }
`;

const ProfileIcon = styled.img`
  width: 30px;
  height: 30px;
`;

const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  border: 5px dashed #b7c3da;
  border-radius: 10px;
  padding: 20px;
  gap: 20px;
  @media (max-width: 768.1px) {
    gap: 0;
  }
`;

const ProfileInfoContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 25px;
  @media (max-width: 768.1px) {
    flex-direction: column;
    align-items: center;
    gap: 0;
  }
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
  @media (max-width: 768.1px) {
    gap: 0;
  }
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
`;

const EditImageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 130px;
  right: 20px;
  width: 42px;
  height: 42px;
  background-color: #b7c3da;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.8;
  &:hover {
    opacity: 1;
  }
`;

const EditImageIcon = styled.img``;

const Name = styled.h3`
  letter-spacing: 4px;
  font-size: 25px;
  color: #0267b5;
  margin-bottom: 10px;
`;

const InfoContainer = styled.div`
  flex: 1;
  @media (max-width: 768.1px) {
    width: 100%;
    text-align: left;
    padding: 0 15px;
  }
`;

const DetailsList = styled.ul`
  list-style-type: none;
  padding: 0;
  letter-spacing: 2px;
  line-height: 2.2;
  @media (max-width: 480.1px) {
    line-height: 2;
  }
`;

const DetailItem = styled.li`
  display: flex;
  flex-direction: row;
  text-align: left;
  font-size: 22px;
  font-weight: 500;
  width: auto;
  @media (max-width: 480.1px) {
    font-size: 20px;
    gap: 5px;
  }
`;

const EditableInput = styled.input`
  width: 70%;
  padding: 3px 5px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 22px;
  margin: 3px 0;

  &:focus {
    outline: none;
    border-color: #0267b5;
  }
  @media (max-width: 480.1px) {
    width: 60%;
    min-width: 50px;
    font-size: 20px;
  }
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

const PositionContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 22px;
  font-weight: 500;
  gap: 10px;
  padding: 10px;
  @media (max-width: 480.1px) {
    font-size: 20px;
    gap: 0;
  }
`;

const SpecialtyTag = styled.span`
  display: ${({ children }) => (children ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  padding: 8px 20px;
  border-radius: 10px;
  font-size: 22px;
  letter-spacing: 2px;
  @media (max-width: 480.1px) {
    padding: 8px 15px;
    font-size: 18px;
  }
`;

const RemoveExpertiseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: #d2d2d2;
  border: none;
  padding: 5px 5px;
  border-radius: 10px;
  cursor: pointer;
`;

const RemoveExpertiseIcon = styled.img``;

const AdditionalInfo = styled.div`
  white-space: pre-line;
  font-size: 20px;
  background-color: #ffc18848;
  border-radius: 10px;
  padding: 15px;
  letter-spacing: 2px;
  line-height: 2.2;
  min-height: 100px;
  @media(max-width: 480.1px) {
    font-size: 18px;
    line-height: 2;
    padding: 10px;
    min-height: 80px;
  }
`;

const TagContainer = styled.div`
  display: flex;
  align-items: stretch;
  height: 100%;
  gap: 10px;
  margin-bottom: 10px;
`;

const AddExpertiseButton = styled.button`
  background-color: #0267b5;
  color: white;
  border: none;
  padding: 8px 25px;
  border-radius: 10px;
  cursor: pointer;
  @media (max-width: 480.1px) {
    padding: 5px 20px;
    min-width: 80px;
  }
`;

const EditableTextArea = styled.textarea`
  white-space: pre-line;
  width: 100%;
  font-size: 22px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #ffc18848;
  letter-spacing: 2px;
  line-height: 2.2;
  min-height: 150px;
  @media (max-width: 480.1px) {
    font-size: 18px;
    line-height: 2;
    padding: 10px;
    min-height: 120px;
  }
`;

const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const BaseButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
`;

const ConfirmButton = styled(BaseButton)`
  background-color: #244a8b;
  color: white;
  &:hover {
    background-color: #1c3a6e;
  }
`;

const PopupMessage = styled.p`
  font-size: 20px;
  font-weight: 500;
`;

const CancelButton = styled(BaseButton)`
  background-color: #f0f0f0;
  color: #333;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const CloseButton = styled(BaseButton)`
  background-color: #244a8b;
  color: white;
  &:hover {
    background-color: #1c3a6e;
  }
`;
