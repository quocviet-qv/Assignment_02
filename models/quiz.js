const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizSchema = new Schema({
    title: { type: String, required: true }, // Tên của bài quiz
    description: { type: String }, // Mô tả hoặc hướng dẫn
    
    // BỔ SUNG: Thêm trường tác giả để ghi nhận người tạo bài Quiz
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }] // Mảng chứa ID của các câu hỏi liên kết với quiz
});

module.exports = mongoose.model('Quiz', quizSchema);