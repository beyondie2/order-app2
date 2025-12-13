import { useOrder } from '../context/OrderContext';
import './AdminPage.css';

function AdminPage() {
  const { 
    orders, 
    inventory, 
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
          {inventory.map(item => {
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
                <span className="order-datetime">{order.date} {order.time}</span>
                <span className="order-menu">{order.menu} x {order.quantity}</span>
                <span className="order-price">{order.price.toLocaleString()}원</span>
                <button 
                  className={`order-status-btn ${order.status === '제조 완료' ? 'completed' : ''}`}
                  onClick={() => updateOrderStatus(order.id)}
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
