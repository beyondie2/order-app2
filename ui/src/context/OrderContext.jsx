import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

// 초기 재고 데이터
const initialInventory = [
  { id: 1, name: '아메리카노 (ICE)', stock: 10 },
  { id: 2, name: '아메리카노 (HOT)', stock: 10 },
  { id: 3, name: '카페라떼', stock: 10 },
];

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState(initialInventory);
  const [nextOrderId, setNextOrderId] = useState(1);

  // 새 주문 추가
  const addOrder = (cartItems) => {
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
      quantity: item.quantity,
      price: item.totalPrice * item.quantity,
      status: '주문 접수'
    }));

    setOrders(prev => [...prev, ...newOrders]);
    setNextOrderId(prev => prev + cartItems.length);
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
    setInventory(prev => 
      prev.map(item => 
        item.id === id ? { ...item, stock: item.stock + 1 } : item
      )
    );
  };

  // 재고 감소
  const decreaseStock = (id) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === id && item.stock > 0 
          ? { ...item, stock: item.stock - 1 } 
          : item
      )
    );
  };

  const value = {
    orders,
    inventory,
    addOrder,
    updateOrderStatus,
    increaseStock,
    decreaseStock
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

