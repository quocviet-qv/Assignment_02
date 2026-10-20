const express = require('express');
const bodyParser = require('body-parser');
const Question = require('../models/question');
const authenticate = require('../authenticate'); 

const questionRouter = express.Router();
questionRouter.use(bodyParser.json());

// [API MỞ] - Bất kỳ ai cũng có thể xem danh sách và chi tiết
questionRouter.get('/', async (req, res) => {
    try {
        const questions = await Question.find({}).populate('author', 'username');
        res.status(200).json(questions);
    } catch (err) { res.status(500).json(err); }
});

questionRouter.get('/:questionId', async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId).populate('author', 'username');
        res.status(200).json(question);
    } catch (err) { res.status(500).json(err); }
});

// [API TẠO MỚI] - Đăng nhập (User hoặc Admin) là tạo được
questionRouter.post('/', authenticate.verifyUser, async (req, res) => {
    try {
        req.body.author = req.user._id; 
        const question = await Question.create(req.body);
        res.status(201).json(question);
    } catch (err) { res.status(500).json(err); }
});

// [API CẬP NHẬT] - Chỉ tác giả mới được phép sửa
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

// [API XÓA] - Chỉ tác giả mới được phép xóa
questionRouter.delete('/:questionId', authenticate.verifyUser, authenticate.verifyAuthor, async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.questionId);
        if (!deletedQuestion) {
            return res.status(404).json({ message: "Không tìm thấy câu hỏi này!" });
        }
        res.status(200).json({ message: "Đã xóa câu hỏi thành công!", deletedData: deletedQuestion });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = questionRouter;