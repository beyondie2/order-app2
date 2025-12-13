import { useState } from 'react';
import './MenuCard.css';

function MenuCard({ menu, onAddToCart }) {
  const [options, setOptions] = useState({
    extraShot: false,
    syrup: false
  });
  const [showFeedback, setShowFeedback] = useState(false);

  const isSoldOut = menu.stock === 0;
  const isLowStock = menu.stock > 0 && menu.stock < 5;

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    
    onAddToCart(menu, options);
    setOptions({ extraShot: false, syrup: false });
    
    // 담기 성공 피드백
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1000);
  };

  return (
    <div className={`menu-card ${isSoldOut ? 'sold-out' : ''}`}>
      <div className="menu-image">
        <div className="placeholder-image">
          <div className="placeholder-x"></div>
        </div>
        {isSoldOut && <div className="sold-out-badge">품절</div>}
        {isLowStock && <div className="low-stock-badge">재고 {menu.stock}개</div>}
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{menu.name}</h3>
        <p className="menu-price">{menu.price.toLocaleString()}원</p>
        <p className="menu-description">{menu.description}</p>
        
        <div className="menu-options">
          <label className={`option-label ${isSoldOut ? 'disabled' : ''}`}>
            <input
              type="checkbox"
              checked={options.extraShot}
              onChange={() => handleOptionChange('extraShot')}
              disabled={isSoldOut}
            />
            <span>샷 추가 (+500원)</span>
          </label>
          <label className={`option-label ${isSoldOut ? 'disabled' : ''}`}>
            <input
              type="checkbox"
              checked={options.syrup}
              onChange={() => handleOptionChange('syrup')}
              disabled={isSoldOut}
            />
            <span>시럽 추가 (+0원)</span>
          </label>
        </div>
        
        <button 
          className={`add-btn ${showFeedback ? 'added' : ''}`} 
          onClick={handleAddToCart}
          disabled={isSoldOut}
        >
          {showFeedback ? '담김!' : isSoldOut ? '품절' : '담기'}
        </button>
      </div>
    </div>
  );
}

export default MenuCard;
