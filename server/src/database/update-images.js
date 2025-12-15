/**
 * 메뉴 이미지 URL 업데이트 스크립트
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function updateImages() {
  try {
    console.log('🔄 이미지 URL 업데이트 시작...');

    // 각 메뉴에 이미지 URL 설정
    await pool.query("UPDATE menus SET image_url = '/images/americano-ice.jpg' WHERE id = 1");
    await pool.query("UPDATE menus SET image_url = '/images/americano-hot.jpg' WHERE id = 2");
    await pool.query("UPDATE menus SET image_url = '/images/caffe-latte.jpg' WHERE id = 3");
    await pool.query("UPDATE menus SET image_url = '/images/caffe-latte.jpg' WHERE id = 4");
    await pool.query("UPDATE menus SET image_url = '/images/caffe-latte.jpg' WHERE id = 5");
    await pool.query("UPDATE menus SET image_url = '/images/caffe-latte.jpg' WHERE id = 6");

    console.log('✅ 이미지 URL 업데이트 완료!');
    
    // 결과 확인
    const result = await pool.query('SELECT id, name, image_url FROM menus ORDER BY id');
    console.log('\n📋 업데이트된 메뉴:');
    result.rows.forEach(row => {
      console.log(`  ${row.id}. ${row.name} → ${row.image_url}`);
    });

  } catch (err) {
    console.error('❌ 오류:', err.message);
  } finally {
    await pool.end();
  }
}

updateImages();




