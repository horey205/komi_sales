const fs = require('fs');
const CryptoJS = require('crypto-js');

const key = 'komi3386';
const fileName = 'db_v1_secure.dat';

try {
    const rawData = fs.readFileSync(fileName, 'utf8');

    // Check if already encrypted (crypto-js default strings start with U2FsdGVkX1)
    if (rawData.startsWith('U2FsdGVkX1')) {
        console.log('이미 암호화되어 있습니다.');
        process.exit(0);
    }

    // Encrypt
    const encrypted = CryptoJS.AES.encrypt(rawData, key).toString();

    // Write back
    fs.writeFileSync(fileName, encrypted);
    console.log('데이터 파일 암호화 완료!');
} catch (error) {
    console.error('오류 발생:', error.message);
    process.exit(1);
}
