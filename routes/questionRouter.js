const express = require('express');
const bodyParser = require('body-parser');
const Question = require('../models/question');

const questionRouter = express.Router();
questionRouter.use(bodyParser.json());

// [API 6] GET /question - Lấy danh sách tất cả câu hỏi
questionRouter.get('/', async (req, res) => {
    try {
        const questions = await Question.find({});
        res.status(200).json(questions);
    } catch (err) { res.status(500).json(err); }
});

// [API 7] POST /question - Tạo 1 câu hỏi lẻ
questionRouter.post('/', async (req, res) => {
    try {
        const question = await Question.create(req.body);
        res.status(201).json(question);
    } catch (err) { res.status(500).json(err); }
});

// [API 8] GET /question/:questionId - Lấy chi tiết 1 câu hỏi theo ID
questionRouter.get('/:questionId', async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId);
        res.status(200).json(question);
    } catch (err) { res.status(500).json(err); }
});

// [API 9] PUT /question/:questionId - Cập nhật 1 câu hỏi theo ID
questionRouter.put('/:questionId', async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.questionId,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(question);
    } catch (err) { res.status(500).json(err); }
});

/// [API 10] DELETE /question/:questionId - Xóa 1 câu hỏi theo ID có thông báo
questionRouter.delete('/:questionId', async (req, res) => {
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