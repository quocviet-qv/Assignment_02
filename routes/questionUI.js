const express = require('express');
const router = express.Router();
const axiosInstance = require('../axiosConfig');
const ejs = require('ejs');   // Thêm EJS
const path = require('path'); // Thêm Path

// 1. Hiển thị danh sách câu hỏi
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

// 3. Xử lý lưu câu hỏi khi submit form
router.post('/', async (req, res) => {
    try {
        await axiosInstance.post('/questions', req.body);
        res.redirect('/ui/questions?created=true');
    } catch (err) {
        console.error("Lỗi tạo câu hỏi:", err.message);
        res.status(500).send('Lỗi khi tạo câu hỏi');
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

// 5. Xử lý Cập nhật Question (Lệnh PUT)
router.put('/:id', async (req, res) => {
    try {
        await axiosInstance.put(`/questions/${req.params.id}`, req.body);
        res.redirect('/ui/questions?updated=true');
    } catch (err) {
        console.error("Lỗi cập nhật câu hỏi:", err.message);
        res.status(500).send('Lỗi khi cập nhật câu hỏi');
    }
});

// 6. Xử lý Xóa Question (Lệnh DELETE)
router.delete('/:id', async (req, res) => {
    try {
        await axiosInstance.delete(`/questions/${req.params.id}`);
        res.redirect('/ui/questions?deleted=true');
    } catch (err) {
        console.error("Lỗi xóa câu hỏi:", err.message);
        res.status(500).send('Lỗi khi xóa câu hỏi');
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