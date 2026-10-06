const express = require('express');
const router = express.Router();
const axiosInstance = require('../axiosConfig');

// 1. Hiển thị danh sách câu hỏi
router.get('/', async (req, res) => {
    try {
        const response = await axiosInstance.get('/questions');
        res.render('questions/list', { questions: response.data });
    } catch (err) {
        console.error("Lỗi tải câu hỏi:", err.message);
        res.status(500).send('Lỗi Server (UI)');
    }
});

// 2. Hiển thị Form tạo câu hỏi mới
router.get('/create', (req, res) => {
    res.render('questions/create');
});

// 3. Xử lý lưu câu hỏi khi submit form
router.post('/', async (req, res) => {
    try {
        // Tùy thuộc vào code API bài 1 của bạn, dữ liệu từ form sẽ được gửi thẳng lên API
        await axiosInstance.post('/questions', req.body);
        res.redirect('/ui/questions');
    } catch (err) {
        console.error("Lỗi tạo câu hỏi:", err.message);
        res.status(500).send('Lỗi khi tạo câu hỏi');
    }
});


// 4. Hiển thị form Edit Question (Kèm dữ liệu cũ)
router.get('/:id/edit', async (req, res) => {
    try {
        const response = await axiosInstance.get(`/questions/${req.params.id}`);
        res.render('questions/edit', { question: response.data });
    } catch (err) {
        console.error("Lỗi tải trang sửa câu hỏi:", err.message);
        res.status(500).send('Lỗi khi tải trang chỉnh sửa');
    }
});

// 5. Xử lý Cập nhật Question (Lệnh PUT)
router.put('/:id', async (req, res) => {
    try {
        await axiosInstance.put(`/questions/${req.params.id}`, req.body);
        res.redirect('/ui/questions');
    } catch (err) {
        console.error("Lỗi cập nhật câu hỏi:", err.message);
        res.status(500).send('Lỗi khi cập nhật câu hỏi');
    }
});

// 6. Xử lý Xóa Question (Lệnh DELETE)
router.delete('/:id', async (req, res) => {
    try {
        await axiosInstance.delete(`/questions/${req.params.id}`);
        res.redirect('/ui/questions');
    } catch (err) {
        console.error("Lỗi xóa câu hỏi:", err.message);
        res.status(500).send('Lỗi khi xóa câu hỏi');
    }
});


module.exports = router;