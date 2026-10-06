// axiosConfig.js
const axios = require('axios');
const https = require('https');

// Chỉnh lại cổng 3000 cho khớp với server API Assignment 1 của bạn
const apiUrl = 'http://localhost:3000'; 

// Cấu hình Axios theo mẫu của thầy cô[cite: 12]
const axiosInstance = axios.create({
    baseURL: apiUrl,
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

module.exports = axiosInstance;