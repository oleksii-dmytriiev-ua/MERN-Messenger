import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import axios from "axios";
import { ArrowBackIcon, AttachmentIcon } from '@chakra-ui/icons';
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { RiEmotionLaughLine } from 'react-icons/ri';
import { RiSendPlane2Line } from 'react-icons/ri';
import ScrollToBottom from 'react-scroll-to-bottom';
import React, { useEffect, useState, useRef } from 'react';
import { encryptMessage, decryptMessage } from "../config/cryptography"; // Import the encryption/decryption functions

// Endpoint for the socket.io server
const ENDPOINT = "https://link-ua-messenger-f8abb2e22ca4.herokuapp.com/"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain, boxColor }) => {
  const [messages, setMessages] = useState([]); // State for storing messages
  const [loading, setLoading] = useState(false); // State for loading status
  const [newMessage, setNewMessage] = useState(""); // State for new message input
  const [socketConnected, setSocketConnected] = useState(false); // State for socket connection status
  const [typing, setTyping] = useState(false); // State for typing status
  const [istyping, setIsTyping] = useState(false); // State for istyping status
  const toast = useToast(); // Toast notification
  const scrollRef = useRef(null); // Reference to the scroll element
  const [urls, setUrls] = useState([]); // State for storing URLs
  const [pic, setPic] = useState(''); // State for storing picture URL
  const [audioUrl, setAudioUrl] = useState(''); // State for storing audio URL
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State for showing/hiding emoji picker
  const [selectedEmoji, setSelectedEmoji] = useState(''); // State for selected emoji
  const [inputValue, setInputValue] = useState(''); // State for input value
  const fileInputRef = useRef(null); // Reference to the file input

  // Function to toggle emoji picker visibility
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    setTimeout(scrollToBottom, 100);
  };

  // Function to handle file selection
  const handleFileSelect = (e) => {
    setTimeout(scrollToBottom, 100);
    const file = e.target.files[0];
    postDetails(file);
  };

  // Function to handle emoji selection
  const handleEmojiSelect = (emoji) => {
    console.log(emoji);
    const nativeContent = emoji.native;
    setNewMessage((prevMessage) => prevMessage + nativeContent);
    // Additional logic with the selected emoji
  };
  
  const handleChange = (event) => {
    setNewMessage(event.target.value);
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "auto",
      block: "end"});
    }
  };
  
    const postDetails = (file) => {
      if (!file) {
        toast({
          title: "Please Select a File!",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }
    
      const mediaVideo = ['.mp4', '.mkv', '.webm', '.ogg', '.m4v', '.f4v', '.mov', '.mpeg', '.avi', 'wmv'];
  const mediaAudio = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.wma', '.flac', '.aiff', '.opus'];
  const mediaDoc = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.txt', '.pdf'];
  const mediaZip = ['.zip', '.rar', '.7zip'];
  
  const isImage = file.type.startsWith("image/");
  const isVideo = mediaVideo.some(extension => file.name.endsWith(extension));
  const isGif = file.type === "image/gif";
  const isAudio = mediaAudio.some(extension => file.name.endsWith(extension));
  const isDocument = mediaDoc.some(extension => file.name.endsWith(extension));
  const isZip = mediaZip.some(extension => file.name.endsWith(extension));
    
  if (!isImage && !isVideo && !isGif && !isAudio && !isDocument && !isZip) {
    toast({
      title: "Please Select an Image, Video, GIF, Audio, Archive or Document!",
      status: "warning",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    return;
  }
  
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dmitriev");
    
      const endpoint = isImage
        ? "https://api.cloudinary.com/v1_1/dmitriev/image/upload"
        : isVideo
        ? "https://api.cloudinary.com/v1_1/dmitriev/video/upload"
        : isAudio
        ? "https://api.cloudinary.com/v1_1/dmitriev/upload" // Corrected endpoint for audio files
        : isDocument
        ? "https://api.cloudinary.com/v1_1/dmitriev/upload" // Endpoint for document files
        : "https://api.cloudinary.com/v1_1/dmitriev/image/upload" // Use the same endpoint for .gif files
        ? "https://api.cloudinary.com/v1_1/dmitriev/upload" // Corrected endpoint for audio files
        : isZip;
      axios
        .post(endpoint, data)
        .then((response) => {
          const url = response.data.url.toString();
          if (isImage) {
            // Automatically write the image URL into the input field
            setNewMessage((prevMessage) => prevMessage + " " + url + " ");
          } else if (isVideo || isGif) {
            // Automatically write the video/GIF URL into the input field
           setNewMessage((prevMessage) => prevMessage + " " + url + " ");
          } else if (isAudio) {
            // Handle audio file URL
            setNewMessage((prevMessage) => prevMessage + " " + url + " ");
            console.log("Audio URL:", url);
          } else if (isDocument) {
            // Handle document file URL
            setNewMessage((prevMessage) => prevMessage + " " + url + " ");
            console.log("Document URL:", url);
          }
          else if (isZip) {
            // Handle document file URL
            setNewMessage((prevMessage) => prevMessage + " " + url + " ");
            console.log("Zip URL:", url);
          }
          console.log(url);
        })
        .catch((error) => {
          console.log(error);
        });
  
    };  
  
    const postVideoDetails = (video) => {
      if (video === undefined) {
        toast({
          title: "Please Select a Video!",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }
      console.log(video);
      if (video.type === "video/mp4") {
        const data = new FormData();
        data.append("file", video);
        data.append("upload_preset", "chat-app");
        data.append("cloud_name", "dmitriev");
        fetch("https://api.cloudinary.com/v1_1/dmitriev/video/upload", {
          method: "post",
          body: data,
        })
          .then((res) => res.json())
          .then((data) => {
            setPic(data.url.toString());
            console.log(data.url.toString());
            // Automatically write the video URL into the input field
            setNewMessage(data.url.toString());
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        toast({
          title: "Please Select a Video!",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }
    };
  
    const isImageURL = (url) => {
      const mediaExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
      const extension = url.substring(url.lastIndexOf('.')).toLowerCase();
      return mediaExtensions.includes(extension);
    };
  
    const videoURL = (url) => {
      const mediaExtensions = ['.mp4','.mkv','.webm','.ogg','.m4v','.f4v','.mov','.mpeg','.avi','wmv'];
      const extension = url.substring(url.lastIndexOf('.')).toLowerCase();
      return mediaExtensions.includes(extension);
    };
  
    const musicURL = (url) => {
      const mediaExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.wma', '.flac', '.aiff', '.opus'];
      const extension = url.substring(url.lastIndexOf('.')).toLowerCase();
      return mediaExtensions.includes(extension);
    };
  
    const docURL = (url) => {
      const mediaExtensions = ['.doc','.docx','.xls','.xlsx','.ppt','.pptx','.txt'];
      const extension = url.substring(url.lastIndexOf('.')).toLowerCase();
      return mediaExtensions.includes(extension);
    };
  
    const pdfURL = (url) => {
      const mediaExtensions = ['.pdf'];
      const extension = url.substring(url.lastIndexOf('.')).toLowerCase();
      return mediaExtensions.includes(extension);
    };

    const zipURL = (url) => {
      const mediaExtensions = ['.zip', '.rar', '.7zip'];
      const extension = url.substring(url.lastIndexOf('.')).toLowerCase();
      return mediaExtensions.includes(extension);
    };
  
    const [videos, setVideos] = useState([]);
    const inputFileRef = useRef(null);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);// Set loading status to true

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

    const playMusic = () => {
      const audioUrl = "http://res.cloudinary.com/dmitriev/video/upload/v1687114210/y5rvp0y62s6kggvs3yo2.wav";
      const audio = new Audio(audioUrl);
      audio.play()
      .then(() => {
        // Playback started successfully
      })
      .catch((error) => {
        // Failed to start playback
        console.log(error);
      });
    };

    const sendMessage = async () => {
      if (newMessage) {
        socket.emit('stop typing', selectedChat._id);
        try {
          const config = {
            headers: {
              'Content-type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
          };
    
          // Encrypt the newMessage using a secret key
          const key = 'yFSX0L7JmGtQPIWf';
          // Encrypt the message using the encryption function
          const encryptedMessage = encryptMessage(newMessage, key);
          // Clear the new message input
          setNewMessage('');
    
          const { data } = await axios.post(
            '/api/message',
            {
              content: encryptedMessage,
              chatId: selectedChat._id,
            },
            config
          );
    
          // Emit a "chat message" event with the encrypted message
          socket.emit('new message', data);
          setMessages([...messages, data]);
        } catch (error) {
          toast({
            title: 'Error Occurred!',
            description: 'Failed to send the Message',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'bottom',
          });
        }
      }
      setTimeout(scrollToBottom, 100);
    };    

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages]);
  
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessage) => {
      // Decrypt the received message
      const decryptedMessage = decryptMessage(newMessage.content);
      setMessages((prevMessages) => [...prevMessages, { ...newMessage, content: decryptedMessage }]);
    });
  }, []);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = newMessage.match(urlRegex);
    if (matches) {
      setUrls(matches);
    } else {
      setUrls([]);
    }
  }, [newMessage]);
  
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            color={boxColor === "black" ? "whatsapp.100" : "black"}
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg={boxColor === "black" ? "#1C1C1C" : "#d4d4d4"}
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
          <ScrollToBottom className="scroll-container">
            <ScrollableChat messages={messages}/>
            <div ref={scrollRef} />
          </ScrollToBottom>
        </div>
            )}
            <Box>
              {urls.map((url, index) => {
                if (isImageURL(url)) {
                  return (
                    <Box
                      key={index}
                      display="inline-block"
                      maxWidth="100px"
                      maxHeight="200px"
                      mb={2}
                    >
                      <img
                        src={url}
                        alt="Image"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    </Box>
                  );
                } else if (musicURL(url)) {
                  return (
                    <audio
                     key={index}
                     src={url}
                     alt="audio"
                     controls
                    />
                  );
                }
                else if (docURL(url)) {
                  return (
                    <Box
                      key={index}
                      display="inline-block"
                      maxWidth="200px"
                      maxHeight="300px"
                      mb={2}
                    >
                      <img
                        src={'https://res.cloudinary.com/dmitriev/image/upload/v1686659575/uzish466ibfhjhgavmis.png'}
                        alt="Image"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    </Box>
                  );
                }
                else if (pdfURL(url)) {
                  return (
                    <Box
                      key={index}
                      display="inline-block"
                      maxWidth="200px"
                      maxHeight="300px"
                      mb={2}
                    >
                      <img
                        src={'http://res.cloudinary.com/dmitriev/image/upload/v1688407846/vzunssmhftp4zegrbb6p.png'}
                        alt="Image"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    </Box>
                  );
                }
                else if (zipURL(url)) {
                  return (
                    <Box
                      key={index}
                      display="inline-block"
                      maxWidth="200px"
                      maxHeight="300px"
                      mb={2}
                    >
                      <img
                        src={'http://res.cloudinary.com/dmitriev/image/upload/v1687175207/jtucenuqv2im9sqlooyh.png'}
                        alt="Image"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    </Box>
                  );
                }
                else if (videoURL(url)) {
                  return (
                    <video
                    key={index}
                    src={url}
                    alt="Video"
                    controls
                    style={{ maxWidth: '200px', maxHeight: '300px' }}
                    />
                  );
                }
              })}
            </Box>
            {showEmojiPicker && (
      <Picker data={data} onEmojiSelect={handleEmojiSelect}/>
)}
            </Box>
          <Box display="flex" bg="#adadad" p={4} borderRadius="md" width="100%">     
          <FormControl>
  <Box display="flex">
  <Input
  value={newMessage}
  onChange={handleChange}
  placeholder="Type a message..."
  focusBorderColor="blue.400"
  flex="1"
  borderRadius="md"
  mr={2}
  _focus={{
    boxShadow: 'none',
  }}
  _active={{
    boxShadow: 'none',
    pointerEvents: 'none',
  }}
  onKeyDown={(event) => event.key === 'Enter' && sendMessage('')}
  autoFocus={true} // Set initial focus
/>
    <IconButton
      aria-label="Attach file"
      icon={<AttachmentIcon fontSize="xl" />}
      onClick={() => fileInputRef.current.click()}
      variant="unstyled"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    />
    <IconButton
      aria-label="Emotion"
      icon={<RiEmotionLaughLine size={24}/>}
      onClick={toggleEmojiPicker}
      variant="unstyled"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    />
    <IconButton
      aria-label="Send message"
      icon={<RiSendPlane2Line size={24}/>}
      onClick={sendMessage}
      variant="unstyled"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    />
  </Box>
  <input
    type="file"
    ref={fileInputRef}
    style={{ display: 'none' }}
    onChange={handleFileSelect}
    data-testid="file-input"
  />
</FormControl>
</Box>
        </>
      ) : (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans" color={boxColor === "black" ? "whatsapp.100" : "black"}>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;