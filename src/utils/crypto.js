import CryptoJS from 'crypto-js';

// Encrypt data using a key
export const encrypt = (data, key) => {
    if (!key) return data;
    try {
        const text = typeof data === 'string' ? data : JSON.stringify(data);
        return CryptoJS.AES.encrypt(text, key).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

// Decrypt data using a key
export const decrypt = (ciphertext, key) => {
    if (!key || !ciphertext) return ciphertext;
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);

        // Try to parse as JSON if it looks like JSON, otherwise return as string
        try {
            return JSON.parse(originalText);
        } catch {
            return originalText;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

// Check if string is likely encrypted (AES strings usually start with U2FsdGVkX1)
export const isEncrypted = (str) => {
    if (typeof str !== 'string') return false;
    return str.startsWith('U2FsdGVkX1');
};
