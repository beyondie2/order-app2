const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// 메뉴 목록 조회
router.get('/', menuController.getAllMenus);

// 메뉴 상세 조회
router.get('/:id', menuController.getMenuById);

// 메뉴 재고 수정
router.patch('/:id/stock', menuController.updateStock);

module.exports = router;

