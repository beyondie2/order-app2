import { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import MenuCard from '../components/MenuCard';
import Cart from '../components/Cart';
import './OrderPage.css';

// 커피 메뉴 데이터
const menuData = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '깔끔하고 진한 에스프레소와 시원한 얼음의 조화'
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '깊고 풍부한 향의 따뜻한 아메리카노'
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 우유와 에스프레소의 완벽한 조화'
  },
  {
    id: 4,
    name: '바닐라라떼',
    price: 5500,
    description: '달콤한 바닐라 시럽이 더해진 부드러운 라떼'
  },
  {
    id: 5,
    name: '카푸치노',
    price: 5000,
    description: '풍성한 우유 거품과 에스프레소의 클래식한 맛'
  },
  {
    id: 6,
    name: '카라멜마키아또',
    price: 5500,
    description: '달콤한 카라멜과 부드러운 우유의 환상적인 조합'
  }
];

function OrderPage() {
  const [cartItems, setCartItems] = useState([]);
  const { addOrder } = useOrder();

  const handleAddToCart = (menu, options) => {
    const extraPrice = options.extraShot ? 500 : 0;
    const totalPrice = menu.price + extraPrice;

    // 동일한 메뉴+옵션 조합 찾기
    const existingIndex = cartItems.findIndex(
      item => 
        item.id === menu.id && 
        item.options.extraShot === options.extraShot && 
        item.options.syrup === options.syrup
    );

    if (existingIndex >= 0) {
      // 이미 있으면 수량 증가
      const newItems = [...cartItems];
      newItems[existingIndex].quantity += 1;
      setCartItems(newItems);
    } else {
      // 새로운 아이템 추가
      setCartItems([...cartItems, {
        id: menu.id,
        name: menu.name,
        options: { ...options },
        totalPrice,
        quantity: 1
      }]);
    }
  };

  const handleOrder = () => {
    if (cartItems.length === 0) return;
    
    // Context를 통해 주문 추가
    addOrder(cartItems);
    
    alert('주문이 완료되었습니다!');
    setCartItems([]);
  };

  return (
    <div className="order-page">
      <div className="menu-grid">
        {menuData.map(menu => (
          <MenuCard 
            key={menu.id} 
            menu={menu} 
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
      <Cart items={cartItems} onOrder={handleOrder} />
    </div>
  );
}

export default OrderPage;
