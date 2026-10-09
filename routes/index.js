const express = require('express');
const router = express.Router();

// Hiển thị trang chủ (gọi file views/index.ejs)
router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;