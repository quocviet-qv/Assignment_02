const express = require('express');
const bodyParser = require('body-parser');
const Question = require('../models/question');
const authenticate = require('../authenticate'); // Nhúng file bảo mật

const questionRouter = express.Router();
questionRouter.use(bodyParser.json());

// ==========================================
// CÁC API MỞ (AI CŨNG CÓ THỂ XEM - GET)
// ==========================================

// [API 6] GET /question - Lấy danh sách tất cả câu hỏi
questionRouter.get('/', async (req, res) => {
    try {
      // Thêm .populate('author', 'username') để lấy tên người tạo
        const questions = await Question.find({}).populate('author', 'username');
        res.status(200).json(questions);
    } catch (err) { res.status(500).json(err); }
});

// [API 8] GET /question/:questionId - Lấy chi tiết 1 câu hỏi theo ID
questionRouter.get('/:questionId', async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId);
        res.status(200).json(question);
    } catch (err) { res.status(500).json(err); }
});

// ==========================================
// CÁC API BẢO MẬT (POST, PUT, DELETE)
// ==========================================

// [API 7] POST /question - Tạo 1 câu hỏi lẻ (Chỉ cần đăng nhập)
questionRouter.post('/', authenticate.verifyUser, async (req, res) => {
    try {
        // BẮT BUỘC: Gán người tạo câu hỏi chính là user đang đăng nhập
        req.body.author = req.user._id; 
        
        const question = await Question.create(req.body);
        res.status(201).json(question);
    } catch (err) { res.status(500).json(err); }
});

// [API 9] PUT /question/:questionId - Cập nhật 1 câu hỏi theo ID (Chỉ Tác giả mới được sửa)
questionRouter.put('/:questionId', authenticate.verifyUser, authenticate.verifyAuthor, async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.questionId,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(question);
    } catch (err) { res.status(500).json(err); }
});

/// [API 10] DELETE /question/:questionId - Xóa 1 câu hỏi theo ID (Chỉ Tác giả mới được xóa)
questionRouter.delete('/:questionId', authenticate.verifyUser, authenticate.verifyAuthor, async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.questionId);
        
        // Nếu không tìm thấy câu hỏi (do truyền sai ID hoặc đã bị xóa trước đó)
        if (!deletedQuestion) {
            return res.status(404).json({ message: "Không tìm thấy câu hỏi này!" });
        }

        // Trả về thông báo thành công kèm theo dữ liệu vừa bị xóa
        res.status(200).json({ 
            message: "Đã xóa câu hỏi thành công!", 
            deletedData: deletedQuestion 
        });
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

module.exports = questionRouter;