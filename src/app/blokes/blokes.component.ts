import { Component, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Definición de las piezas de Tetris y sus rotaciones
const TETROMINOS = [
  // I
  [
    [[1, 1, 1, 1]],
    [[1],[1],[1],[1]]
  ],
  // O
  [
    [[1, 1],[1, 1]]
  ],
  // T
  [
    [[0,1,0],[1,1,1]],
    [[1,0],[1,1],[1,0]],
    [[1,1,1],[0,1,0]],
    [[0,1],[1,1],[0,1]]
  ],
  // S
  [
    [[0,1,1],[1,1,0]],
    [[1,0],[1,1],[0,1]]
  ],
  // Z
  [
    [[1,1,0],[0,1,1]],
    [[0,1],[1,1],[1,0]]
  ],
  // J
  [
    [[1,0,0],[1,1,1]],
    [[1,1],[1,0],[1,0]],
    [[1,1,1],[0,0,1]],
    [[0,1],[0,1],[1,1]]
  ],
  // L
  [
    [[0,0,1],[1,1,1]],
    [[1,0],[1,0],[1,1]],
    [[1,1,1],[1,0,0]],
    [[1,1],[0,1],[0,1]]
  ]
];
const COLORS = ['#00f0f0','#f0f000','#a000f0','#00f000','#f00000','#0000f0','#f0a000'];
const ROWS = 38;
const COLS = 20;

interface Piece {
  type: number;
  rotation: number;
  row: number;
  col: number;
}

@Component({
  selector: 'app-blokes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blokes.component.html',
  styleUrls: ['./blokes.component.css']
})
export class BlokesComponent {
  board: number[][] = [];
  current: Piece = { type: 0, rotation: 0, row: 0, col: 0 };
  next: Piece = { type: 0, rotation: 0, row: 0, col: 0 };
  score = 0;
  interval: any;
  gameOver = false;
  speed = 500;
  isMobile = false;
  linesCleared = 0;
  level = 1;
  showConfig = false;
  darkMode = false;

  COLORS = COLORS;
  ROWS = ROWS;
  COLS = COLS;

  constructor(private cdr: ChangeDetectorRef) {
    this.reset();
  }

  ngOnInit() {
    const saved = localStorage.getItem('blokes-state');
    if (saved) {
      const state = JSON.parse(saved);
      this.score = state.score || 0;
      this.linesCleared = state.linesCleared || 0;
      this.level = state.level || 1;
      this.speed = state.speed || 500;
      this.darkMode = state.darkMode || false;
      if (this.darkMode) document.body.classList.add('dark-mode');
    }
  }

  reset() {
    this.board = Array.from({length: ROWS}, () => Array(COLS).fill(-1));
    this.score = 0;
    this.linesCleared = 0;
    this.level = 1;
    this.speed = 500;
    this.gameOver = false;
    this.current = this.randomPiece();
    this.next = this.randomPiece();
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.tick();
      this.cdr.detectChanges();
    }, this.speed);
    this.saveState();
  }

  randomPiece(): Piece {
    const type = Math.floor(Math.random() * TETROMINOS.length);
    return { type, rotation: 0, row: 0, col: 3 };
  }

  spawnPiece() {
    this.current = { ...this.next, row: 0, col: 3 };
    this.next = this.randomPiece();
    if (!this.valid(this.current, 0, 0, this.current.rotation)) {
      this.gameOver = true;
      clearInterval(this.interval);
    }
  }

  getShape(piece: Piece) {
    return TETROMINOS[piece.type][piece.rotation % TETROMINOS[piece.type].length];
  }

  valid(piece: Piece, dr: number, dc: number, rot: number) {
    const shape = TETROMINOS[piece.type][rot % TETROMINOS[piece.type].length];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const nr = piece.row + dr + r;
          const nc = piece.col + dc + c;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
          if (this.board[nr][nc] !== -1) return false;
        }
      }
    }
    return true;
  }

  merge() {
    const shape = this.getShape(this.current);
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          this.board[this.current.row + r][this.current.col + c] = this.current.type;
        }
      }
    }
  }

  updateLevel() {
    const newLevel = Math.floor(this.score / 1000) + 1;
    if (newLevel !== this.level) {
      this.level = newLevel;
      this.speed = Math.max(50, 500 - (this.level - 1) * 10);
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.tick();
        this.cdr.detectChanges();
      }, this.speed);
      this.saveState();
    }
  }

  clearLines() {
    let lines = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.board[r].every(cell => cell !== -1)) {
        this.board.splice(r, 1);
        this.board.unshift(Array(COLS).fill(-1));
        lines++;
        r++;
      }
    }
    if (lines > 0) {
      this.score += [0, 100, 300, 500, 800][lines];
      this.linesCleared += lines;
      this.updateLevel();
      this.saveState();
    }
  }

  tick() {
    if (this.gameOver) return;
    if (this.valid(this.current, 1, 0, this.current.rotation)) {
      this.current.row++;
    } else {
      this.merge();
      this.clearLines();
      this.spawnPiece();
    }
    this.cdr.detectChanges();
  }

  move(dx: number) {
    if (this.valid(this.current, 0, dx, this.current.rotation)) {
      this.current.col += dx;
    }
  }

  rotate() {
    const nextRot = (this.current.rotation + 1) % TETROMINOS[this.current.type].length;
    if (this.valid(this.current, 0, 0, nextRot)) {
      this.current.rotation = nextRot;
    }
  }

  drop() {
    while (this.valid(this.current, 1, 0, this.current.rotation)) {
      this.current.row++;
    }
    this.tick();
  }

  accelerate() {
    if (this.valid(this.current, 1, 0, this.current.rotation)) {
      this.current.row++;
    } else {
      this.tick();
    }
  }

  get scoreDisplay(): string {
    return this.score.toString().padStart(6, '0');
  }

  // Controles de teclado
  @HostListener('window:keydown', ['$event'])
  handleKey(e: KeyboardEvent) {
    if (this.gameOver) return;
    if (e.key === 'ArrowLeft') this.move(-1);
    else if (e.key === 'ArrowRight') this.move(1);
    else if (e.key === 'ArrowUp') this.rotate();
    else if (e.key === 'ArrowDown') this.accelerate();
    else if (e.key === ' ') this.drop();
  }

  // Controles para botones
  onLeft() { this.move(-1); }
  onRight() { this.move(1); }
  onRotate() { this.rotate(); }
  onDown() { this.accelerate(); }
  onDrop() { this.drop(); }

  toggleConfig() {
    this.showConfig = !this.showConfig;
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    this.saveState();
  }

  saveState() {
    localStorage.setItem('blokes-state', JSON.stringify({
      score: this.score,
      linesCleared: this.linesCleared,
      level: this.level,
      speed: this.speed,
      darkMode: this.darkMode
    }));
  }
}
