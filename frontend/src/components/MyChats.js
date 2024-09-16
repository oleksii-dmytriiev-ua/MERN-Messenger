import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text, Flex } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button } from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/avatar";
import { ChatState } from "../Context/ChatProvider";
import CryptoJS from "crypto-js";

const MyChats = ({ fetchAgain, boxColor }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();

  // Function to fetch chats from the server
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  // Function to start polling for new messages
  const startPolling = async () => {
    await fetchChats();
    setInterval(fetchChats, 700); // Fetch chats every 5 seconds (adjust the interval as needed)
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
      await fetchChats();
    };

    fetchData();
    // eslint-disable-next-line
  }, [fetchAgain]);

  useEffect(() => {
    startPolling(); // Start polling for new messages
    // eslint-disable-next-line
  }, []);

  // Function to format the message time
  const formatMessageTime = (time) => {
    const currentDate = new Date();
    const messageDate = new Date(time);

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const daysAgo = Math.floor((currentDate - messageDate) / millisecondsPerDay);

    if (daysAgo === 0) {
      // Today
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else if (daysAgo === 1) {
      // Yesterday
      return "Yesterday";
    } else if (daysAgo < 7) {
      // This week
      const weekday = messageDate.toLocaleDateString([], { weekday: "short" });
      return weekday;
    } else {
      // Older than this week
      const day = messageDate.getDate().toString().padStart(2, "0");
      const month = (messageDate.getMonth() + 1).toString().padStart(2, "0");
      const year = messageDate.getFullYear().toString().substr(-2);
      return `${day}.${month}.${year}`;
    }
  };

  // Function to decrypt the message content
  const decryptMessageContent = (encryptedMessage) => {
    const secretKey = "yFSX0L7JmGtQPIWf";
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
    console.log(decryptedMessage);

    // Regex patterns for different types of file extensions
    const imageRegex = /(\.(png|jpg|jpeg))/i; // Case-insensitive regex pattern for image files
    const videoRegex = /(\.(mp4|mkv|webm|ogg|m4v|f4v|mov|mpeg|avi|wmv))/i; // Case-insensitive regex pattern for video files
    const musicRegex = /(\.(mp3|wav|ogg|aac|m4a|wma|flac|aiff|opus))/i;
    const docRegex = /(\.(doc|docx|xls|xlsx|ppt|pptx|txt))/i;
    const docZip = /(\.(zip|rar|7zip))/i;
    const docGif = /(\.(gif))/i;
    const docPdf = /(\.(pdf))/i;

    if (imageRegex.test(decryptedMessage)) {
      return "Image🖼";
    } else if (videoRegex.test(decryptedMessage)) {
      return "Video🎥";
    } else if (musicRegex.test(decryptedMessage)) {
      return "Audio🔊";
    } else if (docRegex.test(decryptedMessage)) {
      return "doc📄";
    } else if (docZip.test(decryptedMessage)) {
      return "Archive📁";
    } else if (docGif.test(decryptedMessage)) {
      return "Gif🖼";
    } else if (docPdf.test(decryptedMessage)) {
      return "pdf📄";
    } else if (decryptedMessage.length > 10) {
      return decryptedMessage.slice(0, 10) + "...";
    } else {
      return decryptedMessage;
    }
  };

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg={boxColor || "white"}
      w={{ base: "100%", md: "31%" }}
      borderRadius={boxColor ? "lg" : "0px"}
      borderWidth={boxColor ? "1px" : "0px"}
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        color={boxColor === "black" ? "whatsapp.100" : "black"}
      >
        My Chats
        <GroupChatModal user={user} chats={chats} setChats={setChats}>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            color={"black"}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg={"#d4d4d4"}
        w="100%"
        h="100%"
        borderRadius={boxColor ? "lg" : "0px"}
        overflowY={boxColor ? "hidden" : "auto"}
        css={
          boxColor
            ? {}
            : {
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#F8F8F8",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#888",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "#555",
                },
              }
        }
      >
        {chats ? (
          <Stack overflowY="scroll" spacing={4}>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#3182CE" : "#ffffff"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Flex justify="space-between" align="center">
                  <Flex align="center">
                    <Avatar
                      size="lg"
                      cursor="pointer"
                      name={chat.chatName}
                      src={
                        chat.isGroupChat
                          ? chat.chatPic
                          : loggedUser &&
                            chat.users.find((user) => user._id !== loggedUser._id)?.pic
                      }
                    />
                    <Box ml={2}>
                      <Text fontWeight="bold">
                        {!chat.isGroupChat
                          ? getSender(loggedUser, chat.users)
                          : chat.chatName}
                      </Text>
                      {chat.latestMessage && (
                        <Text fontSize="sm" mt={1}>
                          <span
                            style={{
                              color: selectedChat === chat ? "white" : "blue",
                            }}
                          >
                            {chat.latestMessage.sender.name}:
                          </span>{" "}
                          {decryptMessageContent(chat.latestMessage.content)}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                  {chat.latestMessage && (
                    <Text fontSize="xs" textAlign="right">
                      {formatMessageTime(chat.latestMessage.createdAt)}
                    </Text>
                  )}
                </Flex>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
