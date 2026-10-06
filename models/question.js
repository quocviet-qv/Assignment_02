const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    text: { type: String, required: true }, // Nội dung câu hỏi[cite: 2]
    options: [{ type: String }], // Mảng các lựa chọn đáp án[cite: 2]
    keywords: [{ type: String }], // Mảng các từ khóa[cite: 2]
    correctAnswerIndex: { type: Number, required: true } // Vị trí của đáp án đúng trong mảng options[cite: 2]
});

module.exports = mongoose.model('Question', questionSchema);