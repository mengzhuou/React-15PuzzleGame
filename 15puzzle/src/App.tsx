import { useState, useEffect } from 'react';
import './App.css';
import Tile from './Tile';
import CountingClock from './CountingClock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRankingStar, faCircleQuestion, faRedo, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import db from "./firebase";
import { collection, onSnapshot, DocumentData, addDoc } from 'firebase/firestore';
import complete from './complete.png';

function App() {
  const [gameOver, setGameOver] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [timerRecord, setTimerRecord] = useState(0);
  const [leaderboard, setLeaderboard] = useState<DocumentData[]>([]);
  const [showRanking, setShowRanking] = useState(false);
  const [shrink, setShrink] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  //false means button is gray and cannot save record
  const [isSaved, setIsSaved] = useState(false);

  
  const rowLength = 4; // Assuming it's a 4x4 grid

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

  const shrinkTiles = (isShrink: boolean) => {
    setShrink(isShrink);
  };
  
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
        isEmpty={tile === ''}
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
    const isWin = tiles.every((value, index) => value === winState[index]);
    if (isWin) {
      setGameOver(true); 
      return true;
    }
    return false; 
  };

  const resetGame = () => {
    setGameOver(false); 
    setIsSaved(false);
    setTiles(generateRandomNumbers());
    setResetKey(prevKey => prevKey+1);
  };

  //if user did not save the record, this method will call the handleNewRecord function again
  const toggleSavedRecord = () => {
    handleNewRecord(timerRecord);
  }
  const toggleRanking = () => {
    setShowRanking(!showRanking);
  }

  const toggleQuestion = () => {
    setShowQuestion(!showQuestion);
  }

  useEffect(() => {
    if (gameOver) {
      setIsSaved(true);
      handleNewRecord(timerRecord);
    }
  }, [gameOver, timerRecord]);

  useEffect(() => {
    // leaderboard is the name of the database collection
    const unsubscribe = onSnapshot(collection(db, "Leaderboard"), (snapshot) => {
      const sortedLeaderboard = snapshot.docs
        .map((doc) => doc.data() as DocumentData)
        .sort((a, b) => a.Score - b.Score);
      
      setLeaderboard(sortedLeaderboard);
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, []);

  const handleTimerUpdate = (timerValue: number) => {
    setTimerRecord(timerValue);
  }

  const handleNewRecord = async (timerVal: number) => {
    const name = prompt(`(Want to save your score <${timerRecord} seconds> to the Leaderboard?) Enter your name.`);

    if (name !== null){
      const collectionRef = collection(db, "Leaderboard");
      const payload = {Name: name, Score: timerVal};
      await addDoc(collectionRef, payload);
      setIsSaved(false);//record is already saved
    }
  }

  return (
    <div className={`App ${gameOver ? 'game-over' : ''}`}>
      <div className="App-header">
      <h3 className='title'>15 Puzzle Game</h3>
        {gameOver && (
          <p className="gameOverText">Well Done!</p>
        )}
        <div className='timerContainer'>
          <div className='timer'>
            <CountingClock key={resetKey} gameOver={gameOver} onTimerUpdate={handleTimerUpdate} />
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
          <button onClick={toggleRanking}>
            <FontAwesomeIcon icon={faRankingStar} className="icon" />
            <span className="text">Ranking</span>
          </button>
          <button onClick={toggleQuestion}>
            <FontAwesomeIcon icon={faCircleQuestion} className="icon" />
            <span className="text">Help</span>
          </button>
          <button 
            onClick={toggleSavedRecord} 
            disabled={!isSaved} 
          >
            <FontAwesomeIcon 
              icon={faFloppyDisk} 
              className="icon" 
              style={{ 
                color: isSaved ? 'transparent' : '#666', 
                cursor: isSaved ? 'pointer' : 'not-allowed' 
              }}  
            />
            <span 
              className="text" 
              style={{ 
                color: isSaved ? 'transparent' : '#666', 
                cursor: isSaved ? 'pointer' : 'not-allowed'
              }}
            >
              Save Score
            </span>
          </button>
        </div>
      {showRanking && (
        <div className="ranking-popup">
          <div className="popup-content">
            <button onClick={toggleRanking} className="close-btn">
              X
            </button>
            <h2 className='leaderboardTitle'>Leaderboard</h2>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Score/sec</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((result, index) => (
                  <tr key={result.id || index}>
                    <td>{index + 1}</td>
                    <td>{result.Name}</td>
                    <td>{result.Score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showQuestion && (
        <div className="ranking-popup">
          <div className="popup-content">
            <button onClick={toggleQuestion} className="close-btn">
              X
            </button>
            <div className='helpTitle'>Help</div>
            <div className='helpText'>
              <i><b>1.</b></i> Your goal is to arrange the tiles in ascending order by repeatedly sliding tiles into the empty space until reaching the configuration 1-2-3-4, 5-6-7-8, 9-10-11-12, 13-14-15-⬜.<br />
              <i><b>2.</b></i> You can slide more than 1 tile at a time if what you clicked is on the same row or column with the empty tile.
            </div>
            <img className="completedImg" src={complete} alt='completed'/>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default App;
