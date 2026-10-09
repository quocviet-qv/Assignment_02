const express = require('express');
const router = express.Router();
const axiosInstance = require('../axiosConfig'); 
const ejs = require('ejs');   // KHAI BÁO THÊM EJS
const path = require('path'); // KHAI BÁO THÊM PATH

// 1. Giao diện: Xem danh sách toàn bộ Quiz
router.get('/', async (req, res, next) => {
    try {
        const response = await axiosInstance.get('/quizzes');
        
        // BẮT CÁC TÍN HIỆU TỪ URL
        const isDeleted = req.query.deleted === 'true';
        const isCreated = req.query.created === 'true';
        const isUpdated = req.query.updated === 'true'; 

        // KẾT HỢP: Dịch file EJS thành HTML rồi nhét vào main.hbs
        const viewsPath = path.join(__dirname, '../views/quiz/list.ejs');
        ejs.renderFile(viewsPath, { 
            quizzes: response.data,
            showDeleted: isDeleted,
            showCreated: isCreated,
            showUpdated: isUpdated 
        }, (err, htmlString) => {
            if (err) return next(err);
            res.render('layouts/main.hbs', { body: htmlString });
        });

    } catch (err) {
        console.error("Lỗi khi gọi API:", err.message);
        res.status(500).send('Internal Server Error (UI)');
    }
});

// 2. Giao diện: Hiển thị Form tạo Quiz mới
router.get('/create', (req, res, next) => {
    const viewsPath = path.join(__dirname, '../views/quiz/create.ejs');
    ejs.renderFile(viewsPath, {}, (err, htmlString) => {
        if (err) return next(err);
        res.render('layouts/main.hbs', { body: htmlString });
    });
});

// 3. Xử lý: Lưu Quiz mới vào Database
router.post('/', async (req, res) => {
    try {
        await axiosInstance.post('/quizzes', req.body);
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
router.get('/:id/edit', async (req, res, next) => {
    try {
        const response = await axiosInstance.get(`/quizzes/${req.params.id}`);
        
        const viewsPath = path.join(__dirname, '../views/quiz/edit.ejs');
        ejs.renderFile(viewsPath, { quiz: response.data }, (err, htmlString) => {
            if (err) return next(err);
            res.render('layouts/main.hbs', { body: htmlString });
        });
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu edit:", err.message);
        res.status(500).send('Lỗi khi tải trang chỉnh sửa');
    }
});

// 5. Xử lý: Thêm câu hỏi vào bài Quiz 
router.post('/:id/add-question', async (req, res) => {
    try {
        const quizId = req.params.id;
        const questionId = req.body.questionId;
        
        await axiosInstance.post(`/quizzes/${quizId}/add-question`, { questionId });
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
        res.redirect('/ui/quizzes?deleted=true');
    } catch (err) {
        console.error("Lỗi khi xóa:", err.message);
        res.status(500).send('Lỗi khi xóa Quiz');
    }
});

// 8. Giao diện: Xem chi tiết một bài Quiz
router.get('/:id', async (req, res, next) => {
    try {
        const quizResponse = await axiosInstance.get(`/quizzes/${req.params.id}`);
        const questionsResponse = await axiosInstance.get('/questions');
        const isSuccess = req.query.success === 'true';
        
        const viewsPath = path.join(__dirname, '../views/quiz/details.ejs');
        ejs.renderFile(viewsPath, { 
            quiz: quizResponse.data,
            allQuestions: questionsResponse.data,
            showSuccess: isSuccess 
        }, (err, htmlString) => {
            if (err) return next(err);
            res.render('layouts/main.hbs', { body: htmlString });
        });
    } catch (err) {
        console.error("Lỗi khi xem chi tiết:", err.message);
        res.status(500).send('Lỗi khi tải chi tiết Quiz');
    }
});

module.exports = router;