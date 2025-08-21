import * as React from "react";
import * as wordfind from "wordfind";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Download,
  FileText,
  FileCheck,
  Sparkles,
  Plus,
  X,
  Bot,
  User,
  Search,
  ArrowLeft,
} from "lucide-react";
import { wordDatabase } from "@shared/word-database";
import { Link } from "react-router-dom";

interface Word {
  id: string;
  word: string;
}

interface WordSearchResult {
  grid: string[][];
  words: Array<{
    word: string;
    x: number;
    y: number;
    orientation: string;
    startx: number;
    starty: number;
    endx: number;
    endy: number;
  }>;
  size: {
    rows: number;
    cols: number;
  };
}

interface CellPosition {
  row: number;
  col: number;
}

interface FoundWord {
  word: string;
  cells: CellPosition[];
}

export default function CacaPalavras() {
  const [word, setWord] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [words, setWords] = React.useState<Word[]>([]);
  const [wordSearchGrid, setWordSearchGrid] =
    React.useState<WordSearchResult | null>(null);
  const [showHeaderInfo, setShowHeaderInfo] = React.useState(false);
  const [isAIMode, setIsAIMode] = React.useState(false);
  const [aiTheme, setAiTheme] = React.useState("");
  const [aiDifficulty, setAiDifficulty] = React.useState("");
  const [aiWordCount, setAiWordCount] = React.useState(10);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [foundWords, setFoundWords] = React.useState<FoundWord[]>([]);
  const [selectedCells, setSelectedCells] = React.useState<CellPosition[]>([]);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [startCell, setStartCell] = React.useState<CellPosition | null>(null);
  const wordInputRef = React.useRef<HTMLInputElement>(null);

  const addWord = () => {
    if (word.trim()) {
      if (words.length >= 25) {
        alert("Limite máximo de 25 palavras por caça-palavras atingido.");
        return;
      }
      const newWord: Word = {
        id: Date.now().toString(),
        word: word.toUpperCase().trim(),
      };
      setWords([...words, newWord]);
      setWord("");
      setTimeout(() => wordInputRef.current?.focus(), 100);
    }
  };

  const removeWord = (id: string) => {
    setWords(words.filter((w) => w.id !== id));
  };

  const clearAllWords = () => {
    setWords([]);
    setWordSearchGrid(null);
  };

  // AI word generation function
  const generateAIWords = () => {
    if (!aiTheme || !aiDifficulty) {
      alert("Por favor, informe o tema e a dificuldade.");
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const themeKey = aiTheme.toLowerCase();
      const difficultyKey = aiDifficulty.toLowerCase();

      if (wordDatabase[themeKey] && wordDatabase[themeKey][difficultyKey]) {
        const availableWords = wordDatabase[themeKey][difficultyKey];
        const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
        const selectedWords = shuffled.slice(0, aiWordCount);

        const newWords: Word[] = selectedWords.map((item, index) => ({
          id: `ai-${Date.now()}-${index}`,
          word: item.word,
        }));

        setWords(newWords);
      } else {
        // Fallback for themes not in database
        const fallbackWords: Word[] = [];
        for (let i = 0; i < aiWordCount; i++) {
          fallbackWords.push({
            id: `ai-fallback-${Date.now()}-${i}`,
            word: `PALAVRA${i + 1}`,
          });
        }
        setWords(fallbackWords);
      }

      setIsGenerating(false);
    }, 2000);
  };

  const generateWordSearchGrid = () => {
    if (words.length < 3) {
      alert("Adicione pelo menos 3 palavras para gerar o caça-palavras");
      return;
    }

    // Reset found words when generating new grid
    setFoundWords([]);
    setSelectedCells([]);
    setIsSelecting(false);
    setStartCell(null);

    try {
      const wordList = words.map((w) => w.word.toLowerCase());

      console.log("Generating word search with words:", wordList);

      // Calculate appropriate grid size based on word count and length
      const longestWord = Math.max(...wordList.map((w) => w.length));
      const wordCount = wordList.length;
      // Make grid larger to accommodate more words in different directions
      const gridSize = Math.max(
        15,
        Math.min(25, longestWord + Math.ceil(Math.sqrt(wordCount)) + 3),
      );

      // Create word search using wordfind library
      const puzzle = wordfind.newPuzzle(wordList, {
        width: gridSize,
        height: gridSize,
        orientations: ['horizontal', 'vertical', 'diagonal', 'horizontalBack', 'verticalUp', 'diagonalUp', 'diagonalUpBack']
      });

      if (!puzzle) {
        throw new Error('Failed to generate word search puzzle');
      }

      console.log('Generated puzzle:', puzzle);

      // Find word positions using solve method
      const solution = wordfind.solve(puzzle, wordList);
      console.log('Solution:', solution);
      const foundWords = solution.found || [];

      // Convert to uppercase for display
      const uppercaseGrid = puzzle.map(row =>
        row.map(cell => cell.toUpperCase())
      );

      // Convert found words to our format
      const wordsWithPositions = foundWords.map(wordInfo => ({
        word: wordInfo.word.toUpperCase(),
        x: wordInfo.x,
        y: wordInfo.y,
        orientation: wordInfo.orientation,
        startx: wordInfo.x,
        starty: wordInfo.y,
        endx: wordInfo.endx || wordInfo.x,
        endy: wordInfo.endy || wordInfo.y
      }));

      const result: WordSearchResult = {
        grid: uppercaseGrid,
        words: wordsWithPositions,
        size: {
          rows: gridSize,
          cols: gridSize
        }
      };

      console.log('Final result:', result);
      setWordSearchGrid(result);

    } catch (error) {
      console.error("Error generating word search:", error);
      alert("Erro ao gerar o caça-palavras. Tente palavras diferentes.");
    }
  };


  // Helper function to check if a cell is part of a found word
  const isCellFound = (row: number, col: number): boolean => {
    return foundWords.some(foundWord =>
      foundWord.cells.some(cell => cell.row === row && cell.col === col)
    );
  };

  // Helper function to check if a cell is currently selected
  const isCellSelected = (row: number, col: number): boolean => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  // Helper function to get cells between two points (for word selection)
  const getCellsBetween = (start: CellPosition, end: CellPosition): CellPosition[] => {
    const cells: CellPosition[] = [];
    const deltaRow = end.row - start.row;
    const deltaCol = end.col - start.col;

    // Check if it's a valid direction (horizontal, vertical, or diagonal)
    const isHorizontal = deltaRow === 0;
    const isVertical = deltaCol === 0;
    const isDiagonal = Math.abs(deltaRow) === Math.abs(deltaCol);

    if (!isHorizontal && !isVertical && !isDiagonal) {
      return [];
    }

    const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
    const stepRow = steps === 0 ? 0 : deltaRow / steps;
    const stepCol = steps === 0 ? 0 : deltaCol / steps;

    for (let i = 0; i <= steps; i++) {
      cells.push({
        row: start.row + Math.round(stepRow * i),
        col: start.col + Math.round(stepCol * i)
      });
    }

    return cells;
  };

  // Helper function to get the word formed by selected cells
  const getWordFromCells = (cells: CellPosition[]): string => {
    if (!wordSearchGrid) return '';
    return cells.map(cell => wordSearchGrid.grid[cell.row][cell.col]).join('');
  };

  // Helper function to check if selected cells match any solution word
  const isValidWord = (selectedCells: CellPosition[]): string | null => {
    if (!wordSearchGrid || selectedCells.length < 2) return null;

    // Check against each word position
    for (const wordInfo of wordSearchGrid.words) {
      const solutionCells = getSolutionCells(wordInfo);

      // Check if selected cells match solution (forward or backward)
      if (cellsMatch(selectedCells, solutionCells) || cellsMatch(selectedCells, solutionCells.reverse())) {
        return wordInfo.word;
      }
    }
    return null;
  };

  // Helper function to get all cells for a solution word
  const getSolutionCells = (wordInfo: any): CellPosition[] => {
    const cells: CellPosition[] = [];
    const { word, x, y, orientation, endx, endy } = wordInfo;

    // Calculate direction based on start and end points
    const deltaX = endx - x;
    const deltaY = endy - y;
    const steps = Math.max(Math.abs(deltaX), Math.abs(deltaY));

    if (steps === 0) {
      return [{ row: y, col: x }];
    }

    const stepX = steps === 0 ? 0 : deltaX / steps;
    const stepY = steps === 0 ? 0 : deltaY / steps;

    for (let i = 0; i < word.length; i++) {
      cells.push({
        row: y + Math.round(stepY * i),
        col: x + Math.round(stepX * i)
      });
    }

    return cells;
  };

  // Helper function to check if two cell arrays match
  const cellsMatch = (cells1: CellPosition[], cells2: CellPosition[]): boolean => {
    if (cells1.length !== cells2.length) return false;

    return cells1.every((cell1, index) => {
      const cell2 = cells2[index];
      return cell1.row === cell2.row && cell1.col === cell2.col;
    });
  };

  // Mouse handlers for word selection
  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setStartCell({ row, col });
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isSelecting && startCell) {
      const cells = getCellsBetween(startCell, { row, col });
      setSelectedCells(cells);
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectedCells.length > 1) {
      const validWord = isValidWord(selectedCells);

      if (validWord) {
        // Check if word is already found
        const alreadyFound = foundWords.some(fw => fw.word === validWord);
        if (!alreadyFound) {
          console.log('Found word:', validWord, 'at cells:', selectedCells);
          setFoundWords(prev => [...prev, { word: validWord, cells: [...selectedCells] }]);
        } else {
          console.log('Word already found:', validWord);
        }
      } else {
        const selectedWord = getWordFromCells(selectedCells);
        console.log('Invalid selection:', selectedWord, 'cells:', selectedCells);
      }
    }

    setIsSelecting(false);
    setStartCell(null);
    setSelectedCells([]);
  };

  const renderGrid = () => {
    if (!wordSearchGrid) return null;

    return (
      <div className="flex flex-col items-center gap-8">
        <div
          className="grid gap-1 p-6 bg-white border-2 border-green-200 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl select-none"
          style={{
            gridTemplateColumns: `repeat(${wordSearchGrid.size.cols}, 1fr)`,
          }}
          onMouseLeave={() => {
            if (isSelecting) {
              setIsSelecting(false);
              setStartCell(null);
              setSelectedCells([]);
            }
          }}
        >
          {wordSearchGrid.grid.map((row, y) =>
            row.map((cell, x) => {
              const isFound = isCellFound(y, x);
              const isSelected = isCellSelected(y, x);

              return (
                <div
                  key={`${x}-${y}`}
                  className={`w-8 h-8 border border-gray-300 flex items-center justify-center text-sm font-bold cursor-pointer transition-all duration-200 ${
                    isFound
                      ? 'bg-green-200 border-green-400 text-green-800'
                      : isSelected
                        ? 'bg-blue-200 border-blue-400 text-blue-800'
                        : 'bg-white hover:bg-green-50'
                  }`}
                  onMouseDown={() => handleMouseDown(y, x)}
                  onMouseEnter={() => handleMouseEnter(y, x)}
                  onMouseUp={handleMouseUp}
                >
                  <span className={isFound ? 'font-bold' : 'text-gray-800'}>{cell}</span>
                </div>
              );
            }),
          )}
        </div>

        <div className="w-full max-w-4xl">
          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="text-green-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Palavras para Encontrar
                </div>
                <Badge
                  variant="secondary"
                  className={`${foundWords.length === words.length ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}
                >
                  {foundWords.length}/{words.length} encontradas
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {words.map((w, index) => {
                  const isFound = foundWords.some(fw => fw.word === w.word);
                  return (
                    <div
                      key={w.id}
                      className={`text-sm p-3 rounded-lg transition-all duration-200 text-center ${
                        isFound
                          ? 'bg-green-200 border border-green-400 text-green-800 shadow-md'
                          : 'bg-green-50 hover:bg-green-100 text-green-600'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold">{w.word}</span>
                        {isFound && (
                          <FileCheck className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {foundWords.length === words.length && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300">
                  <div className="flex items-center justify-center gap-2 text-green-800">
                    <FileCheck className="w-6 h-6" />
                    <span className="text-lg font-bold">Parabéns! Você encontrou todas as palavras! 🎉</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const exportToPDF = (withAnswers: boolean) => {
    if (!wordSearchGrid) {
      alert("Gere um caça-palavras primeiro");
      return;
    }

    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let currentY = 20;

    // Title
    const searchTitle = title || "Caça-Palavras";
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    const titleWidth = pdf.getTextWidth(searchTitle);
    pdf.text(searchTitle, (pageWidth - titleWidth) / 2, currentY);
    currentY += 15;

    // Header info if enabled
    if (showHeaderInfo) {
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");

      const underlineLength = 40;
      const spacing = 60;

      pdf.text("Nome:", 20, currentY);
      pdf.line(35, currentY + 1, 35 + underlineLength, currentY + 1);

      pdf.text("Turma:", 20 + spacing + underlineLength, currentY);
      pdf.line(
        35 + spacing + underlineLength + 15,
        currentY + 1,
        35 + spacing + underlineLength + 15 + 25,
        currentY + 1,
      );

      pdf.text("Data:", 20 + (spacing + underlineLength) * 1.7, currentY);
      pdf.line(
        35 + (spacing + underlineLength) * 1.7 + 15,
        currentY + 1,
        35 + (spacing + underlineLength) * 1.7 + 15 + 25,
        currentY + 1,
      );

      currentY += 15;
    }

    // Calculate grid size and position
    const maxGridWidth = pageWidth * 0.6;
    const maxGridHeight = pageHeight - currentY - 80; // Leave space for word list

    const cellSize = Math.min(
      maxGridWidth / wordSearchGrid.size.cols,
      maxGridHeight / wordSearchGrid.size.rows,
      8,
    );

    const finalCellSize = Math.max(cellSize, 4);
    const gridWidth = wordSearchGrid.size.cols * finalCellSize;
    const gridHeight = wordSearchGrid.size.rows * finalCellSize;
    const gridStartX = (pageWidth - gridWidth) / 2;
    const gridStartY = currentY + 10;

    // Draw the grid
    pdf.setLineWidth(0.3);
    pdf.setFontSize(Math.max(6, finalCellSize * 0.6));
    pdf.setFont("helvetica", "bold");

    for (let y = 0; y < wordSearchGrid.size.rows; y++) {
      for (let x = 0; x < wordSearchGrid.size.cols; x++) {
        const cellX = gridStartX + x * finalCellSize;
        const cellY = gridStartY + y * finalCellSize;

        pdf.rect(cellX, cellY, finalCellSize, finalCellSize);

        const letter = wordSearchGrid.grid[y][x];
        const textWidth = pdf.getTextWidth(letter);
        pdf.text(
          letter,
          cellX + (finalCellSize - textWidth) / 2,
          cellY + finalCellSize * 0.7,
        );

        // Highlight found words if showing answers
        if (withAnswers) {
          const isPartOfWord = wordSearchGrid.words.some((wordInfo) => {
            const solutionCells = getSolutionCells(wordInfo);
            return solutionCells.some(cell => cell.row === y && cell.col === x);
          });

          if (isPartOfWord) {
            pdf.setDrawColor(255, 0, 0);
            pdf.setLineWidth(1);
            pdf.rect(cellX, cellY, finalCellSize, finalCellSize);
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.3);
          }
        }
      }
    }

    // Add word list
    const wordsStartY = gridStartY + gridHeight + 20;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Encontre as palavras:", 20, wordsStartY);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const wordsPerColumn = Math.ceil(words.length / 3);
    const columnWidth = (pageWidth - 40) / 3;

    words.forEach((w, index) => {
      const column = Math.floor(index / wordsPerColumn);
      const row = index % wordsPerColumn;
      const x = 20 + column * columnWidth;
      const y = wordsStartY + 10 + row * 6;

      if (y < pageHeight - 10) {
        pdf.text(`• ${w.word}`, x, y);
      }
    });

    const filename = `${searchTitle.toLowerCase().replace(/\s+/g, "-")}-${withAnswers ? "gabarito" : "em-branco"}.pdf`;
    pdf.save(filename);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addWord();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-800 bg-clip-text text-transparent mb-4">
            Gerador de Caça-Palavras
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crie caça-palavras personalizados de forma fácil e rápida
          </p>
          <div className="flex justify-center mt-4">
            <Search className="w-6 h-6 text-emerald-500 animate-pulse" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Title and Header Info Section */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-green-50 hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Configurações do Caça-Palavras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Título do Caça-Palavras
                </Label>
                <Input
                  id="title"
                  placeholder="Digite o título do caça-palavras"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-2 border-green-200 focus:border-green-400 transition-colors duration-200"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="header-info"
                  checked={showHeaderInfo}
                  onCheckedChange={setShowHeaderInfo}
                  className="border-2 border-green-300"
                />
                <Label
                  htmlFor="header-info"
                  className="text-sm font-medium text-gray-700"
                >
                  Incluir campos para Nome, Turma e Data no PDF
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Mode Switch */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-emerald-50 hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-emerald-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isAIMode ? (
                    <Bot className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  {isAIMode ? "Modo IA" : "Modo Manual"}
                </div>
                <div className="flex items-center gap-3">
                  <Label
                    htmlFor="mode-switch"
                    className="text-sm font-medium text-gray-600"
                  >
                    {isAIMode ? "IA" : "Manual"}
                  </Label>
                  <Switch
                    id="mode-switch"
                    checked={isAIMode}
                    onCheckedChange={setIsAIMode}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isAIMode ? (
                // Manual Mode
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    ref={wordInputRef}
                    placeholder="Digite a palavra"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="uppercase border-2 border-emerald-200 focus:border-emerald-400 transition-colors duration-200"
                  />
                  <Button
                    onClick={addWord}
                    disabled={words.length >= 25}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar {words.length >= 25 ? "(Limite: 25)" : ""}
                  </Button>
                </div>
              ) : (
                // AI Mode
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="ai-theme"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Tema
                      </Label>
                      <Select value={aiTheme} onValueChange={setAiTheme}>
                        <SelectTrigger className="border-2 border-emerald-200 focus:border-emerald-400">
                          <SelectValue placeholder="Selecione o tema" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="animais">Animais</SelectItem>
                          <SelectItem value="ciencia">Ciência</SelectItem>
                          <SelectItem value="geografia">Geografia</SelectItem>
                          <SelectItem value="historia">História</SelectItem>
                          <SelectItem value="matematica">Matemática</SelectItem>
                          <SelectItem value="esportes">Esportes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="ai-difficulty"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Dificuldade
                      </Label>
                      <Select
                        value={aiDifficulty}
                        onValueChange={setAiDifficulty}
                      >
                        <SelectTrigger className="border-2 border-emerald-200 focus:border-emerald-400">
                          <SelectValue placeholder="Selecione a dificuldade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facil">Fácil</SelectItem>
                          <SelectItem value="medio">Médio</SelectItem>
                          <SelectItem value="dificil">Difícil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="ai-count"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Quantidade (5-25)
                      </Label>
                      <Input
                        id="ai-count"
                        type="number"
                        min="5"
                        max="25"
                        value={aiWordCount}
                        onChange={(e) =>
                          setAiWordCount(
                            Math.min(
                              25,
                              Math.max(5, parseInt(e.target.value) || 10),
                            ),
                          )
                        }
                        className="border-2 border-emerald-200 focus:border-emerald-400 transition-colors duration-200"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={generateAIWords}
                    disabled={!aiTheme || !aiDifficulty || isGenerating}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Gerando palavras...
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 mr-2" />
                        Gerar Palavras com IA
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Words List */}
          {words.length > 0 && (
            <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-yellow-50 hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-yellow-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`${words.length >= 25 ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800"}`}
                    >
                      {words.length}/25
                    </Badge>
                    Palavras Adicionadas
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllWords}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Limpar Todas
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {words.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex-1">
                        <Badge
                          variant="secondary"
                          className="bg-yellow-200 text-yellow-800 font-semibold"
                        >
                          {w.word}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeWord(w.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button
                    onClick={generateWordSearchGrid}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    disabled={words.length < 3}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Gerar Caça-Palavras
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Word Search Grid */}
          {wordSearchGrid && (
            <Card className="shadow-2xl border-0 bg-gradient-to-r from-white to-green-50 hover:shadow-3xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  {title || "Caça-Palavras Gerado"}
                </CardTitle>
              </CardHeader>
              <CardContent>{renderGrid()}</CardContent>
            </Card>
          )}

          {/* Export Buttons */}
          {wordSearchGrid && (
            <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-purple-50 hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-purple-700 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Exportar para PDF
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => exportToPDF(false)}
                    variant="outline"
                    className="flex items-center gap-2 border-2 border-green-300 hover:bg-green-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <FileText className="w-4 h-4" />
                    Caça-Palavras em Branco
                  </Button>
                  <Button
                    onClick={() => exportToPDF(true)}
                    variant="outline"
                    className="flex items-center gap-2 border-2 border-emerald-300 hover:bg-emerald-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <FileCheck className="w-4 h-4" />
                    Caça-Palavras com Respostas
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
