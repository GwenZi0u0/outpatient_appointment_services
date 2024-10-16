import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { fetchDepartmentsData } from "../../api";
import SentIcon from "../../assets/images/sentIcon.png";
import CloseImg from "../../assets/svg/x-circle.svg";
import {
  SelectCard,
  SelectCardImage,
  SelectCardTitle,
} from "../../pages/Registration/index";
import CallOpenAI from "./CallOpenAI";

export default function AiRobot({ handleCloseAI }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartmentsData,
  });

  const handleCardClick = (specialty) => {
    console.log("handleCardClick called with specialty:", specialty);
    if (departments) {
      const matchedDepartment = departments.find((dept) =>
        dept.department.toLowerCase().includes(specialty.toLowerCase())
      );

      console.log("Matched department:", matchedDepartment);

      if (matchedDepartment) {
        console.log(
          "Navigating to /appointment with department:",
          matchedDepartment
        );
        navigate("/appointment", { state: { department: matchedDepartment } });
      } else {
        console.error(`未找到匹配的科别: ${specialty}`);
      }
    } else {
      console.error("Departments data is not available");
    }
  };

  const sendMessage = async () => {
    const newMessage = inputValue;
    if (newMessage) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: newMessage, isSent: true },
      ]);
      setInputValue("");
      const userMessage = String(newMessage);
      const formattedMessages = messages.map((msg) =>
        msg.isSent ? `I_asked: ${msg.text}` : `you_response: ${msg.text}`
      );
      try {
        const responseMessage = await CallOpenAI(
          String([...formattedMessages, `I_asked: ${userMessage}`])
        );

        const parts = responseMessage.split(/(<[^>]+>)/);
        let textContent = "";
        let selectCards = [];

        parts.forEach((part, index) => {
          if (part.includes("<") && part.includes(">")) {
            const specialty = part.replace(/<|>/g, "");
            const matchedDepartment = departments?.find((department) =>
              department.department
                .toLowerCase()
                .includes(specialty.toLowerCase())
            );

            if (matchedDepartment) {
              selectCards.push(
                <SelectCard
                  key={index}
                  style={{
                    transform: "none",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                  onClick={() => {
                    console.log("SelectCard clicked");
                    handleCardClick(specialty);
                  }}
                >
                  <SelectCardImage
                    src={matchedDepartment.image}
                    alt={matchedDepartment.department}
                    style={{ width: "80px", height: "80px" }}
                  />
                  <SelectCardTitle style={{ color: "#000" }}>
                    {matchedDepartment.department}
                  </SelectCardTitle>
                </SelectCard>
              );
            }
            textContent += specialty;
          } else {
            textContent += part;
          }
        });

        const finalMessage = (
          <>
            <div>{textContent}</div>
            {selectCards.length > 0 && (
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {selectCards}
              </div>
            )}
          </>
        );

        setMessages((prevMessages) => [
          ...prevMessages,
          { text: finalMessage, isSent: false },
        ]);
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "抱歉，發生錯誤，請稍後再試。", isSent: false },
        ]);
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ChatContainer>
      <ChatWindow>
        <Title>智能小幫手</Title>
        <CloseIcon src={CloseImg} onClick={handleCloseAI} />
        <MessagesContainer>
          {messages.map((msg, index) => (
            <MessageWrapper key={index} $isSent={msg.isSent}>
              {msg.text}
            </MessageWrapper>
          ))}
          <MessageEnd ref={messagesEndRef} />
        </MessagesContainer>
        <InputContainer>
          <Input
            type="text"
            placeholder="輸入消息..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <SentImg src={SentIcon} alt="發送" onClick={sendMessage} />
        </InputContainer>
        <Note>
          小幫手仍在開發中僅提供建議，如有錯誤請依個人經驗及醫生建議為準
        </Note>
      </ChatWindow>
    </ChatContainer>
  );
}

const ChatContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: #d2d2d28b;
`;

const ChatWindow = styled.div`
  position: relative;
  width: 65%;
  height: 800px;
  border: 1px solid #ccc;
  border-radius: 35px;
  padding: 25px;
  margin: 20px auto;
  background-color: #00b0c1;
  display: flex;
  flex-direction: column;
  @media (max-width: 768.1px) {
    width: 80%;
    height: 700px;
  }
  @media (max-width: 480.1px) {
    width: 90%;
    height: 650px;
  }
`;

const CloseIcon = styled.img`
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
  width: 50px;
  height: 50px;
  margin-left: 10px;
  margin-right: 5px;
  @media (max-width: 768.1px) {
    width: 40px;
    height: 40px;
  }
`;

const InputContainer = styled.div`
  display: flex;
  margin-top: 10px;
`;

const Input = styled.input`
  flex: 1;
  width: calc(100% - 22px);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  color: #000;
  font-size: 20px;
  font-weight: 600;
  &:focus {
    outline: none;
    border: 3px solid #ffc288;
  }
`;

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  height: 75%;
  overflow-y: auto;
  border: 1px solid #ddd;
  margin-bottom: 10px;
  padding: 20px;
  background-color: #fff;
  color: #000;
  border-radius: 5px;
  &::-webkit-scrollbar {
    width: 12px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const MessageWrapper = styled.div`
  background-color: ${(props) => (props.$isSent ? "#e0e0e0" : "#f0f0f0")};
  text-align: ${(props) => (props.$isSent ? "right" : "left")};
  padding: 15px;
  border-radius: 8px;
  margin: 5px 0;
  max-width: 50%;
  min-width: auto;
  word-wrap: break-word;
  align-self: ${(props) => (props.$isSent ? "flex-end" : "flex-start")};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 20px;
  font-weight: 500;
  color: #000;
  letter-spacing: 1px;
  @media (max-width: 768.1px) {
    max-width: 80%;
  }
  @media (max-width: 480.1px) {
    max-width: 90%;
    font-size: 18px;
  }
`;

const MessageEnd = styled.div`
  float: left;
  clear: both;
`;

const SentImg = styled.img`
  cursor: pointer;
  width: 50px;
  height: 50px;
  margin-left: 10px;
  margin-right: 5px;
  @media (max-width: 768.1px) {
    width: 40px;
    height: 40px;
  }
`;

const Title = styled.span`
  text-align: center;
  color: #ffffff;
  margin: 0;
  padding: 20px 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 1px;
`;

const Note = styled.div`
  color: #bb3131;
  font-size: 20px;
  font-weight: 600;
  padding: 15px 0;
  letter-spacing: 1px;
  @media (max-width: 768.1px) {
    font-size: 18px;
  }
  @media (max-width: 480.1px) {
    font-size: 14px;
  }
`;
