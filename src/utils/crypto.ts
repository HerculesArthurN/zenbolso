import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Key Management
 * Retrieves or initializes a unique local encryption key.
 */
const getSecretKey = (): string => {
    let key = localStorage.getItem('zen_secret_key');
    if (!key) {
        // Generate a random high-entropy key
        key = CryptoJS.SHA256(uuidv4()).toString();
        localStorage.setItem('zen_secret_key', key);
    }
    return key;
};

const SECRET_KEY = getSecretKey();

/**
 * Encrypts a string or number using AES.
 */
export const encrypt = (data: string | number | null | undefined): string => {
    if (data === null || data === undefined) return '';
    const plainText = data.toString();
    return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
};

/**
 * Decrypts a cipher text. 
 * Includes legacy support: returns the input as-is if it's not a valid cipher.
 */
export const decrypt = (cipherText: string | null | undefined): string => {
    if (!cipherText) return '';

    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        // If decryption result is empty but cipherText wasn't, 
        // it's likely a plaintext legacy value
        if (!originalText && cipherText) {
            return cipherText;
        }

        return originalText;
    } catch (error) {
        // Legacy support: If parsing/decryption fails, it's plaintext
        return cipherText;
    }
};
