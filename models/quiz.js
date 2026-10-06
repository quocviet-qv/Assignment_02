const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizSchema = new Schema({
    title: { type: String, required: true }, // Tên của bài quiz
    description: { type: String }, // Mô tả hoặc hướng dẫn[cite: 1]
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }] // Mảng chứa ID của các câu hỏi liên kết với quiz[cite: 2]
});

module.exports = mongoose.model('Quiz', quizSchema);