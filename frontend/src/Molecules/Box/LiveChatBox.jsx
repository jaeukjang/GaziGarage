import { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { getStompClient } from "../../store/socket";
import { useSelector } from "react-redux";
import { checkUserInfo } from "../../store/user";

const StyledChatting = styled.div`
  padding: 8px;
  width: calc(100% - 100px);
  height: 30vh;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  row-gap: 8px;
  /* font-family: "Inter"; */
  font-style: normal;
  font-weight: 700;
  /* font-size: 16px; */
  /* line-height: 15px; */

  /* border-radius: 8px; */
  /* background-color: white; */
  overflow-y: scroll;
  -webkit-mask-image: linear-gradient(transparent, black);
  mask-image: linear-gradient(transparent, black);
  background-color: rgb(0, 0, 0, 0.4);
  border-radius: 8px;
`;

const StyledMessage = styled.div``;

const StyledContainer = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: row;
  column-gap: 8px;
  align-items: center;
`;
const StyledInput = styled.input`
  width: calc(100% - 80px);
  height: 40px;
  border: 2px solid ${({ theme }) => theme.color.white};
  border-radius: 8px;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0);
  color: ${({ theme }) => theme.color.white};
  padding: 0 8px;
`;
const SendBtn = styled.button`
  width: 24px;
  height: 24px;
  background: url("/image/liveshow/send-icon.svg") no-repeat 0px 0px;
  //gradient 속성 찾기
`;
const FlexBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  justify-content: flex-end;
`;
export default function ChatInput({ liveId }) {
  const userInfo = useSelector(checkUserInfo);
  const [message, setMessage] = useState(""); // 입력 메세지
  const messageArea = useRef();
  const scrollRef = useRef();
  const stompClient = getStompClient();

  //연결
  const connect = () => {
    console.log("connect");
    stompClient.connect({}, connectSuccess, connectError);
  };

  useEffect(() => {
    if (stompClient === null) {
      return;
    }
    connect(); //연결
    scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  /**
   * 연결 성공
   */
  const connectSuccess = () => {
    console.warn("connectSuccess!");
    stompClient.subscribe("/sub/live/" + liveId, onMessageReceived);
    stompClient.send(
      "/pub/live/addUser/" + liveId,
      {},
      JSON.stringify({
        sender: userInfo.nickname,
        type: "JOIN",
        roomId: liveId,
      })
    );
  };

  /**
   * 연결 실패
   */
  const connectError = () => {
    console.warn("connectError!");
  };

  /**
   * 메시지 받음
   * @param {*} payload
   */
  const onMessageReceived = (payload) => {
    console.log("onMessageReceived!");

    var message = JSON.parse(payload.body);
    var messageElement = document.createElement("p");

    if (message.type === "JOIN") {
      message.content = "[" + message.sender + "] 님이 입장하셨습니다.";
    } else {
      var usernameElement = document.createElement("span");
      var usernameText = document.createTextNode("[" + message.sender + "] ");

      usernameElement.appendChild(usernameText);
      messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement("span");
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);
    messageArea.current.appendChild(messageElement);
  };

  /**
   * 메시지 전송
   */
  const sendMessage = () => {
    console.log("sendMessage!");

    if (message && stompClient) {
      var chatMessage = {
        sender: userInfo.nickname,
        roomId: liveId,
        content: message,
        type: "CHAT",
      };
      stompClient.send(
        "/pub/live/message/" + liveId,
        {},
        JSON.stringify(chatMessage)
      );
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    setMessage("");
  };

  /**
   * enter입력
   * @param {*} e
   */
  const onKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  /**
   * 입력 이벤트
   * @param {*} event
   */
  const inputChangeHandler = (event) => {
    setMessage(event.target.value);
  };

  return (
    <FlexBox>
      <StyledChatting ref={scrollRef}>
        <StyledMessage ref={messageArea} />
      </StyledChatting>

      <StyledContainer>
        <StyledInput
          type="text"
          className="body1-regular"
          onChange={inputChangeHandler}
          placeholder="메세지를 입력해주세요"
          value={message}
          onKeyPress={onKeyPress}
        ></StyledInput>
        <SendBtn onClick={sendMessage} />
      </StyledContainer>
    </FlexBox>
  );
}