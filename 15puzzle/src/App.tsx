import React, { useState } from 'react';
import './App.css';
import Tile from './Tile';

function App() {
  const generateRandomNumbers = (): Array<string | number> => {
    const numbers = new Set<number>(); // Use a Set to store unique numbers
    while (numbers.size < 15) {
      const randomNumber = Math.floor(Math.random() * 15) + 1; // Generate a random number between 1 and 15
      numbers.add(randomNumber);
    }
    const randomTiles: Array<string | number> = Array.from(numbers);
    randomTiles.push(''); // Add the empty string to represent the empty slot
    return randomTiles;
  };
  const initialTiles: Array<string | number> = generateRandomNumbers(); // Define the type for initialTiles

  const [tiles, setTiles] = useState<Array<string | number>>(initialTiles);
  

  const renderTiles = () => {
    return tiles.map((tile, index) => (
      <Tile 
        key={index}
        number={tile}
        onClick={() => handleTileClick(index)}
      />
    ))
  }

  
  const handleTileClick = (clickedIndex: number) => {
    const newTiles = [...tiles];
    const emptyIndex = newTiles.indexOf('');
  
    if (typeof newTiles[clickedIndex] === 'number' && typeof emptyIndex === 'number') {
      const clickedTile = newTiles[clickedIndex] as number;
      const emptyTileIndex = emptyIndex as number;
  
      if (
        (clickedIndex % 4 === emptyTileIndex % 4 && Math.abs(clickedIndex - emptyTileIndex) === 1) ||
        (Math.floor(clickedIndex / 4) === Math.floor(emptyTileIndex / 4) && Math.abs(clickedIndex - emptyTileIndex) === 4)
      ) {
        const tempTile = newTiles[clickedIndex];
        newTiles[clickedIndex] = newTiles[emptyIndex];
        newTiles[emptyIndex] = tempTile;
        setTiles(newTiles);
      }
    }
  };

  const isSolved = () => {
    const winState = Array.from({ length: 15 }, (_, index) => index + 1);
    winState.push(0); // Use null to represent the empty slot
    return tiles.every((value, index) => value === winState[index]);
  };
  
  
  const shuffleTiles = () => {
    for (let i = 0; i < 1000; i++) {
      const randomIndex = Math.floor(Math.random() * 16);
      
    }
  };
  
  const resetGame = () => {
    setTiles(initialTiles);
  };
  
  
  

  return (
    <div className="App">
      <header className="App-header">
        <h1>15 Puzzle Game</h1>
        <div className="game-board">
          {renderTiles()}
        </div>
      </header>
    </div>
  );
}

export default App;
