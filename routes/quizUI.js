const express = require('express');
const router = express.Router();
const axiosInstance = require('../axiosConfig'); 

// 1. Giao diện: Xem danh sách toàn bộ Quiz
router.get('/', async (req, res) => {
    try {
        const response = await axiosInstance.get('/quizzes');
        
        // BẮT CÁC TÍN HIỆU TỪ URL
        const isDeleted = req.query.deleted === 'true';
        const isCreated = req.query.created === 'true';
        const isUpdated = req.query.updated === 'true'; // Tín hiệu vừa chỉnh sửa xong

        res.render('quiz/list', { 
            quizzes: response.data,
            showDeleted: isDeleted,
            showCreated: isCreated,
            showUpdated: isUpdated // Gửi ra file giao diện
        });
    } catch (err) {
        console.error("Lỗi khi gọi API:", err.message);
        res.status(500).send('Internal Server Error (UI)');
    }
});

// 2. Giao diện: Hiển thị Form tạo Quiz mới
router.get('/create', (req, res) => {
    res.render('quiz/create');
});

// 3. Xử lý: Lưu Quiz mới vào Database
router.post('/', async (req, res) => {
    try {
        await axiosInstance.post('/quizzes', req.body);
        
        // TẠO XONG THÌ TRỞ VỀ DANH SÁCH VÀ BẬT TÍN HIỆU created=true
        res.redirect('/ui/quizzes?created=true');
    } catch (err) {
        console.error("Lỗi khi tạo Quiz:", err.message);
        res.status(500).send('Lỗi khi tạo mới Quiz');
    }
});

// ==========================================
// CÁC ROUTE CÓ ĐUÔI PHỨC TẠP PHẢI ĐẶT TRÊN CÙNG
// ==========================================

// 4. Giao diện: Hiển thị form Edit Quiz (Kèm dữ liệu cũ)
router.get('/:id/edit', async (req, res) => {
    try {
        const response = await axiosInstance.get(`/quizzes/${req.params.id}`);
        res.render('quiz/edit', { quiz: response.data });
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu edit:", err.message);
        res.status(500).send('Lỗi khi tải trang chỉnh sửa');
    }
});

// 5. Xử lý: Thêm câu hỏi vào bài Quiz (ĐÃ THÊM LOGIC THÔNG BÁO)
router.post('/:id/add-question', async (req, res) => {
    try {
        const quizId = req.params.id;
        const questionId = req.body.questionId;
        
        await axiosInstance.post(`/quizzes/${quizId}/add-question`, { questionId });
        
        // Thêm câu hỏi xong, nối thêm đuôi ?success=true vào đường dẫn để báo cho giao diện
        res.redirect(`/ui/quizzes/${quizId}?success=true`);
    } catch (err) {
        console.error("Lỗi thêm câu hỏi vào quiz:", err.message);
        res.status(500).send('Lỗi khi liên kết câu hỏi.');
    }
});

// ==========================================
// CÁC ROUTE CHỈ CÓ /:id PHẢI ĐẶT DƯỚI CÙNG
// ==========================================

// 6. Xử lý: Cập nhật Quiz (Lệnh PUT)
router.put('/:id', async (req, res) => {
    try {
        await axiosInstance.put(`/quizzes/${req.params.id}`, req.body);
        
        // SỬA XONG THÌ QUAY VỀ DANH SÁCH VÀ BẬT TÍN HIỆU updated=true
        res.redirect('/ui/quizzes?updated=true');
    } catch (err) {
        console.error("Lỗi khi cập nhật:", err.message);
        res.status(500).send('Lỗi khi cập nhật Quiz');
    }
});

// 7. Xử lý: Xóa Quiz (Lệnh DELETE)
router.delete('/:id', async (req, res) => {
    try {
        await axiosInstance.delete(`/quizzes/${req.params.id}`);
        
        // SAU KHI XÓA XONG, QUAY VỀ DANH SÁCH VÀ BẬT TÍN HIỆU deleted=true
        res.redirect('/ui/quizzes?deleted=true');
    } catch (err) {
        console.error("Lỗi khi xóa:", err.message);
        res.status(500).send('Lỗi khi xóa Quiz');
    }
});

// 8. Giao diện: Xem chi tiết một bài Quiz (ĐÃ THÊM LOGIC NHẬN THÔNG BÁO)
router.get('/:id', async (req, res) => {
    try {
        const quizResponse = await axiosInstance.get(`/quizzes/${req.params.id}`);
        const questionsResponse = await axiosInstance.get('/questions');
        
        // Nhận tín hiệu success từ URL (nếu có)
        const isSuccess = req.query.success === 'true';
        
        res.render('quiz/details', { 
            quiz: quizResponse.data,
            allQuestions: questionsResponse.data,
            showSuccess: isSuccess // Truyền biến này sang giao diện HTML
        });
    } catch (err) {
        console.error("Lỗi khi xem chi tiết:", err.message);
        res.status(500).send('Lỗi khi tải chi tiết Quiz');
    }
});

module.exports = router;