-- COZY 커피 주문 앱 초기 데이터

-- 메뉴 데이터 삽입
INSERT INTO menus (name, description, price, image_url, stock) VALUES
('아메리카노(ICE)', '깔끔하고 진한 에스프레소와 시원한 얼음의 조화', 4000, '/images/americano-ice.jpg', 10),
('아메리카노(HOT)', '깊고 풍부한 향의 따뜻한 아메리카노', 4000, '/images/americano-hot.jpg', 10),
('카페라떼', '부드러운 우유와 에스프레소의 완벽한 조화', 5000, '/images/caffe-latte.jpg', 10),
('바닐라라떼', '달콤한 바닐라 시럽이 더해진 부드러운 라떼', 5500, '/images/vanilla-latte.jpg', 10),
('카푸치노', '풍성한 우유 거품과 에스프레소의 클래식한 맛', 5000, '/images/cappuccino.jpg', 10),
('카라멜마키아또', '달콤한 카라멜과 부드러운 우유의 환상적인 조합', 5500, '/images/caramel-macchiato.jpg', 10);

-- 옵션 데이터 삽입 (menu_id가 NULL이면 모든 메뉴에 적용)
INSERT INTO options (name, price, menu_id) VALUES
('샷 추가', 500, NULL),
('시럽 추가', 0, NULL);

