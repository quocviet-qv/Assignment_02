var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config();
const mongoose = require('mongoose');
const quizRouter = require('./routes/quizRouter');
const questionRouter = require('./routes/questionRouter');

var app = express();

const url = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/SimpleQuiz';
mongoose.connect(url)
    .then(() => console.log('Connected correctly to MongoDB database: SimpleQuiz'))
    .catch((err) => console.log('Error connecting to MongoDB:', err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Chỉ gắn các đường dẫn API của bạn vào hệ thống
app.use('/quizzes', quizRouter);
app.use('/question', questionRouter);
app.use('/questions', questionRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// Bắt lỗi 404 (gõ sai đường dẫn) và trả về JSON
app.use(function(req, res, next) {
  res.status(404).json({
    status: 404,
    message: "Đường dẫn API này không tồn tại!"
  });
});

// Bắt các lỗi hệ thống khác và trả về JSON thay vì HTML (render)
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message
  });
});

module.exports = app;
