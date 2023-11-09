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
  const rowLength = 4; // Assuming it's a 4x4 grid

  const [tiles, setTiles] = useState<Array<string | number>>(initialTiles);
  
  const handleTileClick = (clickedIndex: number) => {
    const zeroIndex = tiles.indexOf('');
    const clickedRow = Math.floor(clickedIndex / rowLength);
    const clickedCol = clickedIndex % rowLength;
    const zeroRow = Math.floor(zeroIndex / rowLength);
    const zeroCol = zeroIndex % rowLength;

    if (clickedRow === zeroRow) {
      let rowArray: any;
      //empty tile on right of same line
      if (zeroIndex > clickedIndex){
        rowArray = tiles.slice(clickedIndex, zeroIndex);
        rowSwap(rowArray,clickedIndex, zeroIndex);
      } else {
        rowArray = tiles.slice(zeroIndex+1, clickedIndex+1);
        rowSwap(rowArray,clickedIndex, zeroIndex);
      }
    } 
    else if (clickedCol === zeroCol) {
      let colArray:any;
      if (zeroIndex > clickedIndex) {
        colArray = [];
        for (let i = clickedIndex; i < zeroIndex; i += rowLength) {
          colArray.push(tiles[i]);
        }
        colSwap(colArray, clickedIndex, zeroIndex);
      } else {
        colArray = [];
        for (let i = zeroIndex+rowLength; i <= clickedIndex; i += rowLength) {
          colArray.push(tiles[i]);
        }
        colSwap(colArray, clickedIndex, zeroIndex);
      }
    }
  };

  const colSwap = (arr: Array<string | number>, clickedIndex: number, zeroIndex: number) => {
    let tempArr = [...tiles];
    tempArr[clickedIndex] = tiles[zeroIndex];
    //empty tile in the bottom
    if (zeroIndex > clickedIndex){
      let nextVal = clickedIndex + rowLength;
      for (let i = 0; i < arr.length; i++){
        tempArr[nextVal] = arr[i];
        nextVal+=rowLength;
      }
    } else{
      let nextVal = clickedIndex - rowLength;
      for (let i = arr.length-1; i >= 0; i--){
        tempArr[nextVal] = arr[i];
        nextVal-=rowLength;
      }
    }
    setTiles(tempArr);
    
  }
  
  const rowSwap = (arr: Array<string | number>, clickedIndex: number, zeroIndex: number) => {
    let tempArr = [...tiles];
    
    tempArr[clickedIndex] = tiles[zeroIndex];
    if (zeroIndex > clickedIndex){
      let nextVal = clickedIndex + 1;
      for (let i = 0; i < arr.length; i++){
        tempArr[nextVal] = arr[i];
        nextVal+=1;
      }
    } else{
      let nextVal = clickedIndex - 1;
      for (let i = arr.length-1; i >= 0; i--){
        tempArr[nextVal] = arr[i];
        nextVal-=1;
      }
    }
    setTiles(tempArr);
  }

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
