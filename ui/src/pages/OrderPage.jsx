import { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import MenuCard from '../components/MenuCard';
import Cart from '../components/Cart';
import './OrderPage.css';

function OrderPage() {
  const [cartItems, setCartItems] = useState([]);
  const { menus, addOrder } = useOrder();

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

  // 장바구니 아이템 수량 증가
  const handleIncreaseQuantity = (index) => {
    const newItems = [...cartItems];
    newItems[index].quantity += 1;
    setCartItems(newItems);
  };

  // 장바구니 아이템 수량 감소
  const handleDecreaseQuantity = (index) => {
    const newItems = [...cartItems];
    if (newItems[index].quantity > 1) {
      newItems[index].quantity -= 1;
      setCartItems(newItems);
    } else {
      // 수량이 1이면 아이템 삭제
      newItems.splice(index, 1);
      setCartItems(newItems);
    }
  };

  // 장바구니 아이템 삭제
  const handleRemoveItem = (index) => {
    const newItems = [...cartItems];
    newItems.splice(index, 1);
    setCartItems(newItems);
  };

  const handleOrder = () => {
    if (cartItems.length === 0) return;
    
    // Context를 통해 주문 추가 (재고 확인 포함)
    const result = addOrder(cartItems);
    
    alert(result.message);
    
    if (result.success) {
      setCartItems([]);
    }
  };

  return (
    <div className="order-page">
      <div className="menu-grid">
        {menus.map(menu => (
          <MenuCard 
            key={menu.id} 
            menu={menu} 
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
      <Cart 
        items={cartItems} 
        onOrder={handleOrder}
        onIncreaseQuantity={handleIncreaseQuantity}
        onDecreaseQuantity={handleDecreaseQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}

export default OrderPage;
