const express = require('express');
const bodyParser = require('body-parser');
const Quiz = require('../models/quiz');
const Question = require('../models/question');
const authenticate = require('../authenticate'); 

const quizRouter = express.Router();
quizRouter.use(bodyParser.json());

// [API MỞ] - Bất kỳ ai cũng có thể xem
quizRouter.get('/', async (req, res) => {
    try {
        const quizzes = await Quiz.find({})
            .populate('questions')
            .populate('author', 'username');
        res.status(200).json(quizzes);
    } catch (err) { res.status(500).json(err); }
});

quizRouter.get('/:quizId', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId)
            .populate('questions')
            .populate('author', 'username');
        res.status(200).json(quiz);
    } catch (err) { res.status(500).json(err); }
});

// [API TẠO MỚI] - Chỉ Admin mới có quyền tạo Quiz
quizRouter.post('/', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res) => {
    try {
        req.body.author = req.user._id; 
        const quiz = await Quiz.create(req.body);
        res.status(200).json({ message: `Added the quiz with id: ${quiz._id}`, quiz });
    } catch (err) { res.status(500).json(err); }
});

// [API CẬP NHẬT] - Chỉ Admin Tác giả mới được sửa
quizRouter.put('/:quizId', authenticate.verifyUser, authenticate.verifyAdmin, authenticate.verifyQuizAuthor, async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.quizId,
            { $set: req.body },
            { new: true } 
        );
        res.status(200).json(quiz);
    } catch (err) { res.status(500).json(err); }
});

// [API XÓA] - Chỉ Admin Tác giả mới được xóa
quizRouter.delete('/:quizId', authenticate.verifyUser, authenticate.verifyAdmin, authenticate.verifyQuizAuthor, async (req, res) => {
    try {
        const deletedQuiz = await Quiz.findByIdAndDelete(req.params.quizId);
        if (!deletedQuiz) {
            return res.status(404).json({ message: "Không tìm thấy bài Quiz này!" });
        }
        if (deletedQuiz.questions && deletedQuiz.questions.length > 0) {
            await Question.deleteMany({ _id: { $in: deletedQuiz.questions } });
        }
        res.status(200).json({ message: "Đã xóa bài Quiz thành công!", deletedData: deletedQuiz });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// [API THÊM CÂU HỎI VÀO QUIZ] - Chỉ Admin Tác giả
quizRouter.post('/:quizId/question', authenticate.verifyUser, authenticate.verifyAdmin, authenticate.verifyQuizAuthor, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) return res.status(404).json({ message: "Không tìm thấy bài Quiz" });
        
        req.body.author = req.user._id; 
        const question = await Question.create(req.body);
        quiz.questions.push(question._id);
        await quiz.save();
        res.status(201).json(question);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

quizRouter.post('/:quizId/questions', authenticate.verifyUser, authenticate.verifyAdmin, authenticate.verifyQuizAuthor, async (req, res) => {
    try {
        const questionsData = req.body.map(q => ({ ...q, author: req.user._id }));
        const questions = await Question.insertMany(questionsData);
        
        const questionIds = questions.map(q => q._id);
        const quiz = await Quiz.findById(req.params.quizId);
        quiz.questions.push(...questionIds);
        await quiz.save();
        res.status(200).json({ message: "Questions added successfully." });
    } catch (err) { res.status(500).json(err); }
});

quizRouter.post('/:id/add-question', authenticate.verifyUser, authenticate.verifyAdmin, authenticate.verifyQuizAuthor, async (req, res) => {
    try {
        const quizId = req.params.id;
        const questionId = req.body.questionId;
        
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Không tìm thấy bài Quiz' });
        
        if (!quiz.questions.includes(questionId)) {
            quiz.questions.push(questionId); 
            await quiz.save();               
        }
        res.status(200).json(quiz);
    } catch (error) { res.status(500).json({ message: "Lỗi server khi thêm câu hỏi" }); }
});

module.exports = quizRouter;