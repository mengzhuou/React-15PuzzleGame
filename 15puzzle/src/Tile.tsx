import React from 'react';

interface TileProps {
  number: number | string;
  onClick: () => void;
  className: string; 
  isEmpty: boolean;
}

const Tile: React.FC<TileProps> = ({ number, onClick, className, isEmpty }) => {
  return (
    <div className={`tile ${className} ${isEmpty? 'empty' : ''}`} onClick={onClick}>
      {number !== '' && number}
    </div>
  );
};

export default Tile;
