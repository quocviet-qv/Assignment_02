const express = require('express');
const router = express.Router();
const axiosInstance = require('../axiosConfig');

// 1. Hiển thị danh sách câu hỏi
router.get('/', async (req, res) => {
    try {
        const response = await axiosInstance.get('/questions');
        
        // BẮT CÁC TÍN HIỆU TỪ URL
        const isCreated = req.query.created === 'true';
        const isDeleted = req.query.deleted === 'true';
        const isUpdated = req.query.updated === 'true'; // Thêm tín hiệu chỉnh sửa

        res.render('questions/list', { 
            questions: response.data,
            showCreated: isCreated,
            showDeleted: isDeleted,
            showUpdated: isUpdated // Gửi biến này ra giao diện EJS
        });
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
        await axiosInstance.post('/questions', req.body);
        
        // TẠO XONG THÌ QUAY VỀ DANH SÁCH VÀ BẬT TÍN HIỆU created=true
        res.redirect('/ui/questions?created=true');
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
        
        // SỬA XONG THÌ QUAY VỀ DANH SÁCH VÀ BẬT TÍN HIỆU updated=true
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
        
        // XÓA XONG THÌ QUAY VỀ KÈM TÍN HIỆU deleted=true
        res.redirect('/ui/questions?deleted=true');
    } catch (err) {
        console.error("Lỗi xóa câu hỏi:", err.message);
        res.status(500).send('Lỗi khi xóa câu hỏi');
    }
});

// Giao diện: Xem chi tiết một Câu hỏi
router.get('/:id', async (req, res) => {
    try {
        const response = await axiosInstance.get(`/questions/${req.params.id}`);
        res.render('questions/details', { question: response.data });
    } catch (err) {
        console.error("Lỗi khi tải chi tiết câu hỏi:", err.message);
        res.status(500).send('Lỗi khi tải chi tiết câu hỏi');
    }
});


module.exports = router;