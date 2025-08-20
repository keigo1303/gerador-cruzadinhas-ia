import React, { useState } from 'react';
import { CrosswordLayoutGenerator } from 'crossword-layout-generator';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, FileText, FileCheck } from 'lucide-react';

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

export default function Index() {
  const [word, setWord] = useState('');
  const [clue, setClue] = useState('');
  const [wordClues, setWordClues] = useState<WordClue[]>([]);
  const [crosswordGrid, setCrosswordGrid] = useState<CrosswordWord[]>([]);
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 });

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
      const generator = new CrosswordLayoutGenerator();
      const words = wordClues.map(wc => wc.word);
      const layout = generator.generateLayout(words);

      if (layout && layout.result && layout.result.length > 0) {
        // Map the layout result to our CrosswordWord format
        const crosswordWords: CrosswordWord[] = layout.result.map((item: any, index: number) => {
          const wordClue = wordClues.find(wc => wc.word === item.word);
          return {
            word: item.word,
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
      <div className="flex flex-col items-center gap-6">
        <div className="grid gap-1 p-4 bg-white border-2 border-blue-200 rounded-lg shadow-lg" 
             style={{ gridTemplateColumns: `repeat(${gridSize.width}, 1fr)` }}>
          {grid.map((row, y) => 
            row.map((cell, x) => (
              <div 
                key={`${x}-${y}`}
                className={`w-8 h-8 border border-gray-300 flex items-center justify-center relative text-sm font-bold ${
                  cell ? 'bg-white' : 'bg-gray-100'
                }`}
              >
                {numbers[y][x] && (
                  <span className="absolute top-0 left-0 text-xs text-blue-600 font-bold leading-none p-0.5">
                    {numbers[y][x]}
                  </span>
                )}
                {cell && <span className="text-gray-800">{cell}</span>}
              </div>
            ))
          )}
        </div>

        <div className="w-full max-w-2xl grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">Horizontais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {crosswordGrid.filter(cw => !cw.vertical).map(cw => (
                  <div key={cw.number} className="text-sm">
                    <span className="font-bold text-blue-600">{cw.number}.</span> {cw.clue}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">Verticais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {crosswordGrid.filter(cw => cw.vertical).map(cw => (
                  <div key={cw.number} className="text-sm">
                    <span className="font-bold text-blue-600">{cw.number}.</span> {cw.clue}
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

    const pdf = new jsPDF();
    const title = withAnswers ? 'Cruzadinha - Gabarito' : 'Cruzadinha';
    
    pdf.setFontSize(20);
    pdf.text(title, 20, 20);

    // Draw grid
    const cellSize = 15;
    const startX = 20;
    const startY = 40;

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
    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        const cell = grid[y][x];
        if (cell) {
          const cellX = startX + x * cellSize;
          const cellY = startY + y * cellSize;
          
          pdf.rect(cellX, cellY, cellSize, cellSize);
          
          if (numbers[y][x]) {
            pdf.setFontSize(8);
            pdf.text(numbers[y][x]!.toString(), cellX + 1, cellY + 6);
          }
          
          if (withAnswers && cell) {
            pdf.setFontSize(12);
            pdf.text(cell, cellX + cellSize/2 - 2, cellY + cellSize/2 + 2);
          }
        }
      }
    }

    // Add clues
    let currentY = startY + (gridSize.height * cellSize) + 20;
    
    pdf.setFontSize(14);
    pdf.text('Horizontais:', 20, currentY);
    currentY += 10;
    
    pdf.setFontSize(10);
    crosswordGrid.filter(cw => !cw.vertical).forEach(cw => {
      pdf.text(`${cw.number}. ${cw.clue}`, 20, currentY);
      currentY += 8;
    });
    
    currentY += 10;
    pdf.setFontSize(14);
    pdf.text('Verticais:', 20, currentY);
    currentY += 10;
    
    pdf.setFontSize(10);
    crosswordGrid.filter(cw => cw.vertical).forEach(cw => {
      pdf.text(`${cw.number}. ${cw.clue}`, 20, currentY);
      currentY += 8;
    });

    pdf.save(`cruzadinha-${withAnswers ? 'gabarito' : 'em-branco'}.pdf`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addWordClue();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">
          Gerador de Cruzadinhas
        </h1>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">Adicionar Palavra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  placeholder="Digite a palavra"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="uppercase"
                />
                <Input
                  placeholder="Digite a dica"
                  value={clue}
                  onChange={(e) => setClue(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button onClick={addWordClue} className="bg-blue-600 hover:bg-blue-700">
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Words List */}
          {wordClues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">
                  Palavras Adicionadas ({wordClues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {wordClues.map((wc) => (
                    <div key={wc.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex-1">
                        <Badge variant="secondary" className="mr-2">{wc.word}</Badge>
                        <span className="text-gray-700">{wc.clue}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeWordClue(wc.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={generateCrossword}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={wordClues.length < 2}
                  >
                    Gerar Cruzadinha
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Crossword Grid */}
          {crosswordGrid.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">Cruzadinha Gerada</CardTitle>
              </CardHeader>
              <CardContent>
                {renderGrid()}
              </CardContent>
            </Card>
          )}

          {/* Export Buttons */}
          {crosswordGrid.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">Exportar para PDF</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => exportToPDF(false)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Cruzadinha em Branco
                  </Button>
                  <Button
                    onClick={() => exportToPDF(true)}
                    variant="outline"
                    className="flex items-center gap-2"
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
