import { useOrder } from '../context/OrderContext';
import './AdminPage.css';

function AdminPage() {
  const { 
    menus,
    orders, 
    loading,
    updateOrderStatus, 
    increaseStock, 
    decreaseStock 
  } = useOrder();

  // 대시보드 통계 계산
  const dashboardStats = {
    total: orders.length,
    received: orders.filter(o => o.status === '주문 접수').length,
    making: orders.filter(o => o.status === '제조 중').length,
    completed: orders.filter(o => o.status === '제조 완료').length,
  };

  // 재고 상태 판별
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: '품절', className: 'status-soldout' };
    if (stock < 5) return { text: '주의', className: 'status-warning' };
    return { text: '정상', className: 'status-normal' };
  };

  // 상태에 따른 버튼 텍스트
  const getButtonText = (status) => {
    switch (status) {
      case '주문 접수': return '제조 시작';
      case '제조 중': return '제조 완료';
      case '제조 완료': return '완료됨';
      default: return status;
    }
  };

  // 주문 상태 변경 핸들러
  const handleStatusChange = (orderId, currentStatus) => {
    updateOrderStatus(orderId, currentStatus);
  };

  // 주문 항목 표시 텍스트
  const getOrderItemsText = (order) => {
    if (order.items && order.items.length > 0) {
      return order.items
        .filter(item => item.menu_name)
        .map(item => {
          const optionsText = item.options && item.options.length > 0 
            ? ` (${item.options.map(o => o.name).join(', ')})` 
            : '';
          return `${item.menu_name}${optionsText} x ${item.quantity}`;
        })
        .join(', ');
    }
    return '주문 항목 없음';
  };

  // 주문 총 금액
  const getOrderTotalPrice = (order) => {
    return order.total_price || 0;
  };

  // 주문 날짜/시간 포맷
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}월 ${day}일 ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="admin-page">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* 관리자 대시보드 */}
      <section className="dashboard-section">
        <h2 className="section-title">관리자 대시보드</h2>
        <div className="dashboard-stats">
          <span className="stat-item">총 주문 <strong>{dashboardStats.total}</strong></span>
          <span className="stat-divider">/</span>
          <span className="stat-item">주문 접수 <strong>{dashboardStats.received}</strong></span>
          <span className="stat-divider">/</span>
          <span className="stat-item">제조 중 <strong>{dashboardStats.making}</strong></span>
          <span className="stat-divider">/</span>
          <span className="stat-item">제조 완료 <strong>{dashboardStats.completed}</strong></span>
        </div>
      </section>

      {/* 재고 현황 */}
      <section className="inventory-section">
        <h2 className="section-title">재고 현황</h2>
        <div className="inventory-grid">
          {menus.map(item => {
            const status = getStockStatus(item.stock);
            return (
              <div key={item.id} className="inventory-card">
                <h3 className="inventory-name">{item.name}</h3>
                <div className="inventory-info">
                  <span className="inventory-stock">{item.stock}개</span>
                  <span className={`inventory-status ${status.className}`}>
                    {status.text}
                  </span>
                </div>
                <div className="inventory-controls">
                  <button 
                    className="control-btn"
                    onClick={() => increaseStock(item.id)}
                  >
                    +
                  </button>
                  <button 
                    className="control-btn"
                    onClick={() => decreaseStock(item.id)}
                    disabled={item.stock === 0}
                  >
                    -
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 주문 현황 */}
      <section className="orders-section">
        <h2 className="section-title">주문 현황</h2>
        <div className="orders-list">
          {orders.length === 0 ? (
            <p className="no-orders">접수된 주문이 없습니다.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="order-item">
                <span className="order-datetime">{formatDateTime(order.created_at)}</span>
                <span className="order-menu">{getOrderItemsText(order)}</span>
                <span className="order-price">{getOrderTotalPrice(order).toLocaleString()}원</span>
                <button 
                  className={`order-status-btn ${order.status === '제조 완료' ? 'completed' : ''}`}
                  onClick={() => handleStatusChange(order.id, order.status)}
                  disabled={order.status === '제조 완료'}
                >
                  {getButtonText(order.status)}
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
