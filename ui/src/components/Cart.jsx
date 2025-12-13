import './Cart.css';

function Cart({ items, onOrder }) {
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);

  return (
    <div className="cart">
      <div className="cart-content">
        <div className="cart-left">
          <h3 className="cart-title">장바구니</h3>
          <div className="cart-items">
            {items.length === 0 ? (
              <p className="cart-empty">장바구니가 비어있습니다.</p>
            ) : (
              items.map((item, index) => (
                <div key={index} className="cart-item">
                  <span className="item-name">
                    {item.name}
                    {item.options.extraShot && ' (샷 추가)'}
                    {item.options.syrup && ' (시럽 추가)'}
                  </span>
                  <span className="item-quantity">X {item.quantity}</span>
                  <span className="item-price">{(item.totalPrice * item.quantity).toLocaleString()}원</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="cart-right">
          <div className="total-section">
            <span className="total-label">총 금액</span>
            <span className="total-price">{totalPrice.toLocaleString()}원</span>
          </div>
          <button 
            className="order-btn" 
            onClick={onOrder}
            disabled={items.length === 0}
          >
            주문하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
