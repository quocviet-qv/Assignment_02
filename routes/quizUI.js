const express = require('express');
const router = express.Router();
// Nhúng cấu hình Axios bạn đã tạo ở bước trước
const axiosInstance = require('../axiosConfig'); 

// Giao diện 1: Xem danh sách toàn bộ Quiz
router.get('/', async (req, res) => {
    try {
        // Axios sẽ đóng vai trò như một người dùng "gọi" vào API của Assignment 1
        const response = await axiosInstance.get('/quizzes');
        
        // Render ra file giao diện HTML và ném dữ liệu mảng 'quizzes' sang cho HTML hiển thị
        res.render('quiz/list', { quizzes: response.data });
    } catch (err) {
        console.error("Lỗi khi gọi API:", err.message);
        res.status(500).send('Internal Server Error (UI)');
    }
});

// Giao diện 2: Hiển thị Form tạo Quiz mới
router.get('/create', (req, res) => {
    res.render('quiz/create');
});

// Xử lý dữ liệu khi người dùng bấm nút "Create" trên form
router.post('/', async (req, res) => {
    try {
        // req.body sẽ chứa dữ liệu (title, description) từ form HTML gửi lên
        // Dùng Axios bắn thẳng dữ liệu này sang API gốc của Assignment 1
        await axiosInstance.post('/quizzes', req.body);
        
        // Lưu thành công thì tự động chuyển hướng về lại trang danh sách
        res.redirect('/ui/quizzes');
    } catch (err) {
        console.error("Lỗi khi tạo Quiz:", err.message);
        res.status(500).send('Lỗi khi tạo mới Quiz');
    }
});

// Giao diện 3: Xem chi tiết một bài Quiz (Đã cập nhật để lấy thêm danh sách câu hỏi)
router.get('/:id', async (req, res) => {
    try {
        // Lấy dữ liệu chi tiết của bài Quiz
        const quizResponse = await axiosInstance.get(`/quizzes/${req.params.id}`);
        // Lấy danh sách toàn bộ Câu hỏi để làm menu thả xuống cho người dùng chọn thêm vào
        const questionsResponse = await axiosInstance.get('/questions');
        
        res.render('quiz/details', { 
            quiz: quizResponse.data,
            allQuestions: questionsResponse.data 
        });
    } catch (err) {
        console.error("Lỗi khi xem chi tiết:", err.message);
        res.status(500).send('Lỗi khi tải chi tiết Quiz');
    }
});

// Xử lý việc Thêm câu hỏi vào bài Quiz
router.post('/:id/add-question', async (req, res) => {
    try {
        const quizId = req.params.id;
        const questionId = req.body.questionId;
        
        // Gọi API của Assignment 1 để liên kết câu hỏi này vào Quiz
        // (Lưu ý: API này phụ thuộc vào cách bạn thiết kế Assignment 1)
        await axiosInstance.post(`/quizzes/${quizId}/add-question`, { questionId });
        // Thêm xong thì load lại trang chi tiết đó
        res.redirect(`/ui/quizzes/${quizId}`);
    } catch (err) {
        console.error("Lỗi thêm câu hỏi vào quiz:", err.message);
        res.status(500).send('Lỗi khi liên kết câu hỏi. API Assignment 1 của bạn có thể chưa hỗ trợ đường dẫn này.');
    }
});


// Giao diện 4: Hiển thị form Edit Quiz (Kèm dữ liệu cũ)
router.get('/:id/edit', async (req, res) => {
    try {
        // Gọi API lấy dữ liệu hiện tại của Quiz để điền sẵn vào form
        const response = await axiosInstance.get(`/quizzes/${req.params.id}`);
        res.render('quiz/edit', { quiz: response.data });
    } catch (err) {
        console.error("Lỗi khi lấy dữ liệu edit:", err.message);
        res.status(500).send('Lỗi khi tải trang chỉnh sửa');
    }
});

// Xử lý Cập nhật Quiz (Nhận lệnh PUT từ form HTML)
router.put('/:id', async (req, res) => {
    try {
        // Gửi dữ liệu mới qua API bằng phương thức PUT
        await axiosInstance.put(`/quizzes/${req.params.id}`, req.body);
        // Cập nhật xong thì quay về trang danh sách
        res.redirect('/ui/quizzes');
    } catch (err) {
        console.error("Lỗi khi cập nhật:", err.message);
        res.status(500).send('Lỗi khi cập nhật Quiz');
    }
});


module.exports = router;