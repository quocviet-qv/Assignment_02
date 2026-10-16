const Question = require('./models/question');
const User = require('./models/user');
const jwt = require('jsonwebtoken');

const SECRET_KEY = '12345-67890-09876-54321'; // Phải khớp với bên routes/users.js

// ----------------------------------------------------
// 0. HÀM XÁC THỰC NGƯỜI DÙNG (BẰNG TOKEN THẬT)
// ----------------------------------------------------
exports.verifyUser = async (req, res, next) => {
    // Đọc token từ header "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        const err = new Error("You are not authenticated!");
        err.status = 401;
        return next(err);
    }

    const token = authHeader.split(' ')[1]; // Tách lấy chuỗi token
    
    try {
        // Giải mã token để lấy ID của user
        const decoded = jwt.verify(token, SECRET_KEY);
        // Tìm user trong Database và gán vào req.user để các hàm sau sử dụng
        const user = await User.findById(decoded._id);
        
        if (!user) throw new Error("User không tồn tại");
        
        req.user = user; // Gán toàn bộ thông tin user (bao gồm cả quyền admin)
        next();
    } catch (error) {
        const err = new Error("Token không hợp lệ hoặc đã hết hạn!");
        err.status = 401;
        return next(err);
    }
};

// ----------------------------------------------------
// 1. HÀM KIỂM TRA ADMIN (GIỮ NGUYÊN)
// ----------------------------------------------------
exports.verifyAdmin = (req, res, next) => {
    if (req.user && req.user.admin === true) {
        return next(); 
    } else {
        const err = new Error("You are not authorized to perform this operation!");
        err.status = 403;
        return next(err);
    }
};

// ----------------------------------------------------
// 2. HÀM KIỂM TRA TÁC GIẢ CÂU HỎI (GIỮ NGUYÊN)
// ----------------------------------------------------
exports.verifyAuthor = async (req, res, next) => {
    try {
        const questionId = req.params.id || req.params.questionId;
        const question = await Question.findById(questionId);
        
        if (!question) {
            const err = new Error("Question not found");
            err.status = 404;
            return next(err);
        }

        if (question.author && question.author.equals(req.user._id)) {
            return next(); 
        } else {
            const err = new Error("You are not the author of this question");
            err.status = 403;
            return next(err);
        }
    } catch (err) {
        return next(err);
    }
};