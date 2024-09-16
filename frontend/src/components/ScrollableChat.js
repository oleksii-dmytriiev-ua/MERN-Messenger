import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import CryptoJS from 'crypto-js';
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
  isSameDay,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { decryptMessage } from "../config/cryptography";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;

  // Function to transform message content by replacing URLs with appropriate elements (images, videos, audios, documents, or links)
  const transformMessageContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);

    if (urls) {
      const parts = content.split(urlRegex);

      return parts.map((part, index) => {
        if (urls.includes(part)) {
          if (/\.(jpg|jpeg|png|gif)$/i.test(part)) {
            return (
              <a href={part} target="_blank" rel="noopener noreferrer" key={index}>
                <img
                  src={part}
                  alt="Image"
                  style={{
                    maxWidth: isMobile ? "200px" : "300px",
                    maxHeight: isMobile ? "200px" : "300px"
                  }}
                />
              </a>
            );
          } else if (/\.(mp4|mkv|webm|ogg|m4v|f4v|mov|mpeg|avi|wmv)$/i.test(part)) {
            return (
              <video
                key={index}
                src={part}
                alt="Video"
                controls
                style={{
                  maxWidth: isMobile ? "200px" : "300px",
                  maxHeight: isMobile ? "200px" : "300px"
                }}
              />
            );
          } else if (/\.(mp3|wav|ogg|aac|m4a|wma|flac|aiff|opus)$/i.test(part)) {
            return (
              <audio key={index} controls
                style={{
                  maxWidth: isMobile ? "200px" : "300px",
                  maxHeight: isMobile ? "200px" : "300px"
                }}>
                <source src={part} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            );
          } else if (/\.(doc|docx|xls|xlsx|ppt|pptx|txt)$/i.test(part)) {
            return (
              <a href={part} target="_blank" rel="noopener noreferrer" key={index}>
                <img
                  src="http://res.cloudinary.com/dmitriev/image/upload/v1688370292/ak2k8hxxj2mtzyf7n8fj.png"
                  alt="Document"
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                />
              </a>
            );
          } else if (/\.(pdf)$/i.test(part)) {
            return (
              <a href={part} target="_blank" rel="noopener noreferrer" key={index}>
                <img
                  src="https://res.cloudinary.com/dmitriev/image/upload/v1688385270/o2zwgpfw08pbknuw78pe.png"
                  alt="Document"
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                />
              </a>
            );
          } else if (/\.(zip|rar|7zip)$/i.test(part)) {
            return (
              <a href={part} target="_blank" rel="noopener noreferrer" key={index}>
                <img
                  src="http://res.cloudinary.com/dmitriev/image/upload/v1688370322/tbfx2vyzm4xcyw4zkguk.png"
                  alt="Document"
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                />
              </a>
            );
          } else {
            return (
              <a href={part} target="_blank" rel="noopener noreferrer" key={index}>
                <span style={{ color: "blue", textDecoration: "underline" }}>{part}</span>
              </a>
            );
          }
        }
        return <span key={index}>{part}</span>;
      });
    }
    return content;
  };

  // Function to format message time
  const formatMessageTime = (time) => {
    const currentDate = new Date();
    const messageDate = new Date(time);

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const daysAgo = Math.floor((currentDate - messageDate) / millisecondsPerDay);

    if (daysAgo === 0) {
      // Today
      return "Today";
    } else if (daysAgo === 1) {
      // Yesterday
      return "Yesterday";
    } else if (daysAgo > 1) {
      // Other days
      const day = messageDate.getDate().toString().padStart(2, "0");
      const month = (messageDate.getMonth() + 1).toString().padStart(2, "0");
      const year = messageDate.getFullYear().toString().substr(-2);
      return `${day}.${month}.${year}`;
    }
  };

  // Function to format message time in HH:mm format
  const formatMessageTimein = (time) => {
    const messageDate = new Date(time);

    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Function to get the date of the first message
  const getFirstMessageDate = () => {
    if (messages && messages.length > 0) {
      const firstMessage = messages[0];
      const formattedDate = formatMessageTime(firstMessage.createdAt);
      return formattedDate;
    }
    return null;
  };

  // Function to get unique dates from the messages
  const getUniqueDates = () => {
    const uniqueDates = [];
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const formattedDate = formatMessageTime(message.createdAt);
      if (!uniqueDates.includes(formattedDate)) {
        uniqueDates.push(formattedDate);
      }
    }
    return uniqueDates;
  };

  // Function to check if a message is the first message of the day
  const isFirstMessageOfDay = (currentMessage, previousMessage) => {
    const currentMessageDate = new Date(currentMessage.createdAt).toDateString();
    const previousMessageDate = new Date(previousMessage.createdAt).toDateString();
    return currentMessageDate !== previousMessageDate;
  };

  // Function to decrypt the message content
  const decryptMessageContent = (encryptedMessage) => {
    const secretKey = 'yFSX0L7JmGtQPIWf';
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedMessage;
  };

  // Decrypt messages
  const decryptedMessages = messages.map((message) => ({
    ...message,
    content: decryptMessageContent(message.content),
  }));

  return (
    <ScrollableFeed>
      {decryptedMessages &&
        decryptedMessages.map((message, index) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: "5px",
            }}
            key={message._id}
          >
            {(index === 0 || isFirstMessageOfDay(message, messages[index - 1])) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "lightgray",
                    borderRadius: "5px",
                    padding: "5px",
                  }}
                >
                  {formatMessageTime(message.createdAt)}
                </span>
              </div>
            )}
  
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              {(isSameSender(decryptedMessages, message, index, user._id) ||
                isLastMessage(decryptedMessages, index, user._id)) && (
                <Tooltip label={message.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={message.sender.name}
                    src={message.sender.pic}
                  />
                </Tooltip>
              )}
              <span
                style={{
                  backgroundColor: `${
                    message.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                  }`,
                  marginLeft: isSameSenderMargin(decryptedMessages, message, index, user._id),
                  borderRadius: "20px",
                  padding: "10px 15px", // Increased height of message clouds
                  maxWidth: "75%",
                }}
              >
                {transformMessageContent(message.content)}
                <span
                  style={{
                    color: "gray",
                    fontSize: "12px",
                    marginLeft: "5px",
                  }}
                >
                  {formatMessageTimein(message.createdAt)}
                </span>
              </span>
            </div>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;