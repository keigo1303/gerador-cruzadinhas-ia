const { generateSudoku } = require('sudoku-puzzle');

console.log('Testing sudoku-puzzle library...');

try {
  const result = generateSudoku(9, 3);
  console.log('Result:', result);
  console.log('Type:', typeof result);
  console.log('Keys:', Object.keys(result || {}));
  
  if (result) {
    console.log('Board exists:', !!result.board);
    console.log('Board type:', typeof result.board);
    console.log('Board length:', result.board?.length);
    
    console.log('Solution exists:', !!result.solution);
    console.log('Solution type:', typeof result.solution);
    console.log('Solution length:', result.solution?.length);
    
    if (result.board && result.board.length > 0) {
      console.log('First row of board:', result.board[0]);
    }
  }
} catch (error) {
  console.error('Error:', error);
}
