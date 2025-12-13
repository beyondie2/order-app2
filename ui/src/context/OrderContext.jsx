import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

// 메뉴 데이터 (재고 포함)
const initialMenuData = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '깔끔하고 진한 에스프레소와 시원한 얼음의 조화',
    stock: 10
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '깊고 풍부한 향의 따뜻한 아메리카노',
    stock: 10
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 우유와 에스프레소의 완벽한 조화',
    stock: 10
  },
  {
    id: 4,
    name: '바닐라라떼',
    price: 5500,
    description: '달콤한 바닐라 시럽이 더해진 부드러운 라떼',
    stock: 10
  },
  {
    id: 5,
    name: '카푸치노',
    price: 5000,
    description: '풍성한 우유 거품과 에스프레소의 클래식한 맛',
    stock: 10
  },
  {
    id: 6,
    name: '카라멜마키아또',
    price: 5500,
    description: '달콤한 카라멜과 부드러운 우유의 환상적인 조합',
    stock: 10
  }
];

export function OrderProvider({ children }) {
  const [menus, setMenus] = useState(initialMenuData);
  const [orders, setOrders] = useState([]);
  const [nextOrderId, setNextOrderId] = useState(1);

  // 재고 확인
  const checkStock = (menuId, quantity) => {
    const menu = menus.find(m => m.id === menuId);
    return menu ? menu.stock >= quantity : false;
  };

  // 새 주문 추가 (재고 차감 포함)
  const addOrder = (cartItems) => {
    // 재고 확인
    for (const item of cartItems) {
      if (!checkStock(item.id, item.quantity)) {
        return { success: false, message: `${item.name}의 재고가 부족합니다.` };
      }
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const newOrders = cartItems.map((item, index) => ({
      id: nextOrderId + index,
      date: `${month}월 ${day}일`,
      time: `${hours}:${minutes}`,
      menu: item.name + (item.options.extraShot ? ' (샷 추가)' : '') + (item.options.syrup ? ' (시럽 추가)' : ''),
      menuId: item.id,
      quantity: item.quantity,
      price: item.totalPrice * item.quantity,
      status: '주문 접수'
    }));

    // 재고 차감
    setMenus(prev => 
      prev.map(menu => {
        const orderedItem = cartItems.find(item => item.id === menu.id);
        if (orderedItem) {
          return { ...menu, stock: menu.stock - orderedItem.quantity };
        }
        return menu;
      })
    );

    setOrders(prev => [...prev, ...newOrders]);
    setNextOrderId(prev => prev + cartItems.length);

    return { success: true, message: '주문이 완료되었습니다!' };
  };

  // 주문 상태 변경
  const updateOrderStatus = (orderId) => {
    setOrders(prev => 
      prev.map(order => {
        if (order.id !== orderId) return order;
        
        if (order.status === '주문 접수') {
          return { ...order, status: '제조 중' };
        } else if (order.status === '제조 중') {
          return { ...order, status: '제조 완료' };
        }
        return order;
      })
    );
  };

  // 재고 증가
  const increaseStock = (id) => {
    setMenus(prev => 
      prev.map(item => 
        item.id === id ? { ...item, stock: item.stock + 1 } : item
      )
    );
  };

  // 재고 감소
  const decreaseStock = (id) => {
    setMenus(prev => 
      prev.map(item => 
        item.id === id && item.stock > 0 
          ? { ...item, stock: item.stock - 1 } 
          : item
      )
    );
  };

  const value = {
    menus,
    orders,
    addOrder,
    updateOrderStatus,
    increaseStock,
    decreaseStock,
    checkStock
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
