import { useState } from 'react';
import './MenuCard.css';

function MenuCard({ menu, onAddToCart }) {
  const [options, setOptions] = useState({
    extraShot: false,
    syrup: false
  });

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleAddToCart = () => {
    onAddToCart(menu, options);
    setOptions({ extraShot: false, syrup: false });
  };

  return (
    <div className="menu-card">
      <div className="menu-image">
        <div className="placeholder-image">
          <div className="placeholder-x"></div>
        </div>
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{menu.name}</h3>
        <p className="menu-price">{menu.price.toLocaleString()}원</p>
        <p className="menu-description">{menu.description}</p>
        
        <div className="menu-options">
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.extraShot}
              onChange={() => handleOptionChange('extraShot')}
            />
            <span>샷 추가 (+500원)</span>
          </label>
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.syrup}
              onChange={() => handleOptionChange('syrup')}
            />
            <span>시럽 추가 (+0원)</span>
          </label>
        </div>
        
        <button className="add-btn" onClick={handleAddToCart}>
          담기
        </button>
      </div>
    </div>
  );
}

export default MenuCard;

