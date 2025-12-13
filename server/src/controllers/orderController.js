const pool = require('../config/database');

// 주문 목록 조회
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'menu_name', oi.menu_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'options', oi.options
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    
    let params = [];
    
    if (status) {
      query += ' WHERE o.status = $1';
      params.push(status);
    }
    
    query += ' GROUP BY o.id ORDER BY o.created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '주문 목록을 불러오는데 실패했습니다.'
      }
    });
  }
};

// 주문 생성
const createOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '주문 항목이 없습니다.'
        }
      });
    }
    
    await client.query('BEGIN');
    
    // 재고 확인 및 메뉴 정보 조회
    let totalPrice = 0;
    const orderItems = [];
    
    for (const item of items) {
      const menuResult = await client.query(
        'SELECT * FROM menus WHERE id = $1',
        [item.menu_id]
      );
      
      if (menuResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `메뉴를 찾을 수 없습니다. (ID: ${item.menu_id})`
          }
        });
      }
      
      const menu = menuResult.rows[0];
      
      if (menu.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `${menu.name}의 재고가 부족합니다. (현재 재고: ${menu.stock}개)`
          }
        });
      }
      
      // 옵션 가격 계산
      let optionPrice = 0;
      if (item.options && item.options.length > 0) {
        for (const option of item.options) {
          optionPrice += option.price || 0;
        }
      }
      
      const unitPrice = menu.price + optionPrice;
      totalPrice += unitPrice * item.quantity;
      
      orderItems.push({
        menu_id: item.menu_id,
        menu_name: menu.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        options: item.options || []
      });
      
      // 재고 차감
      await client.query(
        'UPDATE menus SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.menu_id]
      );
    }
    
    // 주문 생성
    const orderResult = await client.query(
      'INSERT INTO orders (total_price, status) VALUES ($1, $2) RETURNING *',
      [totalPrice, '주문 접수']
    );
    
    const order = orderResult.rows[0];
    
    // 주문 상세 생성
    for (const item of orderItems) {
      await client.query(
        'INSERT INTO order_items (order_id, menu_id, menu_name, quantity, unit_price, options) VALUES ($1, $2, $3, $4, $5, $6)',
        [order.id, item.menu_id, item.menu_name, item.quantity, item.unit_price, JSON.stringify(item.options)]
      );
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      data: {
        ...order,
        items: orderItems
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '주문 생성에 실패했습니다.'
      }
    });
  } finally {
    client.release();
  }
};

// 주문 상세 조회
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '주문을 찾을 수 없습니다.'
        }
      });
    }
    
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );
    
    res.json({
      success: true,
      data: {
        ...orderResult.rows[0],
        items: itemsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '주문 정보를 불러오는데 실패했습니다.'
      }
    });
  }
};

// 주문 상태 변경
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['주문 접수', '제조 중', '제조 완료'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: '유효하지 않은 상태입니다.'
        }
      });
    }
    
    // 현재 상태 확인
    const currentOrder = await pool.query(
      'SELECT status FROM orders WHERE id = $1',
      [id]
    );
    
    if (currentOrder.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '주문을 찾을 수 없습니다.'
        }
      });
    }
    
    const currentStatus = currentOrder.rows[0].status;
    const currentIndex = validStatuses.indexOf(currentStatus);
    const newIndex = validStatuses.indexOf(status);
    
    // 상태는 순서대로만 변경 가능
    if (newIndex !== currentIndex + 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `${currentStatus} 상태에서 ${status} 상태로 변경할 수 없습니다.`
        }
      });
    }
    
    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '주문 상태 변경에 실패했습니다.'
      }
    });
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrderStatus
};

