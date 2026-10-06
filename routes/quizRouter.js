const express = require('express');
const bodyParser = require('body-parser');
const Quiz = require('../models/quiz');
const Question = require('../models/question');

const quizRouter = express.Router();
quizRouter.use(bodyParser.json());

// [API 1] GET /quizzes - Lấy tất cả Quiz kèm câu hỏi chi tiết
quizRouter.get('/', async (req, res) => {
    try {
        const quizzes = await Quiz.find({}).populate('questions');
        res.status(200).json(quizzes);
    } catch (err) { res.status(500).json(err); }
});

// [API 2] POST /quizzes - Tạo 1 Quiz mới
quizRouter.post('/', async (req, res) => {
    try {
        const quiz = await Quiz.create(req.body);
        res.status(200).json({ message: `Added the quiz with id: ${quiz._id}`, quiz });
    } catch (err) { res.status(500).json(err); }
});

// [API 3] GET /quizzes/:quizId - Lấy 1 Quiz theo ID
quizRouter.get('/:quizId', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate('questions');
        res.status(200).json(quiz);
    } catch (err) { res.status(500).json(err); }
});

// [API 4] PUT /quizzes/:quizId - Cập nhật 1 Quiz theo ID
quizRouter.put('/:quizId', async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.quizId,
            { $set: req.body },
            { new: true } // Trả về dữ liệu mới sau khi sửa
        );
        res.status(200).json(quiz);
    } catch (err) { res.status(500).json(err); }
});

// [API 5] DELETE /quizzes/:quizId - Xóa 1 Quiz
quizRouter.delete('/:quizId', async (req, res) => {
    try {
        // 1. Tìm và xóa bài Quiz
        const deletedQuiz = await Quiz.findByIdAndDelete(req.params.quizId);
        
        if (!deletedQuiz) {
            return res.status(404).json({ message: "Không tìm thấy bài Quiz này!" });
        }

        // 2. Xóa tất cả các Question có ID nằm trong mảng questions của bài Quiz vừa xóa
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

// [API 11] GET /quizzes/:quizId/populate - Lọc câu hỏi có chữ "capital"
quizRouter.get('/:quizId/populate', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate({
            path: 'questions',
            match: { text: { $regex: 'capital',$options: 'i' } } // Tìm chữ capital không phân biệt hoa thường
        });
        res.status(200).json(quiz);
    } catch (err) { res.status(500).json(err); }
});

// [API 12] POST /quizzes/:quizId/question - Thêm 1 câu hỏi vào Quiz
quizRouter.post('/:quizId/question', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Không tìm thấy bài Quiz với ID này (có thể đã bị xóa)!" });
        }
        const question = await Question.create(req.body);
        quiz.questions.push(question._id);
        await quiz.save();
        res.status(201).json(question);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// [API 13] POST /quizzes/:quizId/questions - Thêm NHIỀU câu hỏi vào Quiz
quizRouter.post('/:quizId/questions', async (req, res) => {
    try {
        const questions = await Question.insertMany(req.body);
        const questionIds = questions.map(q => q._id);
        const quiz = await Quiz.findById(req.params.quizId);
        quiz.questions.push(...questionIds);
        await quiz.save();
        res.status(200).json({ message: "Questions added successfully." });
    } catch (err) { res.status(500).json(err); }
});


// API: Thêm một câu hỏi có sẵn vào bài Quiz (Đã sửa lỗi trùng link và sai tên biến)
quizRouter.post('/:id/add-question', async (req, res) => {
    try {
        const quizId = req.params.id;
        const questionId = req.body.questionId;
        
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Không tìm thấy bài Quiz' });
        }
        
        // Kiểm tra xem câu hỏi này đã được thêm vào trước đó chưa (tránh trùng lặp)
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