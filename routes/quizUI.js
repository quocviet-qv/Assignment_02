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

// 3. Xử lý: Lưu Quiz mới vào Database (Cần Token Admin)
router.post('/', async (req, res) => {
    try {
        const token = req.cookies.token;
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        await axiosInstance.post('/quizzes', req.body, config);
        res.redirect('/ui/quizzes?created=true');
    } catch (err) {
        console.error("Lỗi khi tạo Quiz:", err.message);
        res.status(403).send('<h1>Lỗi 403: Bạn không có quyền Admin để tạo Quiz!</h1><a href="/ui/quizzes">Quay lại</a>');
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

// 5. Xử lý: Thêm NHIỀU câu hỏi vào bài Quiz (Cần Token Admin)
router.post('/:id/add-question', async (req, res) => {
    try {
        const quizId = req.params.id;
        // Nhận mảng các câu hỏi được chọn từ form (checkbox)
        let questionIds = req.body.questionIds; 
        
        // Nếu người dùng không chọn câu nào mà lỡ bấm Submit thì quay lại
        if (!questionIds) {
            return res.redirect(`/ui/quizzes/${quizId}`);
        }

        // Nếu người dùng chỉ chọn 1 checkbox, dữ liệu sẽ là String -> Chuyển thành Mảng để dễ dùng vòng lặp
        if (!Array.isArray(questionIds)) {
            questionIds = [questionIds];
        }
        
        const token = req.cookies.token;
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        // Lặp qua từng câu hỏi được tick và tự động gửi xuống Backend
        for (let qId of questionIds) {
            await axiosInstance.post(`/quizzes/${quizId}/add-question`, { questionId: qId }, config);
        }

        res.redirect(`/ui/quizzes/${quizId}?success=true`);
    } catch (err) {
        console.error("Lỗi thêm câu hỏi vào quiz:", err.message);
        res.status(403).send('<h1>Lỗi 403: Bạn không có quyền Admin!</h1><a href="/ui/quizzes">Quay lại</a>');
    }
});

// ==========================================
// CÁC ROUTE CHỈ CÓ /:id PHẢI ĐẶT DƯỚI CÙNG
// ==========================================

// 6. Xử lý: Cập nhật Quiz (Lệnh PUT - Cần Token Admin)
router.put('/:id', async (req, res) => {
    try {
        const token = req.cookies.token;
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        await axiosInstance.put(`/quizzes/${req.params.id}`, req.body, config);
        res.redirect('/ui/quizzes?updated=true');
    } catch (err) {
        console.error("Lỗi khi cập nhật:", err.message);
        res.status(403).send('<h1>Lỗi 403: Bạn không có quyền Admin để sửa Quiz!</h1><a href="/ui/quizzes">Quay lại</a>');
    }
});

// 7. Xử lý: Xóa Quiz (Lệnh DELETE - Cần Token Admin)
router.delete('/:id', async (req, res) => {
    try {
        const token = req.cookies.token;
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        await axiosInstance.delete(`/quizzes/${req.params.id}`, config);
        res.redirect('/ui/quizzes?deleted=true');
    } catch (err) {
        console.error("Lỗi khi xóa:", err.message);
        res.status(403).send('<h1>Lỗi 403: Bạn không có quyền Admin để xóa Quiz!</h1><a href="/ui/quizzes">Quay lại</a>');
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