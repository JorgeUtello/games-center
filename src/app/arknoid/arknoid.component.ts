import { Component, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Paddle {
  x: number;
  width: number;
  height: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  destroyed: boolean;
}

@Component({
  selector: 'app-arknoid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './arknoid.component.html',
  styleUrls: ['./arknoid.component.css']
})
export class ArknoidComponent {
  canvasWidth = 0;
  canvasHeight = 0;
  ball: Ball = { x: 160, y: 300, dx: 2, dy: -2, radius: 7 };
  paddle: Paddle = { x: 120, width: 80, height: 12 };
  bricks: Brick[] = [];
  brickRows = 5;
  brickCols = 8;
  brickWidth = 36;
  brickHeight = 16;
  brickPadding = 4;
  brickOffsetTop = 40;
  brickOffsetLeft = 8;
  score = 0;
  lives = 3;
  interval: any;
  gameOver = false;
  gameWon = false;
  isMobile = false;
  darkMode = false;
  showConfig = false;
  renderLoopId: any;

  constructor(private cdr: ChangeDetectorRef) {
    this.initBricks();
  }

  ngOnInit() {
    this.setFullScreen();
    window.addEventListener('resize', this.setFullScreen.bind(this));
    this.detectMobile();
    this.startGame();
    this.startRenderLoop();
  }

  setFullScreen() {
    // Ocupa todo el viewport menos el header y controles
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    // Deja espacio para controles (60px aprox)
    this.canvasWidth = Math.min(vw, 480);
    this.canvasHeight = vh - 120;
    if (this.canvasHeight < 240) this.canvasHeight = 240;
    if (this.canvasWidth < 200) this.canvasWidth = 200;
    // Ajusta paddle y bola si es mobile
    if (this.isMobile) {
      this.paddle.width = Math.max(60, this.canvasWidth * 0.25);
      this.ball.radius = Math.max(6, Math.floor(this.canvasWidth / 40));
    }
  }

  detectMobile() {
    this.isMobile = window.innerWidth < 600;
    if (this.isMobile) {
      this.canvasWidth = 240;
      this.canvasHeight = 400;
      this.paddle.width = 60;
      this.ball.radius = 6;
      this.brickWidth = 24;
      this.brickHeight = 12;
      this.brickCols = 8;
      this.brickRows = 4;
    }
  }

  initBricks() {
    this.bricks = [];
    for (let r = 0; r < this.brickRows; r++) {
      for (let c = 0; c < this.brickCols; c++) {
        this.bricks.push({
          x: this.brickOffsetLeft + c * (this.brickWidth + this.brickPadding),
          y: this.brickOffsetTop + r * (this.brickHeight + this.brickPadding),
          width: this.brickWidth,
          height: this.brickHeight,
          destroyed: false
        });
      }
    }
  }

  startGame() {
    this.resetBallAndPaddle();
    this.initBricks();
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.gameWon = false;
    clearInterval(this.interval);
    this.interval = setInterval(() => this.tick(), 16);
  }

  resetBallAndPaddle() {
    this.ball = { x: this.canvasWidth / 2, y: this.canvasHeight - 40, dx: 2, dy: -2, radius: this.ball.radius };
    this.paddle.x = (this.canvasWidth - this.paddle.width) / 2;
  }

  tick() {
    if (this.gameOver || this.gameWon) return;
    this.moveBall();
    this.checkCollisions();
    if (this.bricks.every(b => b.destroyed)) {
      this.gameWon = true;
      clearInterval(this.interval);
    }
  }

  moveBall() {
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    // Wall collisions
    if (this.ball.x < this.ball.radius || this.ball.x > this.canvasWidth - this.ball.radius) {
      this.ball.dx *= -1;
    }
    if (this.ball.y < this.ball.radius) {
      this.ball.dy *= -1;
    }
    // Bottom
    if (this.ball.y > this.canvasHeight - this.ball.radius) {
      this.lives--;
      if (this.lives === 0) {
        this.gameOver = true;
        clearInterval(this.interval);
      } else {
        this.resetBallAndPaddle();
      }
    }
  }

  checkCollisions() {
    // Paddle
    if (
      this.ball.y + this.ball.radius > this.canvasHeight - 24 &&
      this.ball.x > this.paddle.x &&
      this.ball.x < this.paddle.x + this.paddle.width
    ) {
      this.ball.dy *= -1;
      // Add some control
      const hit = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
      this.ball.dx = 3 * hit;
    }
    // Bricks
    for (const brick of this.bricks) {
      if (!brick.destroyed &&
        this.ball.x > brick.x &&
        this.ball.x < brick.x + brick.width &&
        this.ball.y > brick.y &&
        this.ball.y < brick.y + brick.height
      ) {
        brick.destroyed = true;
        this.ball.dy *= -1;
        this.score += 10;
        break;
      }
    }
  }

  movePaddle(dir: number) {
    this.paddle.x += dir * (this.canvasWidth * 0.12);
    if (this.paddle.x < 0) this.paddle.x = 0;
    if (this.paddle.x > this.canvasWidth - this.paddle.width) this.paddle.x = this.canvasWidth - this.paddle.width;
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(e: KeyboardEvent) {
    if (this.gameOver || this.gameWon) return;
    if (e.key === 'ArrowLeft') this.movePaddle(-1);
    else if (e.key === 'ArrowRight') this.movePaddle(1);
    else if (e.key === ' ') this.startGame();
  }

  onLeft() { this.movePaddle(-1); }
  onRight() { this.movePaddle(1); }
  onRestart() { this.startGame(); }

  toggleConfig() { this.showConfig = !this.showConfig; }
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    if (this.darkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  }

  startRenderLoop() {
    if (this.renderLoopId) cancelAnimationFrame(this.renderLoopId);
    const render = () => {
      this.cdr.detectChanges();
      this.renderLoopId = requestAnimationFrame(render);
    };
    this.renderLoopId = requestAnimationFrame(render);
  }

  ngOnDestroy() {
    if (this.renderLoopId) cancelAnimationFrame(this.renderLoopId);
    clearInterval(this.interval);
  }
}
