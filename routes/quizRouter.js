const express = require('express');
const bodyParser = require('body-parser');
const Quiz = require('../models/quiz');
const Question = require('../models/question');
const authenticate = require('../authenticate'); // Import file authenticate bảo mật

const quizRouter = express.Router();
quizRouter.use(bodyParser.json());

// ==========================================
// CÁC API MỞ (BẤT KỲ AI CŨNG CÓ THỂ XEM - GET)
// ==========================================

// [API 1] GET /quizzes - Lấy tất cả Quiz kèm câu hỏi chi tiết và Tác giả
quizRouter.get('/', async (req, res) => {
    try {
        // Thêm populate('author', 'username') để lấy tên tác giả bài Quiz
        const quizzes = await Quiz.find({})
            .populate('questions')
            .populate('author', 'username');
        res.status(200).json(quizzes);
    } catch (err) { res.status(500).json(err); }
});

// [API 3] GET /quizzes/:quizId - Lấy 1 Quiz theo ID kèm Tác giả
quizRouter.get('/:quizId', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId)
            .populate('questions')
            .populate('author', 'username');
        res.status(200).json(quiz);
    } catch (err) { res.status(500).json(err); }
});

// [API 11] GET /quizzes/:quizId/populate - Lọc câu hỏi có chữ "capital"
quizRouter.get('/:quizId/populate', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId)
            .populate({
                path: 'questions',
                match: { text: { $regex: 'capital',$options: 'i' } } 
            })
            .populate('author', 'username');
        res.status(200).json(quiz);
    } catch (err) { res.status(500).json(err); }
});

// ==========================================
// CÁC API BẢO MẬT (CHỈ ADMIN MỚI ĐƯỢC PHÉP - POST/PUT/DELETE)
// ==========================================

// [API 2] POST /quizzes - Tạo 1 Quiz mới
quizRouter.post('/', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res) => {
    try {
        // BỔ SUNG: Gán người tạo bài Quiz chính là Admin đang đăng nhập
        req.body.author = req.user._id; 
        
        const quiz = await Quiz.create(req.body);
        res.status(200).json({ message: `Added the quiz with id: ${quiz._id}`, quiz });
    } catch (err) { res.status(500).json(err); }
});

// [API 4] PUT /quizzes/:quizId - Cập nhật 1 Quiz theo ID
quizRouter.put('/:quizId', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.quizId,
            { $set: req.body },
            { new: true } 
        );
        res.status(200).json(quiz);
    } catch (err) { res.status(500).json(err); }
});

// [API 5] DELETE /quizzes/:quizId - Xóa 1 Quiz
quizRouter.delete('/:quizId', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res) => {
    try {
        const deletedQuiz = await Quiz.findByIdAndDelete(req.params.quizId);
        
        if (!deletedQuiz) {
            return res.status(404).json({ message: "Không tìm thấy bài Quiz này!" });
        }

        if (deletedQuiz.questions && deletedQuiz.questions.length > 0) {
            await Question.deleteMany({ _id: { $in: deletedQuiz.questions } });
        }

        res.status(200).json({ 
            message: "Đã xóa bài Quiz thành công!", 
            deletedData: deletedQuiz 
        });
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// [API 12] POST /quizzes/:quizId/question - Thêm 1 câu hỏi mới vào Quiz
quizRouter.post('/:quizId/question', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Không tìm thấy bài Quiz với ID này" });
        }
        
        // Gán người tạo là Admin đang đăng nhập để tránh lỗi khi Question cần author
        req.body.author = req.user._id; 
        
        const question = await Question.create(req.body);
        quiz.questions.push(question._id);
        await quiz.save();
        res.status(201).json(question);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// [API 13] POST /quizzes/:quizId/questions - Thêm NHIỀU câu hỏi mới vào Quiz
quizRouter.post('/:quizId/questions', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res) => {
    try {
        // Gán author cho từng câu hỏi trong mảng
        const questionsData = req.body.map(q => ({ ...q, author: req.user._id }));
        const questions = await Question.insertMany(questionsData);
        
        const questionIds = questions.map(q => q._id);
        const quiz = await Quiz.findById(req.params.quizId);
        quiz.questions.push(...questionIds);
        await quiz.save();
        res.status(200).json({ message: "Questions added successfully." });
    } catch (err) { res.status(500).json(err); }
});

// API: Thêm một câu hỏi có sẵn vào bài Quiz
quizRouter.post('/:id/add-question', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res) => {
    try {
        const quizId = req.params.id;
        const questionId = req.body.questionId;
        
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Không tìm thấy bài Quiz' });
        }
        
        if (!quiz.questions.includes(questionId)) {
            quiz.questions.push(questionId); 
            await quiz.save();               
        }
        
        res.status(200).json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server khi thêm câu hỏi" });
    }
});

module.exports = quizRouter;