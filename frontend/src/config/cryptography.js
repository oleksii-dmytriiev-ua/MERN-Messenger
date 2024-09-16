import CryptoJS from 'crypto-js';

// Encrypt a message
export function encryptMessage(message, secretKey) {
  const encrypted = CryptoJS.AES.encrypt(message, secretKey).toString();
  return encrypted;
}

// Decrypt a message
export function decryptMessage(encryptedMessage, secretKey) {
  const decrypted = CryptoJS.AES.decrypt(encryptedMessage, secretKey).toString(CryptoJS.enc.Utf8);
  return decrypted;
}
