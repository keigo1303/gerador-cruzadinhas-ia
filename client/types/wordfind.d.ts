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

  interface SolutionResult {
    found: WordPosition[];
    notFound: string[];
  }

  type Puzzle = string[][];

  export function newPuzzle(words: string[], options: PuzzleOptions): Puzzle | null;
  export function solve(puzzle: Puzzle, words: string[]): SolutionResult;
  export function print(puzzle: Puzzle): void;
}
