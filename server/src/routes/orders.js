const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 주문 목록 조회
router.get('/', orderController.getAllOrders);

// 주문 생성
router.post('/', orderController.createOrder);

// 주문 상세 조회
router.get('/:id', orderController.getOrderById);

// 주문 상태 변경
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;

