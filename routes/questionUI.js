const express = require('express');
const router = express.Router();
const axiosInstance = require('../axiosConfig');
const ejs = require('ejs');   // Thêm EJS
const path = require('path'); // Thêm Path

// 1. Hiển thị danh sách câu hỏi (GET - Mở cho tất cả)
router.get('/', async (req, res, next) => {
    try {
        const response = await axiosInstance.get('/questions');
        
        // BẮT CÁC TÍN HIỆU TỪ URL
        const isCreated = req.query.created === 'true';
        const isDeleted = req.query.deleted === 'true';
        const isUpdated = req.query.updated === 'true'; 

        // KẾT HỢP: Dịch file EJS thành HTML rồi nhét vào main.hbs
        const viewsPath = path.join(__dirname, '../views/questions/list.ejs');
        ejs.renderFile(viewsPath, { 
            questions: response.data,
            showCreated: isCreated,
            showDeleted: isDeleted,
            showUpdated: isUpdated 
        }, (err, htmlString) => {
            if (err) return next(err);
            res.render('layouts/main.hbs', { body: htmlString });
        });
    } catch (err) {
        console.error("Lỗi tải câu hỏi:", err.message);
        res.status(500).send('Lỗi Server (UI)');
    }
});

// 2. Hiển thị Form tạo câu hỏi mới
router.get('/create', (req, res, next) => {
    const viewsPath = path.join(__dirname, '../views/questions/create.ejs');
    ejs.renderFile(viewsPath, {}, (err, htmlString) => {
        if (err) return next(err);
        res.render('layouts/main.hbs', { body: htmlString });
    });
});

// 3. Xử lý lưu câu hỏi khi submit form (POST - Cần Token)
router.post('/', async (req, res) => {
    try {
        // Lấy token từ Cookie
        const token = req.cookies.token;
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        // Gửi request kèm thẻ thông hành (config)
        await axiosInstance.post('/questions', req.body, config);
        res.redirect('/ui/questions?created=true');
    } catch (err) {
        console.error("Lỗi tạo câu hỏi:", err.message);
        res.status(401).send('<h1>Lỗi: Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!</h1><a href="/ui/login">Quay lại đăng nhập</a>');
    }
});

// 4. Hiển thị form Edit Question (Kèm dữ liệu cũ)
router.get('/:id/edit', async (req, res, next) => {
    try {
        const response = await axiosInstance.get(`/questions/${req.params.id}`);
        
        const viewsPath = path.join(__dirname, '../views/questions/edit.ejs');
        ejs.renderFile(viewsPath, { question: response.data }, (err, htmlString) => {
            if (err) return next(err);
            res.render('layouts/main.hbs', { body: htmlString });
        });
    } catch (err) {
        console.error("Lỗi tải trang sửa câu hỏi:", err.message);
        res.status(500).send('Lỗi khi tải trang chỉnh sửa');
    }
});

// 5. Xử lý Cập nhật Question (Lệnh PUT - Cần Token & Quyền tác giả)
router.put('/:id', async (req, res) => {
    try {
        const token = req.cookies.token;
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        await axiosInstance.put(`/questions/${req.params.id}`, req.body, config);
        res.redirect('/ui/questions?updated=true');
    } catch (err) {
        console.error("Lỗi cập nhật câu hỏi:", err.message);
        res.status(403).send('<h1>Lỗi 403: Bạn không phải là tác giả của câu hỏi này!</h1><a href="/ui/questions">Quay lại danh sách</a>');
    }
});

// 6. Xử lý Xóa Question (Lệnh DELETE - Cần Token & Quyền tác giả)
router.delete('/:id', async (req, res) => {
    try {
        const token = req.cookies.token;
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        // Lưu ý: Lệnh delete truyền config ở tham số thứ 2
        await axiosInstance.delete(`/questions/${req.params.id}`, config);
        res.redirect('/ui/questions?deleted=true');
    } catch (err) {
        console.error("Lỗi xóa câu hỏi:", err.message);
        res.status(403).send('<h1>Lỗi 403: Bạn không có quyền xóa câu hỏi này!</h1><a href="/ui/questions">Quay lại danh sách</a>');
    }
});

// 7. Giao diện: Xem chi tiết một Câu hỏi
router.get('/:id', async (req, res, next) => {
    try {
        const response = await axiosInstance.get(`/questions/${req.params.id}`);
        
        const viewsPath = path.join(__dirname, '../views/questions/details.ejs');
        ejs.renderFile(viewsPath, { question: response.data }, (err, htmlString) => {
            if (err) return next(err);
            res.render('layouts/main.hbs', { body: htmlString });
        });
    } catch (err) {
        console.error("Lỗi khi tải chi tiết câu hỏi:", err.message);
        res.status(500).send('Lỗi khi tải chi tiết câu hỏi');
    }
});

module.exports = router;