const express = require('express');
const router = express.Router();
const optionController = require('../controllers/optionController');

// 옵션 목록 조회
router.get('/', optionController.getAllOptions);

module.exports = router;

