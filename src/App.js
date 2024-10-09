import { useState } from 'react';

function Square({ value, onSquareClick, highlight }) {
  return (
    <button
      className={`square ${highlight ? 'highlight' : ''}`} // Conditionally apply the highlight class
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares, i);
  }

  const winnerData = calculateWinner(squares);
  const winner = winnerData ? winnerData.winner : null;
  const winningCombination = winnerData ? winnerData.line : [];

  const isDraw = !winner && squares.every(square => square !== null);

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (isDraw) {
    status = 'Draw!';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  // Function to generate a single square
  function renderSquare(i) {
    return (
      <Square
        value={squares[i]}
        onSquareClick={() => handleClick(i)}
        highlight={winningCombination.includes(i)} // Highlight winning squares
      />
    );
  }

  const boardSize = 3; // 3x3 board
  const rows = [];

  for (let row = 0; row < boardSize; row++) {
    const squaresInRow = [];
    for (let col = 0; col < boardSize; col++) {
      squaresInRow.push(renderSquare(row * boardSize + col));
    }
    rows.push(
      <div key={row} className="board-row">
        {squaresInRow}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {rows}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), moveLocation: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares, moveIndex) {
    const nextHistory = [...history.slice(0, currentMove + 1), {
      squares: nextSquares,
      moveLocation: calculateMoveLocation(moveIndex)
    }];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function calculateMoveLocation(index) {
    const boardSize = 3;
    const row = Math.floor(index / boardSize);
    const col = index % boardSize;
    return { row, col };
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function toggleSortOrder() {
    setIsAscending(!isAscending);
  }

  let moves = history.map((step, move) => {
    const moveLocation = step.moveLocation;
    let description;
    if (move === currentMove) {
      description = `You are at move #${move}`;
    } else if (move > 0) {
      description = `Go to move #${move} (${moveLocation.row}, ${moveLocation.col})`;
    } else {
      description = 'Go to game start';
    }

    return (
      <li key={move}>
        {move === currentMove ? (
          <span>{description}</span>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  if (!isAscending) {
    moves = moves.reverse();
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button className="ml-1" onClick={toggleSortOrder}>
          {isAscending ? 'Sort Descending' : 'Sort Ascending'}
        </button>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] }; // Return both winner and winning line
    }
  }
  return null;
}
