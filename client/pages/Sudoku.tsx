import * as React from "react";
import { getSudoku } from "sudoku-gen";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [gridSize] = React.useState<9>(9); // sudoku-gen only supports 9x9
  const [difficulty, setDifficulty] = React.useState<1 | 2 | 3 | 4 | 5>(3);
  const [puzzle, setPuzzle] = React.useState<SudokuPuzzle | null>(null);
  const [title] = React.useState("Sudoku");
  const [showHeaderInfo] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const sudokuRef = React.useRef<HTMLDivElement>(null);

  // Convert sudoku string to 2D array
  const stringToGrid = (sudokuString: string): number[][] => {
    const grid: number[][] = [];
    for (let i = 0; i < 9; i++) {
      const row: number[] = [];
      for (let j = 0; j < 9; j++) {
        const char = sudokuString[i * 9 + j];
        if (char === "." || char === "0") {
          row.push(0);
        } else {
          const num = parseInt(char, 10);
          // Ensure we only push valid numbers between 1-9, otherwise use 0
          row.push(isNaN(num) || num < 1 || num > 9 ? 0 : num);
        }
      }
      grid.push(row);
    }
    return grid;
  };

  // Map numeric difficulty to string difficulty for sudoku-gen
  const mapDifficultyToString = (
    numDifficulty: number,
  ): "easy" | "medium" | "hard" | "expert" => {
    switch (numDifficulty) {
      case 1:
        return "easy";
      case 2:
        return "easy";
      case 3:
        return "medium";
      case 4:
        return "hard";
      case 5:
        return "expert";
      default:
        return "medium";
    }
  };

  const difficultyLabels = {
    1: "Muito Fácil",
    2: "Fácil",
    3: "Médio",
    4: "Difícil",
    5: "Expert",
  };

  const generateNewSudoku = () => {
    setIsGenerating(true);

    // Small delay to show loading state
    setTimeout(() => {
      try {
        console.log(`Generating 9x9 Sudoku with difficulty ${difficulty}`);

        // Map numeric difficulty to string
        const difficultyString = mapDifficultyToString(difficulty);
        console.log(`Using difficulty: ${difficultyString}`);

        // Generate puzzle using sudoku-gen
        const result = getSudoku(difficultyString);
        console.log("Generated puzzle result:", result);

        // Convert strings to 2D arrays
        const puzzleBoard = stringToGrid(result.puzzle);
        const solutionBoard = stringToGrid(result.solution);

        console.log("Converted puzzle board:", puzzleBoard);
        console.log("Converted solution board:", solutionBoard);

        // Create the puzzle object
        const newPuzzle = {
          board: puzzleBoard,
          solution: solutionBoard,
        };

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

  const renderSudokuGrid = (
    board: number[][],
    showSolution: boolean = false,
  ) => {
    // Validate board exists and is properly structured
    if (!board || !Array.isArray(board) || board.length === 0) {
      return (
        <div className="p-4 text-center text-red-500 border-2 border-red-200 rounded-lg">
          Erro: Tabuleiro não disponível
        </div>
      );
    }

    const cellSize = "w-10 h-10";
    const fontSize = "text-lg";
    const subGridSize = 3;

    return (
      <div
        className={`grid gap-0.5 p-4 bg-white border-4 border-gray-800 rounded-lg shadow-2xl transition-all duration-300 hover:shadow-3xl`}
        style={{ gridTemplateColumns: `repeat(9, 1fr)` }}
      >
        {board.map((row, rowIndex) => {
          // Validate each row
          if (!Array.isArray(row)) {
            return null;
          }
          return row.map((cell, colIndex) => {
            const isRightBorder =
              (colIndex + 1) % subGridSize === 0 && colIndex !== 8;
            const isBottomBorder =
              (rowIndex + 1) % subGridSize === 0 && rowIndex !== 8;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  ${cellSize} border border-gray-300 flex items-center justify-center
                  ${fontSize} font-bold transition-all duration-200 hover:bg-blue-50
                  ${isRightBorder ? "border-r-4 border-r-gray-800" : ""}
                  ${isBottomBorder ? "border-b-4 border-b-gray-800" : ""}
                  ${cell === 0 ? "bg-gray-50" : showSolution ? "bg-blue-50 text-blue-700" : "bg-white text-gray-800"}
                `}
              >
                {cell !== 0 && !isNaN(cell) && isFinite(cell) && (
                  <span
                    className={showSolution ? "text-blue-700" : "text-gray-800"}
                  >
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
    if (
      !puzzle.board ||
      !puzzle.solution ||
      !Array.isArray(puzzle.board) ||
      !Array.isArray(puzzle.solution)
    ) {
      alert("Erro: Estrutura do Sudoku inválida. Gere um novo Sudoku.");
      return;
    }

    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let currentY = 20;

    // Title
    const sudokuTitle = `${title} 9x9 - ${difficultyLabels[difficulty]}`;
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const titleWidth = pdf.getTextWidth(sudokuTitle);
    pdf.text(sudokuTitle, (pageWidth - titleWidth) / 2, currentY);
    currentY += 15;

    // Add some spacing after title
    currentY += 10;

    // Calculate grid dimensions (always 9x9)
    const maxGridSize = Math.min(pageWidth - 40, pageHeight - currentY - 30);
    const cellSize = maxGridSize / 9;
    const gridWidth = 9 * cellSize;
    const gridHeight = 9 * cellSize;
    const gridStartX = (pageWidth - gridWidth) / 2;
    const gridStartY = currentY + 10;

    const boardToUse = withSolution ? puzzle.solution : puzzle.board;
    const subGridSize = 3;

    // Draw the grid
    pdf.setLineWidth(0.3);
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
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
            y + cellSize * 0.7,
          );
        }
      }
    }

    // Draw final borders
    pdf.setLineWidth(1);
    pdf.rect(gridStartX, gridStartY, gridWidth, gridHeight);

    // Draw sub-grid separators
    for (let i = 1; i < 3; i++) {
      const pos = i * 3 * cellSize;
      pdf.line(
        gridStartX + pos,
        gridStartY,
        gridStartX + pos,
        gridStartY + gridHeight,
      );
      pdf.line(
        gridStartX,
        gridStartY + pos,
        gridStartX + gridWidth,
        gridStartY + pos,
      );
    }

    const filename = `sudoku-9x9-${difficultyLabels[difficulty].toLowerCase().replace(/\s+/g, "-")}-${withSolution ? "gabarito" : "em-branco"}.pdf`;
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
            Crie puzzles de Sudoku personalizados com diferentes tamanhos e
            níveis de dificuldade
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
              <div className="grid md:grid-cols-1 gap-6">
                <div>
                  <Label
                    htmlFor="difficulty"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Dificuldade
                  </Label>
                  <Select
                    value={difficulty.toString()}
                    onValueChange={(value) => {
                      setDifficulty(parseInt(value) as 1 | 2 | 3 | 4 | 5);
                      setPuzzle(null); // Clear existing puzzle when difficulty changes
                    }}
                  >
                    <SelectTrigger className="border-2 border-indigo-200 focus:border-indigo-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Fácil</SelectItem>
                      <SelectItem value="2">Fácil</SelectItem>
                      <SelectItem value="3">Médio</SelectItem>
                      <SelectItem value="4">Difícil</SelectItem>
                      <SelectItem value="5">Expert</SelectItem>
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
                    {title} 9x9
                    <Badge
                      variant="secondary"
                      className="bg-purple-200 text-purple-800"
                    >
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
                    {puzzle?.board ? (
                      renderSudokuGrid(puzzle.board, false)
                    ) : (
                      <div className="p-4 text-center text-gray-500 border-2 border-gray-200 rounded-lg">
                        Tabuleiro não disponível
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                      Solução
                    </h3>
                    {puzzle?.solution ? (
                      renderSudokuGrid(puzzle.solution, true)
                    ) : (
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
