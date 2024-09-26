import React, { useState } from 'react';
import './Chip.css';

function Chip({ sale, onEdit }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!sale) {
    return null;
  }

  const getChipClass = () => {
    switch (sale.type) {
      case 'New BMW':
        return 'new-bmw';
      case 'New MINI':
        return 'new-mini';
      case 'CPO BMW':
      case 'CPO MINI':
      case 'Used BMW':
      case 'Used MINI':
        return 'used-cpo';
      default:
        return 'default';
    }
  };

  const isCPO = sale.type === 'CPO BMW' || sale.type === 'CPO MINI';

  const chipClass = `chip ${getChipClass()} ${sale.delivered ? '' : 'pending'}`;

  const handleClick = () => {
    onEdit(sale);
  };

  return (
    <div 
      className={chipClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <span className="stock-number">{sale.stockNumber}</span>
      {isCPO && <span className="cpo-star">★</span>}
      {isHovered && (
        <div className="hover-info">
          <p>{`${sale.color} ${sale.year} ${sale.make} ${sale.model}`}</p>
          <p>{sale.clientName}</p>
        </div>
      )}
    </div>
  );
}

export default Chip;