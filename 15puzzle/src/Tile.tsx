import React from 'react';

interface TileProps {
  number: number | string; // Allow the prop to be a number or a string
  onClick: () => void; // Define the type for the onClick function
}

const Tile: React.FC<TileProps> = ({ number, onClick }) => {
  return (
    <div className="tile" onClick={onClick}>
      {number !== '' ? number : ' '}
    </div>
  );
};

export default Tile;
