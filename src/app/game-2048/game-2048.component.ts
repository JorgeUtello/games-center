import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-2048',
  imports: [CommonModule],
  templateUrl: './game-2048.component.html',
  styleUrl: './game-2048.component.css'
})
export class Game2048Component implements OnInit {
  board: number[][] = [];
  score = 0;
  gameOver = false;
  gameWon = false;
  size = 4;
  mobileMode = false;
  
  touchStartX = 0;
  touchStartY = 0;


  constructor() {
    this.resetGame();
  }
  ngOnInit(): void {
    if (window.innerWidth < 600) {
      this.mobileMode = true;
    }
  }

toggleMobileMode() {
  this.mobileMode = !this.mobileMode;
}

onTouchStart(event: TouchEvent) {
  if (event.touches.length === 1) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }
}

@HostListener('window:keydown', ['$event'])
handleKey(event: KeyboardEvent) {
  if (this.mobileMode) return; // Desactiva flechas en modo móvil
  if (this.gameOver || this.gameWon) return;
  let moved = false;
  switch (event.key) {
    case 'ArrowUp': moved = this.move('up'); break;
    case 'ArrowDown': moved = this.move('down'); break;
    case 'ArrowLeft': moved = this.move('left'); break;
    case 'ArrowRight': moved = this.move('right'); break;
  }
  if (moved) {
    this.addRandomTile();
    this.checkGameOver();
  }
}

  resetGame() {
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.addRandomTile();
    this.addRandomTile();
  }

  addRandomTile() {
    const empty: [number, number][] = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.board[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return;
    const [row, col] = empty[Math.floor(Math.random() * empty.length)];
    this.board[row][col] = Math.random() < 0.9 ? 2 : 4;
  }

  move(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    let moved = false;
    for (let i = 0; i < this.size; i++) {
      let line = this.getLine(i, direction);
      let { merged, score } = this.mergeLine(line);
      if (JSON.stringify(line) !== JSON.stringify(merged)) moved = true;
      this.setLine(i, merged, direction);
      this.score += score;
      if (merged.includes(2048)) this.gameWon = true;
    }
    return moved;
  }

  onTouchEnd(event: TouchEvent) {
  if (event.changedTouches.length === 1) {
    const dx = event.changedTouches[0].clientX - this.touchStartX;
    const dy = event.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) this.moveButton('right');
        else this.moveButton('left');
      } else {
        if (dy > 0) this.moveButton('down');
        else this.moveButton('up');
      }
    }
  }
}

  getLine(index: number, dir: string): number[] {
    const arr = [];
    for (let i = 0; i < this.size; i++) {
      switch (dir) {
        case 'up': arr.push(this.board[i][index]); break;
        case 'down': arr.push(this.board[this.size - 1 - i][index]); break;
        case 'left': arr.push(this.board[index][i]); break;
        case 'right': arr.push(this.board[index][this.size - 1 - i]); break;
      }
    }
    return arr;
  }

  setLine(index: number, line: number[], dir: string) {
    for (let i = 0; i < this.size; i++) {
      switch (dir) {
        case 'up': this.board[i][index] = line[i]; break;
        case 'down': this.board[this.size - 1 - i][index] = line[i]; break;
        case 'left': this.board[index][i] = line[i]; break;
        case 'right': this.board[index][this.size - 1 - i] = line[i]; break;
      }
    }
  }

  mergeLine(line: number[]): { merged: number[], score: number } {
    let arr = line.filter(x => x !== 0);
    let score = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        score += arr[i];
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter(x => x !== 0);
    while (arr.length < this.size) arr.push(0);
    return { merged: arr, score };
  }

  checkGameOver() {
    if (this.board.some(row => row.includes(0))) return;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const val = this.board[r][c];
        if ((r < this.size - 1 && this.board[r + 1][c] === val) ||
            (c < this.size - 1 && this.board[r][c + 1] === val)) {
          return;
        }
      }
    }
    this.gameOver = true;
  }

  moveButton(dir: 'up' | 'down' | 'left' | 'right') {
    if (this.gameOver || this.gameWon) return;
    if (this.move(dir)) {
      this.addRandomTile();
      this.checkGameOver();
    }
  }

  getTileClass(val: number): string {
    return val === 0 ? 'tile-empty' : 'tile-' + val;
  }
}