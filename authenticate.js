const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Question = require('./models/question');
const Quiz = require('./models/quiz');

const SECRET_KEY = '12345-67890-09876-54321';

// 1. Kiểm tra đã đăng nhập chưa
exports.verifyUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        const err = new Error("You are not authenticated!");
        err.status = 401;
        return next(err);
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded._id);
        if (!user) throw new Error("User không tồn tại");
        req.user = user;
        next();
    } catch (error) {
        const err = new Error("Token không hợp lệ hoặc đã hết hạn!");
        err.status = 401;
        return next(err);
    }
};

// 2. Kiểm tra có phải Admin không
exports.verifyAdmin = (req, res, next) => {
    if (req.user && req.user.admin === true) {
        return next();
    } else {
        const err = new Error("Bạn không có quyền Admin để thực hiện thao tác này!");
        err.status = 403;
        return next(err);
    }
};

// 3. Kiểm tra Tác giả CÂU HỎI (Áp dụng chặn Admin xóa bài User)
exports.verifyAuthor = async (req, res, next) => {
    try {
        const questionId = req.params.id || req.params.questionId;
        const question = await Question.findById(questionId);
        if (!question) {
            const err = new Error("Question not found");
            err.status = 404;
            return next(err);
        }
        
        // Kiểm tra bắt buộc: ID người dùng phải khớp với ID tác giả
        if (question.author && question.author.equals(req.user._id)) {
            return next(); 
        } else {
            const err = new Error("Bạn không phải tác giả! Dù là Admin cũng không được phép xóa/sửa câu hỏi của người khác.");
            err.status = 403;
            return next(err);
        }
    } catch (err) {
        return next(err);
    }
};

// 4. Kiểm tra Tác giả QUIZ
exports.verifyQuizAuthor = async (req, res, next) => {
    try {
        const quizId = req.params.id || req.params.quizId;
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            const err = new Error("Quiz not found");
            err.status = 404;
            return next(err);
        }
        
        if (quiz.author && quiz.author.equals(req.user._id)) {
            return next(); 
        } else {
            const err = new Error("Bạn không phải là tác giả của bài Quiz này!");
            err.status = 403;
            return next(err);
        }
    } catch (err) {
        return next(err);
    }
};