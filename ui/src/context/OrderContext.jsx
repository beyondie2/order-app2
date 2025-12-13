import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { menuApi, optionApi, orderApi } from '../api';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [menus, setMenus] = useState([]);
  const [options, setOptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 메뉴 목록 조회
  const fetchMenus = useCallback(async () => {
    try {
      const response = await menuApi.getAll();
      setMenus(response.data);
    } catch (err) {
      console.error('메뉴 조회 실패:', err);
      setError(err.message);
    }
  }, []);

  // 옵션 목록 조회
  const fetchOptions = useCallback(async () => {
    try {
      const response = await optionApi.getAll();
      setOptions(response.data);
    } catch (err) {
      console.error('옵션 조회 실패:', err);
    }
  }, []);

  // 주문 목록 조회
  const fetchOrders = useCallback(async () => {
    try {
      const response = await orderApi.getAll();
      setOrders(response.data);
    } catch (err) {
      console.error('주문 조회 실패:', err);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMenus(), fetchOptions(), fetchOrders()]);
      setLoading(false);
    };
    loadData();
  }, [fetchMenus, fetchOptions, fetchOrders]);

  // 새 주문 추가
  const addOrder = async (cartItems) => {
    try {
      const items = cartItems.map(item => ({
        menu_id: item.id,
        quantity: item.quantity,
        options: item.options.extraShot || item.options.syrup ? [
          ...(item.options.extraShot ? [{ id: 1, name: '샷 추가', price: 500 }] : []),
          ...(item.options.syrup ? [{ id: 2, name: '시럽 추가', price: 0 }] : []),
        ] : []
      }));

      await orderApi.create(items);
      
      // 데이터 새로고침
      await Promise.all([fetchMenus(), fetchOrders()]);
      
      return { success: true, message: '주문이 완료되었습니다!' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // 주문 상태 변경
  const updateOrderStatus = async (orderId, currentStatus) => {
    try {
      let newStatus;
      if (currentStatus === '주문 접수') {
        newStatus = '제조 중';
      } else if (currentStatus === '제조 중') {
        newStatus = '제조 완료';
      } else {
        return;
      }

      await orderApi.updateStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error('주문 상태 변경 실패:', err);
      alert(err.message);
    }
  };

  // 재고 증가
  const increaseStock = async (id) => {
    try {
      const menu = menus.find(m => m.id === id);
      if (menu) {
        await menuApi.updateStock(id, menu.stock + 1);
        await fetchMenus();
      }
    } catch (err) {
      console.error('재고 증가 실패:', err);
      alert(err.message);
    }
  };

  // 재고 감소
  const decreaseStock = async (id) => {
    try {
      const menu = menus.find(m => m.id === id);
      if (menu && menu.stock > 0) {
        await menuApi.updateStock(id, menu.stock - 1);
        await fetchMenus();
      }
    } catch (err) {
      console.error('재고 감소 실패:', err);
      alert(err.message);
    }
  };

  // 데이터 새로고침
  const refreshData = async () => {
    await Promise.all([fetchMenus(), fetchOptions(), fetchOrders()]);
  };

  const value = {
    menus,
    options,
    orders,
    loading,
    error,
    addOrder,
    updateOrderStatus,
    increaseStock,
    decreaseStock,
    refreshData
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
