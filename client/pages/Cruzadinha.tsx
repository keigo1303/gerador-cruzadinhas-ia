import * as React from "react";
import clg from "crossword-layout-generator";
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
  ArrowLeft,
} from "lucide-react";
import { wordDatabase } from "@shared/word-database";
import { Link } from "react-router-dom";

interface WordClue {
  id: string;
  word: string;
  clue: string;
}

interface CrosswordWord {
  word: string;
  clue: string;
  x: number;
  y: number;
  vertical: boolean;
  number: number;
}

export default function Cruzadinha() {
  const [word, setWord] = React.useState("");
  const [clue, setClue] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [wordClues, setWordClues] = React.useState<WordClue[]>([]);
  const [crosswordGrid, setCrosswordGrid] = React.useState<CrosswordWord[]>([]);
  const [gridSize, setGridSize] = React.useState({ width: 0, height: 0 });
  const [showHeaderInfo, setShowHeaderInfo] = React.useState(false);
  const [isAIMode, setIsAIMode] = React.useState(false);
  const [aiTheme, setAiTheme] = React.useState("");
  const [aiDifficulty, setAiDifficulty] = React.useState("");
  const [aiWordCount, setAiWordCount] = React.useState(10);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const wordInputRef = React.useRef<HTMLInputElement>(null);

  const addWordClue = () => {
    if (word.trim() && clue.trim()) {
      if (wordClues.length >= 20) {
        alert("Limite máximo de 20 palavras por cruzadinha atingido.");
        return;
      }
      const newWordClue: WordClue = {
        id: Date.now().toString(),
        word: word.toUpperCase().trim(),
        clue: clue.trim(),
      };
      setWordClues([...wordClues, newWordClue]);
      setWord("");
      setClue("");
      setTimeout(() => wordInputRef.current?.focus(), 100);
    }
  };

  const removeWordClue = (id: string) => {
    setWordClues(wordClues.filter((wc) => wc.id !== id));
  };

  const clearAllWords = () => {
    setWordClues([]);
    setCrosswordGrid([]);
    setGridSize({ width: 0, height: 0 });
  };

  // AI word generation function
  const generateAIWords = () => {
    if (!aiTheme || !aiDifficulty) {
      alert("Por favor, informe o tema e a dificuldade.");
      return;
    }

    setIsGenerating(true);

    // Simulate API delay
    setTimeout(() => {
      const themeKey = aiTheme.toLowerCase();
      const difficultyKey = aiDifficulty.toLowerCase();

      if (wordDatabase[themeKey] && wordDatabase[themeKey][difficultyKey]) {
        const availableWords = wordDatabase[themeKey][difficultyKey];
        const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
        const selectedWords = shuffled.slice(0, aiWordCount);

        const newWordClues: WordClue[] = selectedWords.map((item, index) => ({
          id: `ai-${Date.now()}-${index}`,
          word: item.word,
          clue: item.clue,
        }));

        setWordClues(newWordClues);
      } else {
        // Fallback for themes not in database
        const fallbackWords: WordClue[] = [];
        for (let i = 0; i < aiWordCount; i++) {
          fallbackWords.push({
            id: `ai-fallback-${Date.now()}-${i}`,
            word: `PALAVRA${i + 1}`,
            clue: `Dica relacionada a ${aiTheme} - nível ${aiDifficulty}`,
          });
        }
        setWordClues(fallbackWords);
      }

      setIsGenerating(false);
    }, 2000); // 2 second delay to simulate API call
  };

  const generateCrossword = () => {
    if (wordClues.length < 2) {
      alert("Adicione pelo menos 2 palavras para gerar a cruzadinha");
      return;
    }

    try {
      // Convert to the format expected by the library
      const inputJson = wordClues.map((wc) => ({
        clue: wc.clue,
        answer: wc.word,
      }));

      const layout = clg.generateLayout(inputJson);

      if (layout && layout.result && layout.result.length > 0) {
        // Map the layout result to our CrosswordWord format
        const crosswordWords: CrosswordWord[] = layout.result.map(
          (item: any, index: number) => {
            const wordClue = wordClues.find((wc) => wc.word === item.answer);
            return {
              word: item.answer,
              clue: wordClue?.clue || "",
              x: item.startx,
              y: item.starty,
              vertical: item.orientation === "down",
              number: index + 1,
            };
          },
        );

        // Calculate grid dimensions
        let maxX = 0,
          maxY = 0;
        crosswordWords.forEach((cw) => {
          if (cw.vertical) {
            maxX = Math.max(maxX, cw.x);
            maxY = Math.max(maxY, cw.y + cw.word.length - 1);
          } else {
            maxX = Math.max(maxX, cw.x + cw.word.length - 1);
            maxY = Math.max(maxY, cw.y);
          }
        });

        setCrosswordGrid(crosswordWords);
        setGridSize({ width: maxX + 1, height: maxY + 1 });
      } else {
        alert(
          "Não foi possível gerar a cruzadinha com essas palavras. Tente palavras diferentes.",
        );
      }
    } catch (error) {
      console.error("Error generating crossword:", error);
      alert("Erro ao gerar a cruzadinha. Tente palavras diferentes.");
    }
  };

  const renderGrid = () => {
    if (crosswordGrid.length === 0) return null;

    const grid: (string | null)[][] = Array(gridSize.height)
      .fill(null)
      .map(() => Array(gridSize.width).fill(null));
    const numbers: (number | null)[][] = Array(gridSize.height)
      .fill(null)
      .map(() => Array(gridSize.width).fill(null));

    // Fill the grid with letters and numbers
    crosswordGrid.forEach((cw) => {
      numbers[cw.y][cw.x] = cw.number;

      for (let i = 0; i < cw.word.length; i++) {
        if (cw.vertical) {
          grid[cw.y + i][cw.x] = cw.word[i];
        } else {
          grid[cw.y][cw.x + i] = cw.word[i];
        }
      }
    });

    return (
      <div className="flex flex-col items-center gap-8">
        <div
          className="grid gap-1 p-6 bg-white border-2 border-blue-200 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl"
          style={{ gridTemplateColumns: `repeat(${gridSize.width}, 1fr)` }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`w-10 h-10 border-2 border-gray-300 flex items-center justify-center relative text-sm font-bold transition-all duration-200 hover:scale-105 ${
                  cell ? "bg-white shadow-sm" : "bg-gray-50"
                }`}
              >
                {numbers[y][x] && (
                  <span className="absolute top-0.5 left-0.5 text-xs text-blue-600 font-bold leading-none">
                    {numbers[y][x]}
                  </span>
                )}
                {cell && (
                  <span className="text-gray-800 font-semibold">{cell}</span>
                )}
              </div>
            )),
          )}
        </div>

        <div className="w-full max-w-4xl">
          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="text-purple-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Dicas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {[...crosswordGrid]
                  .sort((a, b) => a.number - b.number)
                  .map((cw, index) => (
                    <div
                      key={cw.number}
                      className="text-sm p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors duration-200"
                    >
                      <span className="font-bold text-purple-600 mr-2">
                        {index + 1}.
                      </span>
                      <span className="text-xs text-gray-500 mr-2">
                        {cw.vertical ? "↓" : "→"}
                      </span>
                      <span className="text-gray-700">{cw.clue}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const exportToPDF = (withAnswers: boolean) => {
    if (crosswordGrid.length === 0) {
      alert("Gere uma cruzadinha primeiro");
      return;
    }

    // Use landscape orientation and larger page size
    const pdf = new jsPDF("landscape", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let currentY = 20;

    // Title
    const crosswordTitle = title || "Cruzadinha";
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    const titleWidth = pdf.getTextWidth(crosswordTitle);
    pdf.text(crosswordTitle, (pageWidth - titleWidth) / 2, currentY);
    currentY += 15;

    // Header info if enabled - blank lines for student to fill
    if (showHeaderInfo) {
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");

      // Create underlines for students to fill in
      const underlineLength = 40; // length of underline in mm
      const spacing = 60; // spacing between fields

      // Nome field
      pdf.text("Nome:", 20, currentY);
      pdf.line(35, currentY + 1, 35 + underlineLength, currentY + 1); // underline

      // Turma field
      pdf.text("Turma:", 20 + spacing + underlineLength, currentY);
      pdf.line(
        35 + spacing + underlineLength + 15,
        currentY + 1,
        35 + spacing + underlineLength + 15 + 25,
        currentY + 1,
      ); // underline

      // Data field
      pdf.text("Data:", 20 + (spacing + underlineLength) * 1.7, currentY);
      pdf.line(
        35 + (spacing + underlineLength) * 1.7 + 15,
        currentY + 1,
        35 + (spacing + underlineLength) * 1.7 + 15 + 25,
        currentY + 1,
      ); // underline

      currentY += 15;
    }

    // Define maximum dimensions for crossword (left side of page)
    const leftColumnWidth = pageWidth * 0.55; // 55% of page width for crossword
    const rightColumnWidth = pageWidth * 0.4; // 40% for clues, 5% margin
    const maxGridWidth = leftColumnWidth - 40; // margins
    const maxGridHeight = pageHeight - currentY - 30; // available height

    // Limit grid size to reasonable dimensions
    const maxCellsWidth = Math.min(gridSize.width, 25);
    const maxCellsHeight = Math.min(gridSize.height, 20);

    // Calculate grid scaling with size constraints
    const cellSize = Math.min(
      maxGridWidth / maxCellsWidth,
      maxGridHeight / maxCellsHeight,
      12, // Maximum cell size
    );

    // Ensure minimum cell size for readability
    const finalCellSize = Math.max(cellSize, 6);

    const gridWidth = Math.min(gridSize.width, maxCellsWidth) * finalCellSize;
    const gridHeight =
      Math.min(gridSize.height, maxCellsHeight) * finalCellSize;
    const gridStartX = 20; // Left margin
    const gridStartY = currentY + 10;

    const grid: (string | null)[][] = Array(gridSize.height)
      .fill(null)
      .map(() => Array(gridSize.width).fill(null));
    const numbers: (number | null)[][] = Array(gridSize.height)
      .fill(null)
      .map(() => Array(gridSize.width).fill(null));

    crosswordGrid.forEach((cw) => {
      numbers[cw.y][cw.x] = cw.number;

      for (let i = 0; i < cw.word.length; i++) {
        if (cw.vertical) {
          grid[cw.y + i][cw.x] = cw.word[i];
        } else {
          grid[cw.y][cw.x + i] = cw.word[i];
        }
      }
    });

    // Draw the grid on the left side
    pdf.setLineWidth(0.5);
    for (let y = 0; y < Math.min(gridSize.height, maxCellsHeight); y++) {
      for (let x = 0; x < Math.min(gridSize.width, maxCellsWidth); x++) {
        const cell = grid[y] && grid[y][x];
        if (cell) {
          const cellX = gridStartX + x * finalCellSize;
          const cellY = gridStartY + y * finalCellSize;

          pdf.rect(cellX, cellY, finalCellSize, finalCellSize);

          if (numbers[y][x]) {
            pdf.setFontSize(Math.max(6, finalCellSize * 0.35));
            pdf.setFont("helvetica", "bold");
            pdf.text(
              numbers[y][x]!.toString(),
              cellX + 1,
              cellY + finalCellSize * 0.35,
            );
          }

          if (withAnswers && cell) {
            pdf.setFontSize(Math.max(7, finalCellSize * 0.55));
            pdf.setFont("helvetica", "normal");
            const textWidth = pdf.getTextWidth(cell);
            pdf.text(
              cell,
              cellX + (finalCellSize - textWidth) / 2,
              cellY + finalCellSize * 0.75,
            );
          }
        }
      }
    }

    // Add clues on the right side with sequential numbering
    const cluesStartX = gridStartX + leftColumnWidth;
    let cluesY = gridStartY;

    // Create a map of crossword numbers to sequential numbers
    const sortedCrosswordWords = [...crosswordGrid].sort(
      (a, b) => a.number - b.number,
    );
    const numberMap = new Map();
    sortedCrosswordWords.forEach((cw, index) => {
      numberMap.set(cw.number, index + 1);
    });

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Dicas:", cluesStartX, cluesY);
    cluesY += 12;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");

    // List all clues sequentially
    sortedCrosswordWords.forEach((cw, index) => {
      if (cluesY > pageHeight - 15) return; // Prevent overflow

      const sequentialNumber = index + 1;
      const direction = cw.vertical ? "↓" : "→";
      const clueText = `${sequentialNumber}. ${direction} ${cw.clue}`;

      // Split text if too long
      const maxWidth = rightColumnWidth - 10;
      const lines = pdf.splitTextToSize(clueText, maxWidth);

      pdf.text(lines, cluesStartX, cluesY);
      cluesY += lines.length * 4.5; // Spacing between lines
    });

    const filename = `${crosswordTitle.toLowerCase().replace(/\s+/g, "-")}-${withAnswers ? "gabarito" : "em-branco"}.pdf`;
    pdf.save(filename);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addWordClue();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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

          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Gerador de Cruzadinhas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crie cruzadinhas personalizadas de forma fácil e rápida
          </p>
          <div className="flex justify-center mt-4">
            <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Title and Header Info Section */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-blue-50 hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Configurações da Cruzadinha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Título da Cruzadinha
                </Label>
                <Input
                  id="title"
                  placeholder="Digite o título da cruzadinha"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-2 border-blue-200 focus:border-blue-400 transition-colors duration-200"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="header-info"
                  checked={showHeaderInfo}
                  onCheckedChange={setShowHeaderInfo}
                  className="border-2 border-blue-300"
                />
                <Label
                  htmlFor="header-info"
                  className="text-sm font-medium text-gray-700"
                >
                  Incluir campos para Nome, Turma e Data no PDF (linhas em
                  branco para o aluno preencher)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Mode Switch */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-indigo-50 hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-indigo-700 flex items-center justify-between">
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
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    ref={wordInputRef}
                    placeholder="Digite a palavra"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="uppercase border-2 border-green-200 focus:border-green-400 transition-colors duration-200"
                  />
                  <Input
                    placeholder="Digite a dica"
                    value={clue}
                    onChange={(e) => setClue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border-2 border-green-200 focus:border-green-400 transition-colors duration-200"
                  />
                  <Button
                    onClick={addWordClue}
                    disabled={wordClues.length >= 20}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar {wordClues.length >= 20 ? "(Limite: 20)" : ""}
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
                        <SelectTrigger className="border-2 border-indigo-200 focus:border-indigo-400">
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
                        <SelectTrigger className="border-2 border-indigo-200 focus:border-indigo-400">
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
                        className="border-2 border-indigo-200 focus:border-indigo-400 transition-colors duration-200"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={generateAIWords}
                    disabled={!aiTheme || !aiDifficulty || isGenerating}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
          {wordClues.length > 0 && (
            <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-yellow-50 hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-yellow-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`${wordClues.length >= 20 ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800"}`}
                    >
                      {wordClues.length}/20
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
                  {wordClues.map((wc) => (
                    <div
                      key={wc.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex-1">
                        <Badge
                          variant="secondary"
                          className="mr-3 bg-yellow-200 text-yellow-800 font-semibold"
                        >
                          {wc.word}
                        </Badge>
                        <span className="text-gray-700">{wc.clue}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeWordClue(wc.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button
                    onClick={generateCrossword}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    disabled={wordClues.length < 2}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Cruzadinha
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Crossword Grid */}
          {crosswordGrid.length > 0 && (
            <Card className="shadow-2xl border-0 bg-gradient-to-r from-white to-blue-50 hover:shadow-3xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {title || "Cruzadinha Gerada"}
                </CardTitle>
              </CardHeader>
              <CardContent>{renderGrid()}</CardContent>
            </Card>
          )}

          {/* Export Buttons */}
          {crosswordGrid.length > 0 && (
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
                    className="flex items-center gap-2 border-2 border-blue-300 hover:bg-blue-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <FileText className="w-4 h-4" />
                    Cruzadinha em Branco
                  </Button>
                  <Button
                    onClick={() => exportToPDF(true)}
                    variant="outline"
                    className="flex items-center gap-2 border-2 border-green-300 hover:bg-green-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <FileCheck className="w-4 h-4" />
                    Cruzadinha com Respostas
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
