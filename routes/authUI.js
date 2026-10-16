const express = require('express');
const router = express.Router();
const axiosInstance = require('../axiosConfig');
const ejs = require('ejs');
const path = require('path');

// =====================================
// PHẦN 1: LOGIN (ĐĂNG NHẬP)
// =====================================
router.get('/login', (req, res, next) => {
    const isError = req.query.error === 'true';
    const isRegistered = req.query.registered === 'true'; // Nhận tín hiệu vừa đăng ký xong
    const viewsPath = path.join(__dirname, '../views/login.ejs');
    
    ejs.renderFile(viewsPath, { error: isError, registered: isRegistered }, (err, htmlString) => {
        if (err) return next(err);
        res.render('layouts/main.hbs', { body: htmlString });
    });
});

router.post('/login', async (req, res) => {
    try {
        const response = await axiosInstance.post('/users/login', req.body);
        const token = response.data.token; 
        
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
        res.redirect('/ui/quizzes');
    } catch (err) {
        console.error("Lỗi đăng nhập:", err.message);
        res.redirect('/ui/login?error=true');
    }
});

// =====================================
// PHẦN 2: SIGNUP (ĐĂNG KÝ)
// =====================================
router.get('/signup', (req, res, next) => {
    const isError = req.query.error === 'true';
    const viewsPath = path.join(__dirname, '../views/signup.ejs');
    
    ejs.renderFile(viewsPath, { error: isError }, (err, htmlString) => {
        if (err) return next(err);
        res.render('layouts/main.hbs', { body: htmlString });
    });
});

router.post('/signup', async (req, res) => {
    try {
        // Xử lý checkbox admin (nếu được tick thì gán true, không thì false)
        req.body.admin = req.body.admin === 'true' ? true : false;

        // Gửi dữ liệu xuống API Backend
        await axiosInstance.post('/users/signup', req.body);
        
        // Đăng ký thành công -> Chuyển về trang đăng nhập kèm thông báo
        res.redirect('/ui/login?registered=true');
    } catch (err) {
        console.error("Lỗi đăng ký:", err.message);
        res.redirect('/ui/signup?error=true');
    }
});

// =====================================
// PHẦN 3: LOGOUT (ĐĂNG XUẤT)
// =====================================
router.get('/logout', (req, res) => {
    res.clearCookie('token'); 
    res.redirect('/ui/quizzes');
});

module.exports = router;