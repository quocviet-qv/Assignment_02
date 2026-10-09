const indexRouter = require('./routes/index');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// 1. Thêm thư viện method-override để form HTML hỗ trợ PUT/DELETE
var methodOverride = require('method-override');
// THÊM DÒNG NÀY ĐỂ KHỞI TẠO HANDLEBARS
const hbs = require('hbs'); 

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

// 2. CẤU HÌNH VIEW ENGINE ĐỂ KẾT HỢP EJS VÀ HBS
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs.__express); // Khai báo hỗ trợ Handlebars
app.engine('ejs', require('ejs').__express); // Khai báo hỗ trợ EJS
app.set('view engine', 'ejs'); // Vẫn để EJS làm mặc định để biên dịch dữ liệu

// ĐĂNG KÝ THƯ MỤC PARTIALS CHO HANDLEBARS (CHÌA KHÓA KẾT HỢP NẰM Ở ĐÂY)
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

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

// 4. KHAI BÁO CÁC ROUTER GIAO DIỆN (UI)
const quizUIRouter = require('./routes/quizUI');
app.use('/ui/quizzes', quizUIRouter);

const questionUIRouter = require('./routes/questionUI');
app.use('/ui/questions', questionUIRouter);

// 5. KÍCH HOẠT TRANG CHỦ
app.use('/', indexRouter);

// 6. Bắt lỗi 404 (Khi người dùng gõ sai đường dẫn)
app.use(function(req, res, next) {
    next(createError(404, "Đường dẫn này không tồn tại!"));
});

// 7. Bắt các lỗi hệ thống khác (Error Handler)
app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
        status: err.status || 500,
        message: err.message
    });
});

module.exports = app;