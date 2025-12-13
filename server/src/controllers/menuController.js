const pool = require('../config/database');

// 메뉴 목록 조회
const getAllMenus = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM menus ORDER BY id'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '메뉴 목록을 불러오는데 실패했습니다.'
      }
    });
  }
};

// 메뉴 상세 조회
const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM menus WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '메뉴를 찾을 수 없습니다.'
        }
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '메뉴 정보를 불러오는데 실패했습니다.'
      }
    });
  }
};

// 메뉴 재고 수정
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '유효한 재고 수량을 입력해주세요.'
        }
      });
    }
    
    const result = await pool.query(
      'UPDATE menus SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [stock, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '메뉴를 찾을 수 없습니다.'
        }
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '재고 수정에 실패했습니다.'
      }
    });
  }
};

module.exports = {
  getAllMenus,
  getMenuById,
  updateStock
};

