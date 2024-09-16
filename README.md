# MERN Messenger

MERN Messenger is a chat application built using the MERN stack (MongoDB, Express.js, React.js, Node.js). This application includes user registration, login functionality, real-time chat, notifications, file uploads, media display, and group creation features.

## Features

- **User Registration**: Users can create an account with email and password.
  
  <p align="center">
    <img src="https://drive.google.com/uc?id=1_ruQ6vLI4sj9e7ljPkw3-RyKnjhfmIYS" alt="Registration" width="500" height="550">
  </p>

- **Login**: Users can log in with their registered credentials or log in using their Google account.
  
  <p align="center">
    <img src="https://drive.google.com/uc?id=1mqegoLhzFI-mOATm_ibp3Sr9Yl9v8xhz" alt="Login" width="800" height="500">
  </p>

- **Chat**: Real-time chat functionality allows users to send and receive messages instantly.
  
  <p align="center">
    <img src="https://drive.google.com/uc?id=1-AM4L0wuyDk0RdLyiTdORS6kOoz5fPfI" alt="Chat" width="800" height="500">
  </p>

- **Notifications**: Users receive notifications for new messages and other relevant events.

- **File Uploads**: Users can upload and share files such as images, videos, music, and documents.

- **Media Display**: Uploaded files are displayed correctly, including images, videos, and audio files.

- **Date and Time**: Each message shows the date and time it was sent.

- **User Search**: Users can search for other users by their names or usernames.

- **Group Creation**: Users can create groups with multiple members for collaborative chat.

- **Password and Message Encryption**: User passwords and chat messages are encrypted using CryptoJS (SHA-256).

- **Responsive Design**: The user interface is designed to be responsive and mobile-friendly, ensuring a smooth experience on various devices.

## Encryption

- **Users Database**: User passwords are securely hashed using CryptoJS (SHA-256) to ensure privacy and security.
  
  <p align="center">
    <img src="https://drive.google.com/uc?id=1KT5vBpnadtqL7tGL8Eq84PWxzhmiNSz6" alt="Users Database" width="800" height="500">
  </p>

- **Messages Database**: Chat messages are encrypted before being stored in the database to ensure that no unauthorized party can access the message content.
  
  <p align="center">
    <img src="https://drive.google.com/uc?id=1np3kC2TsBocD-4NBhyf2OeddAKQhx5IP" alt="Messages Database" width="800" height="500">
  </p>

## Installation

1. Run `npm install` to install the backend dependencies.
2. Navigate to the `frontend` directory using `cd frontend`
3. Run `npm install --legacy-peer-deps` to install the frontend dependencies.
4. Go back to the root directory using `cd ..`
5. Start the application with `npm run start`
6. Ensure you update the existing `.env` file with your MongoDB
