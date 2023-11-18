import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRankingStar, faCircleQuestion, faRedo, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { collection, onSnapshot, DocumentData, addDoc } from 'firebase/firestore';
import Tile from './Tile';
import CountingClock from './CountingClock';
import db from './firebase';
import complete from './complete.png';
import './App.css';


interface AppState {
  gameOver: boolean;
  resetKey: number;
  timerRecord: number;
  leaderboard: DocumentData[];
  showRanking: boolean;
  shrink: boolean;
  showQuestion: boolean;
  canbeSaved: boolean;
  rowLength: number;
  tiles: Array<string | number>;
}

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      gameOver: false,
      resetKey: 0,
      timerRecord: 0,
      leaderboard: [],
      showRanking: false,
      shrink: false,
      showQuestion: false,
      canbeSaved: false,
      rowLength: 4,
      tiles: [],
    };
    this.handleTileClick = this.handleTileClick.bind(this);
    this.colSwap = this.colSwap.bind(this);
    this.rowSwap = this.rowSwap.bind(this);
    this.renderTiles = this.renderTiles.bind(this);
    this.isSolved = this.isSolved.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.toggleSavedRecord = this.toggleSavedRecord.bind(this);
    this.toggleRanking = this.toggleRanking.bind(this);
    this.toggleQuestion = this.toggleQuestion.bind(this);
    this.handleTimerUpdate = this.handleTimerUpdate.bind(this);
    this.handleNewRecord = this.handleNewRecord.bind(this);
    this.handleGameOverLogic = this.handleGameOverLogic.bind(this);
  }
  componentDidMount() {
    const initialTiles = this.generateSolvablePuzzle();
  
    console.log("im here")
    // leaderboard is the name of the database collection
    onSnapshot(collection(db, "Leaderboard"), (snapshot) => {
      const sortedLeaderboard = snapshot.docs
      .map((doc) => doc.data() as DocumentData)
      .sort((a, b) => a.Score - b.Score);
      
      this.setState({ leaderboard: sortedLeaderboard });
    });
    this.setState({ tiles: initialTiles });
  }

  handleGameOverLogic() {
    //since game over is true, player can save record
    const { gameOver, timerRecord } = this.state;
    if (gameOver) {
      this.setState({ canbeSaved: true });
      this.handleNewRecord(timerRecord);
    }
  }

  handleNewRecord = async (timerVal: number) => {
    const name = prompt(`(Want to save your score <${this.state.timerRecord} seconds> to the Leaderboard?) Enter your name.`);
    if (name !== null){
      const collectionRef = collection(db, "Leaderboard");
      const payload = {Name: name, Score: timerVal};
      await addDoc(collectionRef, payload);
      this.setState({ canbeSaved: false }); // record is already saved
    }
  };

  
  isSolved = () => {
    const { tiles, gameOver } = this.state;

    if (gameOver) {
      // If the game is already over, return true
      return true;
    }
    const numbers = new Set<number>();
  
    for (let i = 1; i <= 15; i++) {
      numbers.add(i);
    }
  
    const winState: Array<string | number> = Array.from(numbers);
    winState.push('');
  
    const isWin = tiles.every((value, index) => value === winState[index]);
    if (isWin) {
      this.setState({ gameOver: true });
      return true;
    }
    return false;
  };

  generateSolvablePuzzle = () => {
    const solvedPuzzle: Array<string | number> = Array.from({ length: 15 }, (_, i) => i + 1);
    solvedPuzzle.push('');
    const shuffleCount = 300; // the number of random swaps
    for (let i = 0; i < shuffleCount; i++) {
      const emptyIndex = solvedPuzzle.indexOf('');
      const neighbors = this.getNeighbors(emptyIndex);
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      [solvedPuzzle[emptyIndex], solvedPuzzle[randomNeighbor]] = [solvedPuzzle[randomNeighbor], solvedPuzzle[emptyIndex]];
    }
  
    return solvedPuzzle;
  };

  getNeighbors = (index:any) => {
    const neighbors = [];
    const rowLength = this.state.rowLength;
    // Check top neighbor
    if (index >= rowLength) neighbors.push(index - rowLength);
    // Check bottom neighbor
    if (index < 15 - rowLength) neighbors.push(index + rowLength);
    // Check left neighbor
    if (index % rowLength !== 0) neighbors.push(index - 1);
    // Check right neighbor
    if ((index + 1) % rowLength !== 0) neighbors.push(index + 1);
    return neighbors;
  };


  handleTileClick = (clickedIndex: number) => {
    let tiles = this.state.tiles;
    const rowLength = this.state.rowLength;
    if (this.state.gameOver) return;
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
        this.rowSwap(rowArray,clickedIndex, zeroIndex);
      } else {
        rowArray = tiles.slice(zeroIndex+1, clickedIndex+1);
        this.rowSwap(rowArray,clickedIndex, zeroIndex);
      }
    } 
    else if (clickedCol === zeroCol) {
      let colArray:any;
      if (zeroIndex > clickedIndex) {
        colArray = [];
        for (let i = clickedIndex; i < zeroIndex; i += rowLength) {
          colArray.push(tiles[i]);
        }
        this.colSwap(colArray, clickedIndex, zeroIndex);
      } else {
        colArray = [];
        for (let i = zeroIndex+rowLength; i <= clickedIndex; i += rowLength) {
          colArray.push(tiles[i]);
        }
        this.colSwap(colArray, clickedIndex, zeroIndex);
      }
    }
    if (this.isSolved()) {
      this.setState({ gameOver: true, shrink: true }, () => {
        this.handleGameOverLogic();
      });
    }
  };

  colSwap = (arr:any, clickedIndex:number, zeroIndex:number) => {
    const { rowLength, tiles } = this.state;
    const tempArr = [...tiles];
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
    this.setState({ tiles: tempArr });
  };


  rowSwap = (arr:any, clickedIndex:number, zeroIndex:number) => {
    const { tiles } = this.state;
    const tempArr = [...tiles];
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
    this.setState({ tiles: tempArr });
  };

  renderTiles = () => {
    const { tiles, shrink } = this.state;
  
    return tiles.map((tile, index) => (
      <Tile
        key={index}
        number={tile}
        onClick={() => this.handleTileClick(index)} // Use this to access the class method
        className={shrink ? "tile shrink" : "tile"}
        isEmpty={tile === ''}
      />
    ));
  };
  
  resetGame = () => {
    this.setState((prevState) => ({
      gameOver: false,
      canbeSaved: false,
      tiles: this.generateSolvablePuzzle(),
      resetKey: prevState.resetKey + 1,
    }));
  };
  
  //if user did not save the record, this method will call the handleNewRecord function again
  toggleSavedRecord = () => {
    this.handleNewRecord(this.state.timerRecord);
  };
  
  toggleRanking = () => {
    this.setState((prevState) => ({
      showRanking: !prevState.showRanking,
    }));
  };
  
  toggleQuestion = () => {
    this.setState((prevState) => ({
      showQuestion: !prevState.showQuestion,
    }));
  };
  

  handleTimerUpdate = (timerValue: number) => {
    this.setState({ timerRecord: timerValue });
  }

  render() {
    const { gameOver, resetKey, showRanking, showQuestion, leaderboard, canbeSaved } = this.state;

    return (
      <div className={`App ${gameOver ? 'game-over' : ''}`}>
        <div className="App-header">
          <h3 className="title">15 Puzzle Game</h3>
          {gameOver && <p className="gameOverText">Well Done!</p>}
          <div className="timerContainer">
            <div className="timer">
              <CountingClock key={resetKey} gameOver={gameOver} onTimerUpdate={this.handleTimerUpdate} />
            </div>
          </div>
          <div className="gameBoardContainer">
            <div className="gameBoard">{this.renderTiles()}</div>
          </div>
          <div className="bottomContainer">
            <button onClick={this.resetGame}>
              <FontAwesomeIcon icon={faRedo} className="icon" />
              <span className="text">Restart</span>
            </button>
            <button onClick={this.toggleRanking}>
              <FontAwesomeIcon icon={faRankingStar} className="icon" />
              <span className="text">Ranking</span>
            </button>
            <button onClick={this.toggleQuestion}>
              <FontAwesomeIcon icon={faCircleQuestion} className="icon" />
              <span className="text">Help</span>
            </button>
            <button onClick={this.toggleSavedRecord} disabled={!canbeSaved}>
              <FontAwesomeIcon
                icon={faFloppyDisk}
                className="icon"
                style={{
                  color: canbeSaved ? '#693434' : '#666',
                  cursor: canbeSaved ? 'pointer' : 'not-allowed',
                }}
              />
              <span
                className="text"
                style={{
                  color: canbeSaved ? '#693434' : '#666',
                  cursor: canbeSaved ? 'pointer' : 'not-allowed',
                }}
              >
                Save Score
              </span>
            </button>
          </div>
          {showRanking && (
          <div className="ranking-popup">
            <div className="popup-content">
              <button onClick={this.toggleRanking} className="close-btn">
                X
              </button>
              <h2 className='leaderboardTitle'>Leaderboard</h2>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Score<span className="smallText">/sec</span></th>

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
              <button onClick={this.toggleQuestion} className="close-btn">
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
}

export default App;





