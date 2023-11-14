import React, { useState, useEffect } from 'react';
import './App.css';
import Tile from './Tile';
import CountingClock from './CountingClock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons'; 

function App() {
  const [gameOver, setGameOver] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  
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
  const [shrink, setShrink] = useState(false);

  const shrinkTiles = (isShrink: boolean) => {
    setShrink(isShrink);
  };
  
  const rowLength = 4; // Assuming it's a 4x4 grid
  
  useEffect(() => {
    if (isSolved()) {
      setGameOver(true);
      shrinkTiles(true);
    }
  }, [tiles]);
  const handleTileClick = (clickedIndex: number) => {
    if (gameOver) return;
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
        className={shrink ? "tile shrink" : "tile"} // Apply the "shrink" class conditionally
      />
    ));
  };

  const isSolved = () => {
    const numbers = new Set<number>(); // Use a Set to store unique numbers
    
    for (let i = 1; i <= 15; i++) {
      numbers.add(i);
    }

    const winState: Array<string | number> = Array.from(numbers);
    winState.push(''); // Add the empty string to represent the empty slot

    console.log("current arr", tiles)
    console.log("answer arr", winState)
    const isWin = tiles.every((value, index) => value === winState[index]);
    console.log("is win?", isWin)
    if (isWin) {
      setGameOver(true); // Set game over state if the puzzle is solved
      return true;
    }
    return false; 
  };

  const resetGame = () => {
    setGameOver(false); 
    setTiles(generateRandomNumbers());
    setResetKey(prevKey => prevKey+1);
  };

  return (
    <div className={`App ${gameOver ? 'game-over' : ''}`}>
      <div className="App-header">
      <h3 className='title'>15 Puzzle Game</h3>
        {gameOver && (
          <p className="gameOverText">Well Done!</p>
        )}
        <div className='timerContainer'>
          <div className='timer'>
            <CountingClock key={resetKey} gameOver={gameOver} />
          </div>
        </div>
        <div className='gameBoardContainer'>
          <div className="gameBoard">
            {renderTiles()}
          </div>
        </div>
        <div className="bottomContainer">
          <button onClick={resetGame}>
            <FontAwesomeIcon icon={faRedo} className="icon" />
            <span className="text">Restart</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
