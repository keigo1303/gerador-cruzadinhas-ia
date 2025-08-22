import * as React from "react";
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

interface WordPosition {
  word: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  direction: "horizontal" | "vertical" | "diagonal-down" | "diagonal-up";
  cells: Array<{ row: number; col: number; letter: string }>;
}

interface WordSearchResult {
  grid: string[][];
  solutions: WordPosition[];
  size: {
    rows: number;
    cols: number;
  };
  placedWords: string[];
  unplacedWords: string[];
}

// Directions for word placement
const DIRECTIONS = [
  { name: "horizontal", dr: 0, dc: 1 }, // →
  { name: "vertical", dr: 1, dc: 0 }, // ↓
  { name: "diagonal-down", dr: 1, dc: 1 }, // ↘
  { name: "diagonal-up", dr: -1, dc: 1 }, // ↗
] as const;

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
  const [directionMode, setDirectionMode] = React.useState("horizontal-vertical");
  const [allowMirrored, setAllowMirrored] = React.useState(false);
  const wordInputRef = React.useRef<HTMLInputElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const addWord = () => {
    if (word.trim()) {
      if (words.length >= 20) {
        alert("Limite máximo de 20 palavras por caça-palavras atingido.");
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

  // Enhanced word search generator with precise positioning
  const generateEnhancedWordSearch = (
    wordList: string[],
  ): WordSearchResult | null => {
    if (wordList.length === 0) return null;

    // Filter directions based on selected mode
    const availableDirections = directionMode === "horizontal-vertical"
      ? DIRECTIONS.filter(d => d.name === "horizontal" || d.name === "vertical")
      : DIRECTIONS; // all-directions includes diagonal

    // Calculate optimal grid size
    const longestWord = Math.max(...wordList.map((w) => w.length));
    const wordCount = wordList.length;
    const baseSize = Math.max(15, longestWord + 3);
    const gridSize = Math.min(
      30,
      baseSize + Math.ceil(Math.sqrt(wordCount)) * 2,
    );

    console.log(
      `Generating ${gridSize}x${gridSize} grid for ${wordCount} words`,
    );

    // Initialize empty grid
    const grid: string[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(""));

    const solutions: WordPosition[] = [];
    const placedWords: string[] = [];
    const unplacedWords: string[] = [];

    // Sort words by length (longest first) for better placement
    const sortedWords = [...wordList].sort((a, b) => b.length - a.length);

    // Try to place each word
    for (const word of sortedWords) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 1000;

      while (!placed && attempts < maxAttempts) {
        // Random starting position
        const startRow = Math.floor(Math.random() * gridSize);
        const startCol = Math.floor(Math.random() * gridSize);

        // Random direction from available directions
        const direction =
          availableDirections[Math.floor(Math.random() * availableDirections.length)];

        // Decide whether to use normal or reversed word (if mirroring is allowed)
        const useReversed = allowMirrored && Math.random() < 0.5; // 50% chance to reverse if allowed
        const wordToUse = useReversed ? word.split('').reverse().join('') : word;

        if (canPlaceWord(grid, wordToUse, startRow, startCol, direction, gridSize)) {
          const wordPosition = placeWord(
            grid,
            wordToUse,
            startRow,
            startCol,
            direction,
          );
          solutions.push(wordPosition);
          placedWords.push(word); // Always store original word
          placed = true;
          console.log(
            `Placed "${wordToUse}"${useReversed ? ' (reversed)' : ''} at (${startRow},${startCol}) direction: ${direction.name}`,
          );
        }

        attempts++;
      }

      if (!placed) {
        console.warn(
          `Could not place word: ${word} after ${maxAttempts} attempts`,
        );
        unplacedWords.push(word);
      }
    }

    // Fill empty cells with random letters
    fillEmptyCells(grid, gridSize);

    console.log(
      `Successfully placed ${placedWords.length}/${wordList.length} words`,
    );

    return {
      grid,
      solutions,
      size: { rows: gridSize, cols: gridSize },
      placedWords,
      unplacedWords,
    };
  };

  // Check if a word can be placed at the given position and direction
  const canPlaceWord = (
    grid: string[][],
    word: string,
    startRow: number,
    startCol: number,
    direction: (typeof DIRECTIONS)[number],
    gridSize: number,
  ): boolean => {
    for (let i = 0; i < word.length; i++) {
      const row = startRow + direction.dr * i;
      const col = startCol + direction.dc * i;

      // Check bounds
      if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
        return false;
      }

      // Check if cell is empty or contains the same letter
      const currentCell = grid[row][col];
      if (currentCell !== "" && currentCell !== word[i]) {
        return false;
      }
    }
    return true;
  };

  // Place a word in the grid and return position information
  const placeWord = (
    grid: string[][],
    word: string,
    startRow: number,
    startCol: number,
    direction: (typeof DIRECTIONS)[number],
  ): WordPosition => {
    const cells: Array<{ row: number; col: number; letter: string }> = [];

    for (let i = 0; i < word.length; i++) {
      const row = startRow + direction.dr * i;
      const col = startCol + direction.dc * i;
      grid[row][col] = word[i];
      cells.push({ row, col, letter: word[i] });
    }

    const endRow = startRow + direction.dr * (word.length - 1);
    const endCol = startCol + direction.dc * (word.length - 1);

    return {
      word,
      startRow,
      startCol,
      endRow,
      endCol,
      direction: direction.name as WordPosition["direction"],
      cells,
    };
  };

  // Fill empty cells with random letters
  const fillEmptyCells = (grid: string[][], gridSize: number) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col] === "") {
          grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  };

  const generateWordSearchGrid = () => {
    if (words.length < 5) {
      alert("Adicione pelo menos 5 palavras para gerar o caça-palavras");
      return;
    }

    const wordList = words.map((w) => w.word);
    console.log("Generating word search with words:", wordList);

    const result = generateEnhancedWordSearch(wordList);

    if (result) {
      setWordSearchGrid(result);

      // Scroll automático para mostrar a atividade gerada
      setTimeout(() => {
        gridRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

      if (result.unplacedWords.length > 0) {
        alert(
          `Aviso: ${result.unplacedWords.length} palavra(s) não puderam ser colocadas na grade: ${result.unplacedWords.join(", ")}. ` +
            "Tente usar palavras menores ou reduza a quantidade de palavras.",
        );
      }
    } else {
      alert("Erro ao gerar o caça-palavras. Tente com palavras diferentes.");
    }
  };

  // Array de cores vibrantes para destacar cada palavra
  const colors = [
    { bg: "bg-red-200", text: "text-red-800", name: "Vermelho" },
    { bg: "bg-blue-200", text: "text-blue-800", name: "Azul" },
    { bg: "bg-green-200", text: "text-green-800", name: "Verde" },
    { bg: "bg-yellow-200", text: "text-yellow-800", name: "Amarelo" },
    { bg: "bg-purple-200", text: "text-purple-800", name: "Roxo" },
    { bg: "bg-pink-200", text: "text-pink-800", name: "Rosa" },
    { bg: "bg-indigo-200", text: "text-indigo-800", name: "Índigo" },
    { bg: "bg-orange-200", text: "text-orange-800", name: "Laranja" },
    { bg: "bg-teal-200", text: "text-teal-800", name: "Verde-água" },
    { bg: "bg-cyan-200", text: "text-cyan-800", name: "Ciano" },
    { bg: "bg-lime-200", text: "text-lime-800", name: "Lima" },
    { bg: "bg-emerald-200", text: "text-emerald-800", name: "Esmeralda" },
    { bg: "bg-rose-200", text: "text-rose-800", name: "Rosa-escuro" },
    { bg: "bg-violet-200", text: "text-violet-800", name: "Violeta" },
    { bg: "bg-sky-200", text: "text-sky-800", name: "Céu" },
    { bg: "bg-amber-200", text: "text-amber-800", name: "Âmbar" },
    { bg: "bg-fuchsia-200", text: "text-fuchsia-800", name: "Fúcsia" },
    { bg: "bg-slate-200", text: "text-slate-800", name: "Ardósia" },
    { bg: "bg-zinc-200", text: "text-zinc-800", name: "Zinco" },
    { bg: "bg-neutral-200", text: "text-neutral-800", name: "Neutro" },
  ];

  const renderGrid = () => {
    if (!wordSearchGrid) return null;

    // Criar mapa de células para palavras com suas cores
    const cellColorMap = new Map<
      string,
      { colorIndex: number; word: string }
    >();

    wordSearchGrid.solutions.forEach((solution, index) => {
      const colorIndex = index % colors.length;
      solution.cells.forEach((cell) => {
        const key = `${cell.row}-${cell.col}`;
        cellColorMap.set(key, { colorIndex, word: solution.word });
      });
    });

    return (
      <div className="flex flex-col items-center gap-8">
        <div
          className="grid gap-1 p-6 bg-white border-2 border-green-200 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl"
          style={{
            gridTemplateColumns: `repeat(${wordSearchGrid.size.cols}, 1fr)`,
          }}
        >
          {wordSearchGrid.grid.map((row, y) =>
            row.map((cell, x) => {
              const cellKey = `${y}-${x}`;
              const cellInfo = cellColorMap.get(cellKey);
              const isHighlighted = cellInfo !== undefined;
              const color = isHighlighted ? colors[cellInfo.colorIndex] : null;

              return (
                <div
                  key={`${x}-${y}`}
                  className={`w-8 h-8 border border-gray-300 flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                    isHighlighted
                      ? `${color?.bg} ${color?.text} border-2 border-gray-400 shadow-sm scale-105`
                      : "bg-white text-gray-800 hover:bg-gray-50"
                  }`}
                  title={
                    isHighlighted ? `Palavra: ${cellInfo.word}` : undefined
                  }
                >
                  <span className="font-extrabold">{cell}</span>
                </div>
              );
            }),
          )}
        </div>

        {/* Legenda de cores */}
        <div className="w-full max-w-4xl">
          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="text-green-700 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Palavras Encontradas com Cores
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wordSearchGrid.solutions.map((solution, index) => {
                  const colorIndex = index % colors.length;
                  const color = colors[colorIndex];

                  return (
                    <div
                      key={`${solution.word}-${index}`}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 ${color.bg} border-gray-300 shadow-sm hover:shadow-md transition-all duration-200`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${color.bg} border-2 border-gray-400 flex items-center justify-center`}
                      >
                        <span className="text-xs font-bold text-gray-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <span className={`font-bold text-base ${color.text}`}>
                          {solution.word}
                        </span>
                        <div className="text-xs text-gray-600 mt-1">
                          {solution.direction} • ({solution.startRow + 1},
                          {solution.startCol + 1}) → ({solution.endRow + 1},
                          {solution.endCol + 1})
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {wordSearchGrid.unplacedWords.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>Palavras não colocadas:</strong>{" "}
                    {wordSearchGrid.unplacedWords.join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Cores RGB para PDF (equivalentes às cores Tailwind usadas na grade)
  const pdfColors = [
    { r: 254, g: 202, b: 202 }, // red-200
    { r: 191, g: 219, b: 254 }, // blue-200
    { r: 187, g: 247, b: 208 }, // green-200
    { r: 254, g: 240, b: 138 }, // yellow-200
    { r: 221, g: 214, b: 254 }, // purple-200
    { r: 251, g: 207, b: 232 }, // pink-200
    { r: 199, g: 210, b: 254 }, // indigo-200
    { r: 254, g: 215, b: 170 }, // orange-200
    { r: 153, g: 246, b: 228 }, // teal-200
    { r: 165, g: 243, b: 252 }, // cyan-200
    { r: 217, g: 249, b: 157 }, // lime-200
    { r: 167, g: 243, b: 208 }, // emerald-200
    { r: 254, g: 205, b: 211 }, // rose-200
    { r: 196, g: 181, b: 253 }, // violet-200
    { r: 186, g: 230, b: 253 }, // sky-200
    { r: 253, g: 230, b: 138 }, // amber-200
    { r: 245, g: 208, b: 254 }, // fuchsia-200
    { r: 226, g: 232, b: 240 }, // slate-200
    { r: 228, g: 228, b: 231 }, // zinc-200
    { r: 229, g: 229, b: 229 }, // neutral-200
  ];

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

      // Calcular espaçamento baseado na largura da página
      const margin = 20;
      const availableWidth = pageWidth - margin * 2; // Largura disponível
      const fieldSpacing = 8; // Espaçamento entre campos

      // Larguras dos textos dos labels
      const nomeTextWidth = pdf.getTextWidth("Nome:");
      const turmaTextWidth = pdf.getTextWidth("Turma:");
      const dataTextWidth = pdf.getTextWidth("Data:");

      // Calcular largura disponível para as linhas dividida proporcionalmente
      const totalLabelWidth =
        nomeTextWidth + turmaTextWidth + dataTextWidth + fieldSpacing * 6;
      const lineWidth = (availableWidth - totalLabelWidth) / 3;

      // Posições dos campos
      let currentX = margin;

      // Campo Nome
      pdf.text("Nome:", currentX, currentY);
      currentX += nomeTextWidth + fieldSpacing;
      pdf.line(currentX, currentY + 1, currentX + lineWidth, currentY + 1);
      currentX += lineWidth + fieldSpacing;

      // Campo Turma
      pdf.text("Turma:", currentX, currentY);
      currentX += turmaTextWidth + fieldSpacing;
      pdf.line(currentX, currentY + 1, currentX + lineWidth, currentY + 1);
      currentX += lineWidth + fieldSpacing;

      // Campo Data (verificar se cabe na página)
      if (
        currentX + dataTextWidth + fieldSpacing + lineWidth <=
        pageWidth - margin
      ) {
        pdf.text("Data:", currentX, currentY);
        currentX += dataTextWidth + fieldSpacing;
        pdf.line(currentX, currentY + 1, currentX + lineWidth, currentY + 1);
      } else {
        // Se não cabe, colocar em uma nova linha
        currentY += 8;
        currentX = margin;
        pdf.text("Data:", currentX, currentY);
        currentX += dataTextWidth + fieldSpacing;
        pdf.line(
          currentX,
          currentY + 1,
          currentX + lineWidth * 1.5,
          currentY + 1,
        );
      }

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

    // Create mapping of cells to word colors
    const cellColorMap = new Map<string, number>();
    if (withAnswers) {
      wordSearchGrid.solutions.forEach((solution, solutionIndex) => {
        const colorIndex = solutionIndex % pdfColors.length;
        solution.cells.forEach((cell) => {
          cellColorMap.set(`${cell.row}-${cell.col}`, colorIndex);
        });
      });
    }

    // Draw the grid
    pdf.setLineWidth(0.3);
    pdf.setFontSize(Math.max(6, finalCellSize * 0.6));
    pdf.setFont("helvetica", "bold");

    for (let y = 0; y < wordSearchGrid.size.rows; y++) {
      for (let x = 0; x < wordSearchGrid.size.cols; x++) {
        const cellX = gridStartX + x * finalCellSize;
        const cellY = gridStartY + y * finalCellSize;

        // Check if cell is part of a solution and get its color
        const cellKey = `${y}-${x}`;
        const colorIndex = cellColorMap.get(cellKey);
        const isHighlighted = colorIndex !== undefined;

        // Draw cell border
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.3);
        pdf.rect(cellX, cellY, finalCellSize, finalCellSize);

        // Highlight cell with word-specific color if it's part of a solution
        if (withAnswers && isHighlighted) {
          const color = pdfColors[colorIndex];
          pdf.setFillColor(color.r, color.g, color.b);
          pdf.rect(cellX, cellY, finalCellSize, finalCellSize, "F");
          pdf.setDrawColor(100, 100, 100); // Darker border for highlighted cells
          pdf.setLineWidth(0.5);
          pdf.rect(cellX, cellY, finalCellSize, finalCellSize); // Redraw border
          pdf.setDrawColor(0, 0, 0); // Reset border color
          pdf.setLineWidth(0.3);
        }

        // Draw letter
        const letter = wordSearchGrid.grid[y][x];
        const textWidth = pdf.getTextWidth(letter);
        pdf.setTextColor(0, 0, 0);
        pdf.text(
          letter,
          cellX + (finalCellSize - textWidth) / 2,
          cellY + finalCellSize * 0.7,
        );
      }
    }

    // Add word list with colors if showing answers
    const wordsStartY = gridStartY + gridHeight + 20;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Encontre as palavras:", 20, wordsStartY);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    if (withAnswers) {
      // Show words with their corresponding colors
      const wordsPerColumn = Math.ceil(wordSearchGrid.solutions.length / 3);
      const columnWidth = (pageWidth - 40) / 3;

      wordSearchGrid.solutions.forEach((solution, index) => {
        const colorIndex = index % pdfColors.length;
        const color = pdfColors[colorIndex];
        const column = Math.floor(index / wordsPerColumn);
        const row = index % wordsPerColumn;
        const x = 20 + column * columnWidth;
        const y = wordsStartY + 10 + row * 8;

        if (y < pageHeight - 10) {
          // Draw colored square indicator
          pdf.setFillColor(color.r, color.g, color.b);
          pdf.setDrawColor(100, 100, 100);
          pdf.rect(x, y - 3, 3, 3, "FD");

          // Draw word
          pdf.setTextColor(0, 0, 0);
          pdf.text(`${solution.word}`, x + 5, y);
        }
      });
    } else {
      // Show words without colors (original layout)
      const wordsToShow = wordSearchGrid.placedWords;
      const wordsPerColumn = Math.ceil(wordsToShow.length / 3);
      const columnWidth = (pageWidth - 40) / 3;

      wordsToShow.forEach((word, index) => {
        const column = Math.floor(index / wordsPerColumn);
        const row = index % wordsPerColumn;
        const x = 20 + column * columnWidth;
        const y = wordsStartY + 10 + row * 6;

        if (y < pageHeight - 10) {
          pdf.text(`• ${word}`, x, y);
        }
      });
    }

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
            Crie caça-palavras personalizados com posicionamento preciso das
            respostas
          </p>
          <div className="flex justify-center mt-4">
            <Search className="w-6 h-6 text-emerald-500 animate-pulse" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Layout em duas colunas */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Coluna esquerda - Configurações */}
            <div className="space-y-6">
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

                  <div>
                    <Label
                      htmlFor="direction-mode"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Direções das Palavras
                    </Label>
                    <Select value={directionMode} onValueChange={setDirectionMode}>
                      <SelectTrigger className="border-2 border-green-200 focus:border-green-400">
                        <SelectValue placeholder="Selecione as direções" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="horizontal-vertical">
                          Horizontal e Vertical
                        </SelectItem>
                        <SelectItem value="all-directions">
                          Horizontal, Vertical e Diagonal
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allow-mirrored"
                      checked={allowMirrored}
                      onCheckedChange={setAllowMirrored}
                      className="border-2 border-green-300"
                    />
                    <Label
                      htmlFor="allow-mirrored"
                      className="text-sm font-medium text-gray-700"
                    >
                      Permitir palavras espelhadas (de trás para frente)
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
                    <div className="space-y-4">
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
                        disabled={words.length >= 20}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar {words.length >= 20 ? "(Limite: 20)" : ""}
                      </Button>
                    </div>
                  ) : (
                    // AI Mode
                    <div className="space-y-4">
                      <div className="space-y-4">
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
                              <SelectItem value="geografia">
                                Geografia
                              </SelectItem>
                              <SelectItem value="historia">História</SelectItem>
                              <SelectItem value="matematica">
                                Matemática
                              </SelectItem>
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
                            Quantidade (5-20)
                          </Label>
                          <Input
                            id="ai-count"
                            type="number"
                            min="5"
                            max="20"
                            value={aiWordCount}
                            onChange={(e) =>
                              setAiWordCount(
                                Math.min(
                                  20,
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
            </div>

            {/* Coluna direita - Lista de palavras */}
            <div>
              <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-yellow-50 hover:shadow-2xl transition-shadow duration-300 h-fit">
                <CardHeader>
                  <CardTitle className="text-yellow-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`${words.length >= 20 ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800"}`}
                      >
                        {words.length}/20
                      </Badge>
                      Palavras Adicionadas
                    </div>
                    {words.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllWords}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Limpar Todas
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {words.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <Search className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-600 mb-2">Nenhuma palavra adicionada ainda</p>
                      <p className="text-sm text-gray-500">Adicione no mínimo 5 palavras para gerar o caça-palavras</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
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
                  )}
                  <div className="mt-6">
                    <Button
                      onClick={generateWordSearchGrid}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      disabled={words.length < 5}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Gerar Caça-Palavras
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Word Search Grid */}
          {wordSearchGrid && (
            <Card
              ref={gridRef}
              className="shadow-2xl border-0 bg-gradient-to-r from-white to-green-50 hover:shadow-3xl transition-shadow duration-300"
            >
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
