import React from 'react';

interface TileProps {
  number: number | string;
  onClick: () => void;
  className: string; // Add className as a prop
}

const Tile: React.FC<TileProps> = ({ number, onClick, className }) => {
  return (
    <div className={`tile ${className}`} onClick={onClick}>
      {number !== '' ? number : ' '}
    </div>
  );
};

export default Tile;
