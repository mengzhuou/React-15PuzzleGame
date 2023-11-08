import React, { useState } from 'react';
import './App.css';
import Tile from './Tile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons'; 

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
  
  const handleTileClick = (clickedIndex: number) => {
    console.log("clickedIndex",clickedIndex)
    const zeroIndex = tiles.indexOf(''); // Find the index of the empty string
  
    if (zeroIndex === -1) {
      return; // Return if the empty tile index is not found
    }
    
    const rowLength = 4; // Assuming it's a 4x4 grid
    //11+4 = 15, 
    const isAdjacent = (clickedIndex + rowLength === zeroIndex || 
      clickedIndex - rowLength === zeroIndex ||
      clickedIndex + 1 === zeroIndex || 
      clickedIndex - 1 === zeroIndex);
    console.log("isAdjacent",isAdjacent);
    if (isAdjacent) {
      console.log("inside");
      
      swap(clickedIndex, zeroIndex); // Call the swap function
    }
  };

  const renderTiles = () => {
    return tiles.map((tile, index) => (
      <Tile 
        key={index}
        number={tile}
        onClick={() => handleTileClick(index)}
      />
    ));
  };
  

  const isSolved = () => {
    const winState = Array.from({ length: 15 }, (_, index) => index + 1);
    winState.push(0); // Use null to represent the empty slot
    return tiles.every((value, index) => value === winState[index]);
  };
  
  
  const swap = (valIndex: number, zeroIndex: number) => {
    let tempArr = [...tiles];
    tempArr[zeroIndex] = tiles[valIndex];
    tempArr[valIndex] = '';
    setTiles(tempArr);
  }
  
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
        <button onClick={resetGame}>
          <FontAwesomeIcon icon={faRedo} className="icon" />
          <span className="text">Restart</span>
        </button>
      </header>
    </div>
  );
}

export default App;
