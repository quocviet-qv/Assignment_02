var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// 1. Thêm thư viện method-override để form HTML hỗ trợ PUT/DELETE
var methodOverride = require('method-override');

require('dotenv').config();
const mongoose = require('mongoose');

// Các Router API (Lõi của Assignment 1)
const quizRouter = require('./routes/quizRouter');
const questionRouter = require('./routes/questionRouter');

var app = express();

const url = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/SimpleQuiz';
mongoose.connect(url)
    .then(() => console.log('Connected correctly to MongoDB database: SimpleQuiz'))
    .catch((err) => console.log('Error connecting to MongoDB:', err));

// 2. CẤU HÌNH VIEW ENGINE CHO ASSIGNMENT 2 (GIAO DIỆN)
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', require('hbs').__express); // Khai báo hỗ trợ Handlebars
app.engine('ejs', require('ejs').__express); // Khai báo hỗ trợ EJS
app.set('view engine', 'ejs'); // Đặt EJS làm mặc định theo yêu cầu đề bài

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Kích hoạt method-override
app.use(methodOverride('_method'));

// 3. ĐỊNH TUYẾN CÁC ĐƯỜNG DẪN API (Dữ liệu ngầm)
app.use('/quizzes', quizRouter);
app.use('/question', questionRouter);
app.use('/questions', questionRouter);

// --- TƯƠNG LAI: BẠN SẼ KHAI BÁO CÁC ROUTER GIAO DIỆN Ở ĐÂY ---
// Ví dụ: app.use('/ui/quizzes', quizUIRouter); 
const quizUIRouter = require('./routes/quizUI');
app.use('/ui/quizzes', quizUIRouter);

const questionUIRouter = require('./routes/questionUI');
app.use('/ui/questions', questionUIRouter);

// Bắt lỗi 404 (gõ sai đường dẫn) và trả về JSON
app.use(function(req, res, next) {
  res.status(404).json({
    status: 404,
    message: "Đường dẫn này không tồn tại!"
  });
});

// Bắt các lỗi hệ thống khác và trả về JSON thay vì HTML
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message
  });
});

module.exports = app;