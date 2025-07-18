import React, { useState, useEffect } from 'react';
import './App.css';

// Colors from requirements
const PRIMARY_COLOR = '#1976d2';
const SECONDARY_COLOR = '#424242';
const ACCENT_COLOR = '#fbc02d';

// Helpers - Game logic
const emptyBoard = () => Array(3).fill('').map(() => Array(3).fill(''));

function checkWinner(board) {
  // Rows & Cols
  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] &&
      board[i][0] === board[i][1] &&
      board[i][1] === board[i][2]
    )
      return board[i][0];
    if (
      board[0][i] &&
      board[0][i] === board[1][i] &&
      board[1][i] === board[2][i]
    )
      return board[0][i];
  }
  // Diags
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2])
    return board[0][0];
  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0])
    return board[0][2];
  // Draw
  if (board.flat().every(c => c)) return 'draw';
  return null;
}

// Basic AI: Pick random empty square
function aiMove(board, aiSymbol) {
  const empty = [];
  board.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (!cell) empty.push([r, c]);
    })
  );
  if (!empty.length) return board;
  const idx = Math.floor(Math.random() * empty.length);
  const [r, c] = empty[idx];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = aiSymbol;
  return newBoard;
}

// PUBLIC_INTERFACE
function App() {
  // Theme state (template)
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Game settings
  const [mode, setMode] = useState('pvp'); // 'pvp' or 'ai'
  const [playerSymbol, setPlayerSymbol] = useState('X'); // 'X' or 'O'
  const [scores, setScores] = useState({X: 0, O: 0});
  const [board, setBoard] = useState(emptyBoard());
  const [current, setCurrent] = useState('X');
  const [winner, setWinner] = useState(null);
  const [gameActive, setGameActive] = useState(true);

  // Handle move
  const handleSquareClick = (r, c) => {
    if (!gameActive || board[r][c] || (mode === 'ai' && current !== playerSymbol)) return;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = current;
    proceedGame(newBoard, current === 'X' ? 'O' : 'X');
  };

  // Continue game after move (and auto AI if needed)
  const proceedGame = (newBoard, nextPlayer) => {
    setBoard(newBoard);
    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result);
      setGameActive(false);
      if (result === 'X' || result === 'O') {
        setScores(s => ({...s, [result]: s[result] + 1}));
      }
      return;
    }
    setCurrent(nextPlayer);
  };

  // AI move effect
  useEffect(() => {
    if (
      gameActive &&
      mode === 'ai' &&
      current !== playerSymbol &&
      !winner
    ) {
      const ai = playerSymbol === 'X' ? 'O' : 'X';
      const aiBoard = aiMove(board, ai);
      setTimeout(() => {
        proceedGame(aiBoard, playerSymbol);
      }, 400); // slight delay for UX
    }
    // eslint-disable-next-line
  }, [board, current, gameActive, mode, playerSymbol, winner]);

  const resetBoard = () => {
    setBoard(emptyBoard());
    setCurrent('X');
    setWinner(null);
    setGameActive(true);
  };

  const newGame = () => {
    setScores({X: 0, O: 0});
    resetBoard();
  };

  // Change mode handler
  const handleModeChange = (val) => {
    setMode(val);
    newGame();
  };

  // Change symbol handler (only at start, resets game)
  const handleSymbolChange = (sym) => {
    setPlayerSymbol(sym);
    newGame();
  };

  // PUBLIC_INTERFACE
  return (
    <div className="App" style={{ minHeight: '100vh' }}>
      <main className="ttt-main-content">
        {/* Score / Settings Panel */}
        <section className="ttt-panel">
          <h2 className="ttt-title" style={{ color: PRIMARY_COLOR }}>Tic Tac Toe</h2>
          <div className="ttt-modes">
            <label>
              <input
                type="radio"
                checked={mode === 'pvp'}
                onChange={() => handleModeChange('pvp')}
                name="mode"
              />
              2 Players
            </label>
            <label>
              <input
                type="radio"
                checked={mode === 'ai'}
                onChange={() => handleModeChange('ai')}
                name="mode"
              />
              Vs Computer
            </label>
          </div>
          {mode === 'ai' && (
            <div className="ttt-symbols">
              <span>Play as</span>
              <button
                className={`ttt-symbol-btn${playerSymbol === 'X' ? ' active' : ''}`}
                style={{ borderColor: playerSymbol === 'X' ? ACCENT_COLOR : SECONDARY_COLOR }}
                onClick={() => handleSymbolChange('X')}
              >X</button>
              <button
                className={`ttt-symbol-btn${playerSymbol === 'O' ? ' active' : ''}`}
                style={{ borderColor: playerSymbol === 'O' ? ACCENT_COLOR : SECONDARY_COLOR }}
                onClick={() => handleSymbolChange('O')}
              >O</button>
            </div>
          )}
          <div className="ttt-score-row">
            <span style={{ color: ACCENT_COLOR }}>X: {scores.X}</span>
            <span style={{ color: SECONDARY_COLOR }}>O: {scores.O}</span>
          </div>
        </section>
        {/* Game Board */}
        <section className="ttt-board">
          {board.map((row, r) =>
            <div className="ttt-board-row" key={`row-${r}`}>
              {row.map((v, c) =>
                <button
                  className="ttt-square"
                  key={`square-${r}-${c}`}
                  aria-label={`Square ${r},${c}`}
                  onClick={() => handleSquareClick(r, c)}
                  disabled={!!winner || !!v || (mode === 'ai' && current !== playerSymbol)}
                >
                  {v}
                </button>
              )}
            </div>
          )}
        </section>
        {/* Info + Controls */}
        <section className="ttt-controls">
          {winner && (
            <div className="ttt-status" style={{
              color: winner === 'draw' ? SECONDARY_COLOR : ACCENT_COLOR
            }}>
              {winner === 'draw' ? "It's a draw!" : `Winner: ${winner}`}
            </div>
          )}
          {!winner && (
            <div className="ttt-status">
              {mode === 'ai'
                ? (current === playerSymbol
                  ? `Your turn (${playerSymbol})`
                  : "AI's turn")
                : `Turn: ${current}`}
            </div>
          )}
          <div className="ttt-btn-row">
            <button className="ttt-btn reset" style={{ background: SECONDARY_COLOR }}
              onClick={resetBoard}
            >
              Reset Board
            </button>
            <button className="ttt-btn newgame" style={{ background: PRIMARY_COLOR, color: '#fff' }}
              onClick={newGame}
            >
              New Game
            </button>
            <button 
              className="theme-toggle" 
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              style={{
                position: 'static',
                background: ACCENT_COLOR,
                color: SECONDARY_COLOR,
                marginLeft: '1rem'
              }}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
