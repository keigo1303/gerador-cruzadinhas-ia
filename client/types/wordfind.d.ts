declare module 'wordfind' {
  interface PuzzleOptions {
    width: number;
    height: number;
    orientations?: string[];
    fillBlanks?: boolean;
    preferOverlap?: boolean;
  }

  interface WordPosition {
    word: string;
    x: number;
    y: number;
    orientation: string;
    endx?: number;
    endy?: number;
  }

  type Puzzle = string[][];

  export function newPuzzle(words: string[], options: PuzzleOptions): Puzzle | null;
  
  export const finder: {
    find(puzzle: Puzzle, words: string[]): WordPosition[];
  };
}
