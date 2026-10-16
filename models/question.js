const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    text: { type: String, required: true }, // Nội dung câu hỏi
    
    // BỔ SUNG YÊU CẦU CỦA ASSIGNMENT 3: Thêm trường tác giả
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    
    options: [{ type: String }], // Mảng các lựa chọn đáp án
    keywords: [{ type: String }], // Mảng các từ khóa
    correctAnswerIndex: { type: Number, required: true } // Vị trí của đáp án đúng
});

module.exports = mongoose.model('Question', questionSchema);