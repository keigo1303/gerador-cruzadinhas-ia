import * as React from "react";
import { generateSudoku, solveSudoku } from "sudoku-puzzle";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileText,
  FileCheck,
  Sparkles,
  RotateCcw,
  Grid3x3,
} from "lucide-react";

interface SudokuPuzzle {
  board: number[][];
  solution: number[][];
}

export default function Sudoku() {
  const [gridSize, setGridSize] = React.useState<9 | 16>(9);
  const [difficulty, setDifficulty] = React.useState<1 | 2 | 3 | 4 | 5>(3);
  const [puzzle, setPuzzle] = React.useState<SudokuPuzzle | null>(null);
  const [title] = React.useState("Sudoku");
  const [showHeaderInfo] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const sudokuRef = React.useRef<HTMLDivElement>(null);

  // Fallback function to create a simple Sudoku puzzle if the library fails
  const createFallbackSudoku = (size: 9 | 16) => {
    if (size === 9) {
      // Collection of valid 9x9 Sudoku solutions
      const solutions = [
        [
          [5, 3, 4, 6, 7, 8, 9, 1, 2],
          [6, 7, 2, 1, 9, 5, 3, 4, 8],
          [1, 9, 8, 3, 4, 2, 5, 6, 7],
          [8, 5, 9, 7, 6, 1, 4, 2, 3],
          [4, 2, 6, 8, 5, 3, 7, 9, 1],
          [7, 1, 3, 9, 2, 4, 8, 5, 6],
          [9, 6, 1, 5, 3, 7, 2, 8, 4],
          [2, 8, 7, 4, 1, 9, 6, 3, 5],
          [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          [4, 5, 6, 7, 8, 9, 1, 2, 3],
          [7, 8, 9, 1, 2, 3, 4, 5, 6],
          [2, 1, 4, 3, 6, 5, 8, 9, 7],
          [3, 6, 5, 8, 9, 7, 2, 1, 4],
          [8, 9, 7, 2, 1, 4, 3, 6, 5],
          [5, 3, 1, 6, 4, 2, 9, 7, 8],
          [6, 4, 2, 9, 7, 8, 5, 3, 1],
          [9, 7, 8, 5, 3, 1, 6, 4, 2]
        ],
        [
          [9, 1, 2, 3, 4, 5, 6, 7, 8],
          [3, 4, 5, 6, 7, 8, 9, 1, 2],
          [6, 7, 8, 9, 1, 2, 3, 4, 5],
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          [4, 5, 6, 7, 8, 9, 1, 2, 3],
          [7, 8, 9, 1, 2, 3, 4, 5, 6],
          [2, 3, 1, 5, 6, 4, 8, 9, 7],
          [5, 6, 4, 8, 9, 7, 2, 3, 1],
          [8, 9, 7, 2, 3, 1, 5, 6, 4]
        ]
      ];

      // Randomly select a solution
      const randomSolution = solutions[Math.floor(Math.random() * solutions.length)];
      const solution = randomSolution.map(row => [...row]);

      // Create puzzle by removing some numbers based on difficulty
      const puzzle = solution.map(row => [...row]);
      const removeCount = difficulty === 1 ? 30 : difficulty === 2 ? 40 : difficulty === 3 ? 50 : difficulty === 4 ? 55 : 60;

      const cellsToRemove = new Set();
      while (cellsToRemove.size < removeCount) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        cellsToRemove.add(`${row}-${col}`);
      }

      cellsToRemove.forEach(cell => {
        const [row, col] = cell.split('-').map(Number);
        puzzle[row][col] = 0;
      });

      return { board: puzzle, solution };
    } else {
      // 16x16 Sudoku - create a valid pattern
      const solution = Array(16).fill(null).map((_, i) =>
        Array(16).fill(null).map((_, j) => {
          // Create a pattern that satisfies basic Sudoku rules
          return ((i * 4 + Math.floor(i / 4) + j) % 16) + 1;
        })
      );

      const puzzle = solution.map(row => [...row]);
      const removeCount = Math.floor(256 * (0.3 + difficulty * 0.1)); // 30-80% removal based on difficulty

      const cellsToRemove = new Set();
      while (cellsToRemove.size < removeCount) {
        const row = Math.floor(Math.random() * 16);
        const col = Math.floor(Math.random() * 16);
        cellsToRemove.add(`${row}-${col}`);
      }

      cellsToRemove.forEach(cell => {
        const [row, col] = cell.split('-').map(Number);
        puzzle[row][col] = 0;
      });

      return { board: puzzle, solution };
    }
  };

  const difficultyLabels = {
    1: "Muito Fácil",
    2: "Fácil", 
    3: "Médio",
    4: "Difícil",
    5: "Muito Difícil"
  };

  const generateNewSudoku = () => {
    setIsGenerating(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      try {
        console.log(`Generating ${gridSize}x${gridSize} Sudoku with difficulty ${difficulty}`);

        // For now, use the reliable fallback manual generation
        // The sudoku-puzzle library seems to have compatibility issues
        console.log("Using reliable fallback generation...");
        const newPuzzle = createFallbackSudoku(gridSize);
        console.log("Generated puzzle using fallback:", newPuzzle);

        // Validate the generated puzzle
        if (!newPuzzle || !newPuzzle.board || !newPuzzle.solution ||
            !Array.isArray(newPuzzle.board) || !Array.isArray(newPuzzle.solution)) {
          throw new Error("Fallback generation failed");
        }

        setPuzzle(newPuzzle);

        // Scroll to show the generated puzzle
        setTimeout(() => {
          sudokuRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } catch (error) {
        console.error("Error generating Sudoku:", error);
        alert("Erro ao gerar o Sudoku. Tente novamente.");
      } finally {
        setIsGenerating(false);
      }
    }, 500);
  };

  const renderSudokuGrid = (board: number[][], showSolution: boolean = false) => {
    // Validate board exists and is properly structured
    if (!board || !Array.isArray(board) || board.length === 0) {
      return (
        <div className="p-4 text-center text-red-500 border-2 border-red-200 rounded-lg">
          Erro: Tabuleiro não disponível
        </div>
      );
    }

    const cellSize = gridSize === 9 ? "w-10 h-10" : "w-8 h-8";
    const fontSize = gridSize === 9 ? "text-lg" : "text-sm";
    const subGridSize = gridSize === 9 ? 3 : 4;

    return (
      <div
        className={`grid gap-0.5 p-4 bg-white border-4 border-gray-800 rounded-lg shadow-2xl transition-all duration-300 hover:shadow-3xl`}
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {board.map((row, rowIndex) => {
          // Validate each row
          if (!Array.isArray(row)) {
            return null;
          }
          return row.map((cell, colIndex) => {
            const isRightBorder = (colIndex + 1) % subGridSize === 0 && colIndex !== gridSize - 1;
            const isBottomBorder = (rowIndex + 1) % subGridSize === 0 && rowIndex !== gridSize - 1;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  ${cellSize} border border-gray-300 flex items-center justify-center
                  ${fontSize} font-bold transition-all duration-200 hover:bg-blue-50
                  ${isRightBorder ? 'border-r-4 border-r-gray-800' : ''}
                  ${isBottomBorder ? 'border-b-4 border-b-gray-800' : ''}
                  ${cell === 0 ? 'bg-gray-50' : (showSolution ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-800')}
                `}
              >
                {cell !== 0 && (
                  <span className={showSolution ? "text-blue-700" : "text-gray-800"}>
                    {cell}
                  </span>
                )}
              </div>
            );
          });
        })}
      </div>
    );
  };

  const exportToPDF = (withSolution: boolean) => {
    if (!puzzle) {
      alert("Gere um Sudoku primeiro");
      return;
    }

    // Validate puzzle structure
    if (!puzzle.board || !puzzle.solution || !Array.isArray(puzzle.board) || !Array.isArray(puzzle.solution)) {
      alert("Erro: Estrutura do Sudoku inválida. Gere um novo Sudoku.");
      return;
    }

    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let currentY = 20;

    // Title
    const sudokuTitle = `${title} ${gridSize}x${gridSize} - ${difficultyLabels[difficulty]}`;
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const titleWidth = pdf.getTextWidth(sudokuTitle);
    pdf.text(sudokuTitle, (pageWidth - titleWidth) / 2, currentY);
    currentY += 15;

    // Add some spacing after title
    currentY += 10;

    // Calculate grid dimensions
    const maxGridSize = Math.min(pageWidth - 40, pageHeight - currentY - 30);
    const cellSize = maxGridSize / gridSize;
    const gridWidth = gridSize * cellSize;
    const gridHeight = gridSize * cellSize;
    const gridStartX = (pageWidth - gridWidth) / 2;
    const gridStartY = currentY + 10;

    const boardToUse = withSolution ? puzzle.solution : puzzle.board;
    const subGridSize = gridSize === 9 ? 3 : 4;

    // Draw the grid
    pdf.setLineWidth(0.3);
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = gridStartX + col * cellSize;
        const y = gridStartY + row * cellSize;
        
        // Draw cell border
        pdf.rect(x, y, cellSize, cellSize);
        
        // Draw thicker borders for sub-grids
        if (col % subGridSize === 0) {
          pdf.setLineWidth(1);
          pdf.line(x, gridStartY, x, gridStartY + gridHeight);
          pdf.setLineWidth(0.3);
        }
        if (row % subGridSize === 0) {
          pdf.setLineWidth(1);
          pdf.line(gridStartX, y, gridStartX + gridWidth, y);
          pdf.setLineWidth(0.3);
        }
        
        // Add number if present
        const cellValue = boardToUse[row][col];
        if (cellValue !== 0) {
          pdf.setFontSize(Math.max(8, cellSize * 0.6));
          pdf.setFont("helvetica", "normal");
          const textWidth = pdf.getTextWidth(cellValue.toString());
          pdf.text(
            cellValue.toString(),
            x + (cellSize - textWidth) / 2,
            y + cellSize * 0.7
          );
        }
      }
    }

    // Draw final borders
    pdf.setLineWidth(1);
    pdf.rect(gridStartX, gridStartY, gridWidth, gridHeight);
    
    // Draw sub-grid separators
    for (let i = 1; i < gridSize / subGridSize; i++) {
      const pos = i * subGridSize * cellSize;
      pdf.line(gridStartX + pos, gridStartY, gridStartX + pos, gridStartY + gridHeight);
      pdf.line(gridStartX, gridStartY + pos, gridStartX + gridWidth, gridStartY + pos);
    }

    const filename = `sudoku-${gridSize}x${gridSize}-${difficultyLabels[difficulty].toLowerCase().replace(/\s+/g, "-")}-${withSolution ? "gabarito" : "em-branco"}.pdf`;
    pdf.save(filename);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Gerador de Sudoku
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crie puzzles de Sudoku personalizados com diferentes tamanhos e níveis de dificuldade
          </p>
          <div className="flex justify-center mt-4">
            <Grid3x3 className="w-6 h-6 text-purple-500 animate-pulse" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Configuration Card */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-indigo-50 hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-indigo-700 flex items-center gap-2">
                <Grid3x3 className="w-5 h-5" />
                Configurações do Sudoku
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="grid-size" className="text-sm font-medium text-gray-700 mb-2 block">
                    Tamanho da Grade
                  </Label>
                  <Select value={gridSize.toString()} onValueChange={(value) => {
                    setGridSize(parseInt(value) as 9 | 16);
                    setPuzzle(null); // Clear existing puzzle when grid size changes
                  }}>
                    <SelectTrigger className="border-2 border-indigo-200 focus:border-indigo-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9x9 (Clássico)</SelectItem>
                      <SelectItem value="16">16x16 (Avançado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700 mb-2 block">
                    Dificuldade
                  </Label>
                  <Select value={difficulty.toString()} onValueChange={(value) => {
                    setDifficulty(parseInt(value) as 1 | 2 | 3 | 4 | 5);
                    setPuzzle(null); // Clear existing puzzle when difficulty changes
                  }}>
                    <SelectTrigger className="border-2 border-indigo-200 focus:border-indigo-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Muito Fácil</SelectItem>
                      <SelectItem value="2">Fácil</SelectItem>
                      <SelectItem value="3">Médio</SelectItem>
                      <SelectItem value="4">Difícil</SelectItem>
                      <SelectItem value="5">Muito Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>


              <Button
                onClick={generateNewSudoku}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Gerando Sudoku...
                  </>
                ) : (
                  <>
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    Gerar Sudoku
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Sudoku Display */}
          {puzzle && (
            <Card
              ref={sudokuRef}
              className="shadow-2xl border-0 bg-gradient-to-r from-white to-purple-50 hover:shadow-3xl transition-shadow duration-300"
            >
              <CardHeader>
                <CardTitle className="text-purple-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Grid3x3 className="w-5 h-5" />
                    {title} {gridSize}x{gridSize}
                    <Badge variant="secondary" className="bg-purple-200 text-purple-800">
                      {difficultyLabels[difficulty]}
                    </Badge>
                  </div>
                  <Button
                    onClick={generateNewSudoku}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-2 border-purple-300 hover:bg-purple-50 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Novo Sudoku
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                      Sudoku para Resolver
                    </h3>
                    {puzzle?.board ? renderSudokuGrid(puzzle.board, false) : (
                      <div className="p-4 text-center text-gray-500 border-2 border-gray-200 rounded-lg">
                        Tabuleiro não disponível
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                      Solução
                    </h3>
                    {puzzle?.solution ? renderSudokuGrid(puzzle.solution, true) : (
                      <div className="p-4 text-center text-gray-500 border-2 border-gray-200 rounded-lg">
                        Solução não disponível
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Buttons */}
          {puzzle && (
            <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-green-50 hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Exportar para PDF
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => exportToPDF(false)}
                    variant="outline"
                    className="flex items-center gap-2 border-2 border-blue-300 hover:bg-blue-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <FileText className="w-4 h-4" />
                    Sudoku em Branco
                  </Button>
                  <Button
                    onClick={() => exportToPDF(true)}
                    variant="outline"
                    className="flex items-center gap-2 border-2 border-green-300 hover:bg-green-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <FileCheck className="w-4 h-4" />
                    Sudoku com Solução
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
