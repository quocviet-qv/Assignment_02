const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authenticate = require('../authenticate');
const jwt = require('jsonwebtoken'); // Import thư viện tạo Token

const SECRET_KEY = '12345-67890-09876-54321'; // Khóa bí mật để ký Token

// 1. API ĐĂNG KÝ (SIGNUP)
router.post('/signup', async (req, res) => {
    try {
        // Tạo user mới với dữ liệu từ req.body (username, password, admin)
        const user = await User.create(req.body);
        res.status(200).json({ status: 'Đăng ký thành công!', user: user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. API ĐĂNG NHẬP (LOGIN) - Trả về Token
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Tìm user trong database
        const user = await User.findOne({ username: username });
        
        if (!user) {
            return res.status(401).json({ message: "Sai tên đăng nhập!" });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: "Sai mật khẩu!" });
        }

        // Tạo Token chứa ID của user, token có hạn 1 tiếng
        const token = jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: 3600 });
        
        res.status(200).json({ 
            status: 'Đăng nhập thành công!', 
            token: token // COPY TOKEN NÀY ĐỂ TEST Ở POSTMAN
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GET /users - Task 3: Chỉ Admin mới lấy được danh sách user
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
});

module.exports = router;