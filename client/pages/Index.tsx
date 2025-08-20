import React, { useState } from 'react';
import clg from 'crossword-layout-generator';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Trash2, Download, FileText, FileCheck, Sparkles, Plus } from 'lucide-react';

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

// Header info is now just a boolean to control PDF display

export default function Index() {
  const [word, setWord] = useState('');
  const [clue, setClue] = useState('');
  const [title, setTitle] = useState('');
  const [wordClues, setWordClues] = useState<WordClue[]>([]);
  const [crosswordGrid, setCrosswordGrid] = useState<CrosswordWord[]>([]);
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 });
  const [showHeaderInfo, setShowHeaderInfo] = useState(false);

  const addWordClue = () => {
    if (word.trim() && clue.trim()) {
      const newWordClue: WordClue = {
        id: Date.now().toString(),
        word: word.toUpperCase().trim(),
        clue: clue.trim()
      };
      setWordClues([...wordClues, newWordClue]);
      setWord('');
      setClue('');
    }
  };

  const removeWordClue = (id: string) => {
    setWordClues(wordClues.filter(wc => wc.id !== id));
  };

  const generateCrossword = () => {
    if (wordClues.length < 2) {
      alert('Adicione pelo menos 2 palavras para gerar a cruzadinha');
      return;
    }

    try {
      // Convert to the format expected by the library
      const inputJson = wordClues.map(wc => ({
        clue: wc.clue,
        answer: wc.word
      }));

      const layout = clg.generateLayout(inputJson);

      if (layout && layout.result && layout.result.length > 0) {
        // Map the layout result to our CrosswordWord format
        const crosswordWords: CrosswordWord[] = layout.result.map((item: any, index: number) => {
          const wordClue = wordClues.find(wc => wc.word === item.answer);
          return {
            word: item.answer,
            clue: wordClue?.clue || '',
            x: item.startx,
            y: item.starty,
            vertical: item.orientation === 'down',
            number: index + 1
          };
        });

        // Calculate grid dimensions
        let maxX = 0, maxY = 0;
        crosswordWords.forEach(cw => {
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
        alert('Não foi possível gerar a cruzadinha com essas palavras. Tente palavras diferentes.');
      }
    } catch (error) {
      console.error('Error generating crossword:', error);
      alert('Erro ao gerar a cruzadinha. Tente palavras diferentes.');
    }
  };

  const renderGrid = () => {
    if (crosswordGrid.length === 0) return null;

    const grid: (string | null)[][] = Array(gridSize.height).fill(null).map(() => Array(gridSize.width).fill(null));
    const numbers: (number | null)[][] = Array(gridSize.height).fill(null).map(() => Array(gridSize.width).fill(null));

    // Fill the grid with letters and numbers
    crosswordGrid.forEach(cw => {
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
      <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
        <div className="grid gap-1 p-6 bg-white border-2 border-blue-200 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl" 
             style={{ gridTemplateColumns: `repeat(${gridSize.width}, 1fr)` }}>
          {grid.map((row, y) => 
            row.map((cell, x) => (
              <div 
                key={`${x}-${y}`}
                className={`w-10 h-10 border-2 border-gray-300 flex items-center justify-center relative text-sm font-bold transition-all duration-200 hover:scale-105 ${
                  cell ? 'bg-white shadow-sm' : 'bg-gray-50'
                }`}
              >
                {numbers[y][x] && (
                  <span className="absolute top-0.5 left-0.5 text-xs text-blue-600 font-bold leading-none">
                    {numbers[y][x]}
                  </span>
                )}
                {cell && <span className="text-gray-800 font-semibold">{cell}</span>}
              </div>
            ))
          )}
        </div>

        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Horizontais
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {crosswordGrid.filter(cw => !cw.vertical).map(cw => (
                  <div key={cw.number} className="text-sm p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
                    <span className="font-bold text-blue-600 mr-2">{cw.number}.</span> 
                    <span className="text-gray-700">{cw.clue}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="text-green-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Verticais
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {crosswordGrid.filter(cw => cw.vertical).map(cw => (
                  <div key={cw.number} className="text-sm p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200">
                    <span className="font-bold text-green-600 mr-2">{cw.number}.</span> 
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
      alert('Gere uma cruzadinha primeiro');
      return;
    }

    // Use landscape orientation and larger page size
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    let currentY = 20;
    
    // Title
    const crosswordTitle = title || 'Cruzadinha';
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    const titleWidth = pdf.getTextWidth(crosswordTitle);
    pdf.text(crosswordTitle, (pageWidth - titleWidth) / 2, currentY);
    currentY += 15;

    // Header info if enabled
    if (showHeaderInfo) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const headerText = `Nome: ${headerInfo.name || '_'.repeat(30)}    Turma: ${headerInfo.turma || '_'.repeat(15)}    Data: ${headerInfo.date || '_'.repeat(15)}`;
      pdf.text(headerText, 20, currentY);
      currentY += 15;
    }

    // Calculate grid scaling
    const cellSize = Math.min(
      (pageWidth - 40) / gridSize.width,
      (pageHeight - currentY - 100) / gridSize.height,
      12 // Maximum cell size
    );
    
    const gridWidth = gridSize.width * cellSize;
    const gridHeight = gridSize.height * cellSize;
    const startX = (pageWidth - gridWidth) / 2;
    const startY = currentY + 10;

    const grid: (string | null)[][] = Array(gridSize.height).fill(null).map(() => Array(gridSize.width).fill(null));
    const numbers: (number | null)[][] = Array(gridSize.height).fill(null).map(() => Array(gridSize.width).fill(null));

    crosswordGrid.forEach(cw => {
      numbers[cw.y][cw.x] = cw.number;
      
      for (let i = 0; i < cw.word.length; i++) {
        if (cw.vertical) {
          grid[cw.y + i][cw.x] = cw.word[i];
        } else {
          grid[cw.y][cw.x + i] = cw.word[i];
        }
      }
    });

    // Draw the grid
    pdf.setLineWidth(0.5);
    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        const cell = grid[y][x];
        if (cell) {
          const cellX = startX + x * cellSize;
          const cellY = startY + y * cellSize;
          
          pdf.rect(cellX, cellY, cellSize, cellSize);
          
          if (numbers[y][x]) {
            pdf.setFontSize(Math.max(6, cellSize * 0.3));
            pdf.setFont('helvetica', 'bold');
            pdf.text(numbers[y][x]!.toString(), cellX + 1, cellY + cellSize * 0.3);
          }
          
          if (withAnswers && cell) {
            pdf.setFontSize(Math.max(8, cellSize * 0.6));
            pdf.setFont('helvetica', 'normal');
            const textWidth = pdf.getTextWidth(cell);
            pdf.text(cell, cellX + (cellSize - textWidth) / 2, cellY + cellSize * 0.7);
          }
        }
      }
    }

    // Add clues below the grid
    currentY = startY + gridHeight + 20;
    
    // Split clues into two columns
    const horizontals = crosswordGrid.filter(cw => !cw.vertical);
    const verticals = crosswordGrid.filter(cw => cw.vertical);
    
    const columnWidth = (pageWidth - 60) / 2;
    
    // Horizontals column
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Horizontais:', 20, currentY);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    let horizontalY = currentY + 8;
    
    horizontals.forEach(cw => {
      if (horizontalY > pageHeight - 20) return; // Prevent overflow
      const clueText = `${cw.number}. ${cw.clue}`;
      const lines = pdf.splitTextToSize(clueText, columnWidth);
      pdf.text(lines, 20, horizontalY);
      horizontalY += lines.length * 5;
    });
    
    // Verticals column
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Verticais:', 20 + columnWidth + 20, currentY);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    let verticalY = currentY + 8;
    
    verticals.forEach(cw => {
      if (verticalY > pageHeight - 20) return; // Prevent overflow
      const clueText = `${cw.number}. ${cw.clue}`;
      const lines = pdf.splitTextToSize(clueText, columnWidth);
      pdf.text(lines, 20 + columnWidth + 20, verticalY);
      verticalY += lines.length * 5;
    });

    const filename = `${crosswordTitle.toLowerCase().replace(/\s+/g, '-')}-${withAnswers ? 'gabarito' : 'em-branco'}.pdf`;
    pdf.save(filename);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addWordClue();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-in slide-in-from-top duration-700">
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
          <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-blue-50 hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Configurações da Cruzadinha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
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
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="header-info" 
                    checked={showHeaderInfo}
                    onCheckedChange={setShowHeaderInfo}
                    className="border-2 border-blue-300"
                  />
                  <Label htmlFor="header-info" className="text-sm font-medium text-gray-700">
                    Incluir campos para Nome, Turma e Data no cabeçalho
                  </Label>
                </div>
                
                {showHeaderInfo && (
                  <div className="grid md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-in slide-in-from-top duration-300">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1 block">
                        Nome
                      </Label>
                      <Input
                        id="name"
                        placeholder="Nome do aluno"
                        value={headerInfo.name}
                        onChange={(e) => setHeaderInfo({...headerInfo, name: e.target.value})}
                        className="border-blue-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="turma" className="text-sm font-medium text-gray-700 mb-1 block">
                        Turma
                      </Label>
                      <Input
                        id="turma"
                        placeholder="Turma"
                        value={headerInfo.turma}
                        onChange={(e) => setHeaderInfo({...headerInfo, turma: e.target.value})}
                        className="border-blue-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date" className="text-sm font-medium text-gray-700 mb-1 block">
                        Data
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={headerInfo.date}
                        onChange={(e) => setHeaderInfo({...headerInfo, date: e.target.value})}
                        className="border-blue-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Section */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-green-50 hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Adicionar Palavra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
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
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Words List */}
          {wordClues.length > 0 && (
            <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-yellow-50 hover:shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom duration-500">
              <CardHeader>
                <CardTitle className="text-yellow-700 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                    {wordClues.length}
                  </Badge>
                  Palavras Adicionadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {wordClues.map((wc, index) => (
                    <div 
                      key={wc.id} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-200 animate-in slide-in-from-left"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex-1">
                        <Badge variant="secondary" className="mr-3 bg-yellow-200 text-yellow-800 font-semibold">
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
            <Card className="shadow-2xl border-0 bg-gradient-to-r from-white to-blue-50 hover:shadow-3xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {title || 'Cruzadinha Gerada'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderGrid()}
              </CardContent>
            </Card>
          )}

          {/* Export Buttons */}
          {crosswordGrid.length > 0 && (
            <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-purple-50 hover:shadow-2xl transition-all duration-300">
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
