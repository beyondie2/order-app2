const pool = require('../config/database');

// 옵션 목록 조회
const getAllOptions = async (req, res) => {
  try {
    const { menu_id } = req.query;
    
    let query = 'SELECT * FROM options';
    let params = [];
    
    if (menu_id) {
      query += ' WHERE menu_id = $1 OR menu_id IS NULL';
      params.push(menu_id);
    }
    
    query += ' ORDER BY id';
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching options:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '옵션 목록을 불러오는데 실패했습니다.'
      }
    });
  }
};

module.exports = {
  getAllOptions
};

