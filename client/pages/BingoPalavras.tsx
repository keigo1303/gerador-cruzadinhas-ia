import * as React from "react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Trash2,
  Download,
  FileText,
  Sparkles,
  Plus,
  X,
  ArrowLeft,
  Grid3x3,
  Bot,
  User,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { bingoDatabase } from "@shared/bingo-database";
import { Link } from "react-router-dom";

interface WordDefinition {
  id: string;
  word: string;
  definition: string;
}

interface BingoCard {
  id: string;
  grid: (string | null)[][];
  size: number;
}

export default function BingoPalavras() {
  const [word, setWord] = React.useState("");
  const [definition, setDefinition] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [wordDefinitions, setWordDefinitions] = React.useState<WordDefinition[]>([]);
  const [gridSize, setGridSize] = React.useState("4x4");
  const [cardCount, setCardCount] = React.useState(4);
  const [bingoCards, setBingoCards] = React.useState<BingoCard[]>([]);
  const [isAIMode, setIsAIMode] = React.useState(false);
  const [aiTheme, setAiTheme] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const wordInputRef = React.useRef<HTMLInputElement>(null);
  const cardsRef = React.useRef<HTMLDivElement>(null);

  // Calculate minimum words needed and grid dimensions
  const getGridInfo = () => {
    const size = parseInt(gridSize[0]);
    const totalCells = size * size;
    const minWords = totalCells * 2;
    return { size, totalCells, minWords };
  };

  const { size, totalCells, minWords } = getGridInfo();

  const addWordDefinition = () => {
    if (word.trim() && definition.trim()) {
      const newWordDefinition: WordDefinition = {
        id: Date.now().toString(),
        word: word.toUpperCase().trim(),
        definition: definition.trim(),
      };
      setWordDefinitions([...wordDefinitions, newWordDefinition]);
      setWord("");
      setDefinition("");
      setTimeout(() => wordInputRef.current?.focus(), 100);
    }
  };

  const removeWordDefinition = (id: string) => {
    setWordDefinitions(wordDefinitions.filter((wd) => wd.id !== id));
  };

  const clearAllWords = () => {
    setWordDefinitions([]);
    setBingoCards([]);
  };

  // AI word generation function
  const generateAIWords = () => {
    if (!aiTheme) {
      alert("Por favor, selecione um tema.");
      return;
    }

    setIsGenerating(true);

    // Simulate API delay
    setTimeout(() => {
      const themeKey = aiTheme.toLowerCase();

      if (bingoDatabase[themeKey] && bingoDatabase[themeKey].palavras) {
        const availableWords = bingoDatabase[themeKey].palavras;

        const newWordDefinitions: WordDefinition[] = availableWords.map((item, index) => ({
          id: `ai-${Date.now()}-${index}`,
          word: item.palavra,
          definition: item.definicao,
        }));

        setWordDefinitions(newWordDefinitions);
      } else {
        alert("Tema não encontrado no banco de dados.");
      }

      setIsGenerating(false);
    }, 2000); // 2 second delay to simulate API call
  };

  // Generate unique bingo cards
  const generateBingoCards = () => {
    if (wordDefinitions.length < minWords) {
      alert(`Adicione pelo menos ${minWords} palavras para gerar cartelas ${gridSize}`);
      return;
    }

    const cards: BingoCard[] = [];
    const words = wordDefinitions.map(wd => wd.word);

    for (let cardIndex = 0; cardIndex < cardCount; cardIndex++) {
      // Shuffle words and select subset for this card
      const shuffledWords = [...words].sort(() => Math.random() - 0.5);
      const selectedWords = shuffledWords.slice(0, totalCells);
      
      // Create grid
      const grid: (string | null)[][] = Array(size)
        .fill(null)
        .map(() => Array(size).fill(null));

      // Fill grid with selected words
      let wordIndex = 0;
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          grid[row][col] = selectedWords[wordIndex];
          wordIndex++;
        }
      }

      cards.push({
        id: `card-${cardIndex + 1}`,
        grid,
        size,
      });
    }

    setBingoCards(cards);

    // Scroll to cards
    setTimeout(() => {
      cardsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const renderCards = () => {
    if (bingoCards.length === 0) return null;

    return (
      <div className="grid gap-8">
        {bingoCards.map((card, index) => (
          <Card
            key={card.id}
            className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="text-purple-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5" />
                  Cartela {index + 1}
                </div>
                <Badge className="bg-purple-100 text-purple-700">
                  {gridSize}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Student name field */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Nome do aluno:
                </Label>
                <div className="h-8 border-b-2 border-gray-400"></div>
              </div>

              {/* Bingo grid */}
              <div
                className="grid gap-2 mx-auto w-fit p-4 bg-white border-2 border-purple-200 rounded-xl shadow-inner"
                style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
              >
                {card.grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="w-20 h-20 border-2 border-purple-300 flex items-center justify-center bg-purple-50 text-xs font-bold text-purple-800 p-1 text-center leading-tight"
                    >
                      {cell}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const exportToPDF = () => {
    if (bingoCards.length === 0) {
      alert("Gere cartelas primeiro");
      return;
    }

    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const cardsPerPage = 2;
    let currentPage = 0;

    for (let i = 0; i < bingoCards.length; i += cardsPerPage) {
      if (currentPage > 0) {
        pdf.addPage();
      }

      // Draw up to 2 cards per page
      for (let j = 0; j < cardsPerPage && i + j < bingoCards.length; j++) {
        const card = bingoCards[i + j];
        const cardY = j * (pageHeight / 2) + 20;

        // Title
        const bingoTitle = title || "Bingo de Palavras";
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        const titleWidth = pdf.getTextWidth(bingoTitle);
        pdf.text(bingoTitle, (pageWidth - titleWidth) / 2, cardY);

        // Card number
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Cartela ${i + j + 1}`, 20, cardY + 10);

        // Student name field
        pdf.text("Nome:", 20, cardY + 25);
        pdf.line(35, cardY + 26, pageWidth - 20, cardY + 26);

        // Calculate grid position and size
        const maxGridSize = 120; // max size in mm
        const cellSize = Math.min(maxGridSize / size, 15); // max 15mm per cell
        const gridWidth = size * cellSize;
        const gridHeight = size * cellSize;
        const gridStartX = (pageWidth - gridWidth) / 2;
        const gridStartY = cardY + 40;

        // Draw grid
        pdf.setLineWidth(0.5);
        pdf.setFontSize(Math.max(6, cellSize * 0.4));
        pdf.setFont("helvetica", "bold");

        for (let row = 0; row < size; row++) {
          for (let col = 0; col < size; col++) {
            const cellX = gridStartX + col * cellSize;
            const cellY = gridStartY + row * cellSize;
            const cellText = card.grid[row][col] || "";

            // Draw cell border
            pdf.rect(cellX, cellY, cellSize, cellSize);

            // Draw text
            if (cellText) {
              const lines = pdf.splitTextToSize(cellText, cellSize - 2);
              const lineHeight = Math.max(3, cellSize * 0.2);
              let textY = cellY + cellSize / 2 - (lines.length * lineHeight) / 2 + lineHeight;

              lines.forEach((line: string) => {
                const textWidth = pdf.getTextWidth(line);
                pdf.text(line, cellX + (cellSize - textWidth) / 2, textY);
                textY += lineHeight;
              });
            }
          }
        }
      }

      currentPage++;
    }

    // Add definitions page
    pdf.addPage();
    let currentY = 20;

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    const definitionsTitle = "Definições das Palavras";
    const defTitleWidth = pdf.getTextWidth(definitionsTitle);
    pdf.text(definitionsTitle, (pageWidth - defTitleWidth) / 2, currentY);
    currentY += 15;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    wordDefinitions.forEach((wd, index) => {
      if (currentY > pageHeight - 20) {
        pdf.addPage();
        currentY = 20;
      }

      const definitionText = `${wd.word}: ${wd.definition}`;
      const lines = pdf.splitTextToSize(definitionText, pageWidth - 40);
      
      pdf.setFont("helvetica", "bold");
      pdf.text(`${index + 1}.`, 20, currentY);
      
      pdf.setFont("helvetica", "normal");
      pdf.text(lines, 30, currentY);
      
      currentY += lines.length * 5 + 2;
    });

    const filename = `${(title || "bingo-palavras").toLowerCase().replace(/\s+/g, "-")}.pdf`;
    pdf.save(filename);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.currentTarget === wordInputRef.current) {
        // Move to definition field
        document.getElementById("definition-input")?.focus();
      } else {
        addWordDefinition();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
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

          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 bg-clip-text text-transparent mb-4">
            Gerador de Bingo de Palavras
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crie cartelas de bingo personalizadas com palavras e definições
          </p>
          <div className="flex justify-center mt-4">
            <Grid3x3 className="w-6 h-6 text-purple-500 animate-pulse" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Layout em duas colunas */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Coluna esquerda - Configurações */}
            <div className="space-y-6">
              {/* Title Section */}
              <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-purple-50 hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-purple-700 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Configurações do Bingo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label
                      htmlFor="title"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Título do Bingo
                    </Label>
                    <Input
                      id="title"
                      placeholder="Digite o título do bingo"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border-2 border-purple-200 focus:border-purple-400 transition-colors duration-200"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="grid-size"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Tamanho da Grade
                    </Label>
                    <Select value={gridSize} onValueChange={setGridSize}>
                      <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400">
                        <SelectValue placeholder="Selecione o tamanho" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4x4">4x4 (16 células)</SelectItem>
                        <SelectItem value="5x5">5x5 (25 células)</SelectItem>
                        <SelectItem value="6x6">6x6 (36 células)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Mínimo de {minWords} palavras necessárias
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="card-count"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Quantidade de Cartelas
                    </Label>
                    <Input
                      id="card-count"
                      type="number"
                      min="1"
                      max="20"
                      value={cardCount}
                      onChange={(e) =>
                        setCardCount(
                          Math.min(20, Math.max(1, parseInt(e.target.value) || 4))
                        )
                      }
                      className="border-2 border-purple-200 focus:border-purple-400 transition-colors duration-200"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Mode Switch */}
              <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-pink-50 hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-pink-700 flex items-center justify-between">
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
                        className="uppercase border-2 border-pink-200 focus:border-pink-400 transition-colors duration-200"
                      />
                      <Input
                        id="definition-input"
                        placeholder="Digite a definição"
                        value={definition}
                        onChange={(e) => setDefinition(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="border-2 border-pink-200 focus:border-pink-400 transition-colors duration-200"
                      />
                      <Button
                        onClick={addWordDefinition}
                        className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Palavra
                      </Button>
                    </div>
                  ) : (
                    // AI Mode
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="ai-theme"
                          className="text-sm font-medium text-gray-700 mb-2 block"
                        >
                          Tema
                        </Label>
                        <Select value={aiTheme} onValueChange={setAiTheme}>
                          <SelectTrigger className="border-2 border-pink-200 focus:border-pink-400">
                            <SelectValue placeholder="Selecione o tema" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gramatica-portuguesa">
                              Gramática Portuguesa
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={generateAIWords}
                        disabled={!aiTheme || isGenerating}
                        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                        className={`${
                          wordDefinitions.length >= minWords
                            ? "bg-green-200 text-green-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {wordDefinitions.length} palavra{wordDefinitions.length !== 1 ? 's' : ''}
                        {wordDefinitions.length >= minWords ? ' ✓' : ` (mín: ${minWords})`}
                      </Badge>
                      Palavras Adicionadas
                    </div>
                    {wordDefinitions.length > 0 && (
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
                  {wordDefinitions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <Grid3x3 className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-600 mb-2">Nenhuma palavra adicionada ainda</p>
                      <p className="text-sm text-gray-500">
                        Adicione no mínimo {minWords} palavras para gerar cartelas {gridSize}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                      {wordDefinitions.map((wd) => (
                        <div
                          key={wd.id}
                          className="flex items-start justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex-1 min-w-0">
                            <Badge
                              variant="secondary"
                              className="mb-2 bg-yellow-200 text-yellow-800 font-semibold"
                            >
                              {wd.word}
                            </Badge>
                            <p className="text-sm text-gray-700 break-words">
                              {wd.definition}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeWordDefinition(wd.id)}
                            className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-6">
                    <Button
                      onClick={generateBingoCards}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      disabled={wordDefinitions.length < minWords}
                    >
                      <Grid3x3 className="w-4 h-4 mr-2" />
                      Gerar Cartelas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bingo Cards */}
          {bingoCards.length > 0 && (
            <div ref={cardsRef} className="space-y-8">
              <Card className="shadow-2xl border-0 bg-gradient-to-r from-white to-purple-50 hover:shadow-3xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-purple-700 flex items-center gap-2">
                    <Grid3x3 className="w-5 h-5" />
                    Cartelas Geradas ({bingoCards.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderCards()}</CardContent>
              </Card>

              {/* Export Button */}
              <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-green-50 hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Exportar para PDF
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={exportToPDF}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Baixar Cartelas em PDF
                  </Button>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    2 cartelas por página + página com definições
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
