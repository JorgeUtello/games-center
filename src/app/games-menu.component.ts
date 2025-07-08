import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'games-menu',
  standalone: true,
  imports: [CommonModule], // <-- Agrega esto
  template: `
    <div class="games-menu-container">
      <h2>Centro de Juegos</h2>
      <ul>
        <li *ngFor="let game of games">
          <button (click)="selectGame(game.key)">{{ game.name }}</button>
        </li>
      </ul>
    </div>
  `,
  styles: [
    `
      .games-menu-container {
        text-align: center;
        margin-top: 2em;
      }
      ul {
        list-style: none;
        padding: 0;
      }
      li {
        margin: 1em 0;
      }
      button {
        font-size: 1.2em;
        padding: 0.7em 2em;
        border-radius: 8px;
        border: none;
        background: #6aaa64;
        color: #fff;
        cursor: pointer;
        transition: background 0.2s;
      }
      button:hover {
        background: #4e7c4e;
      }
    `,
  ],
})
export class GamesMenuComponent {
  @Output() gameSelected = new EventEmitter<string>();

  games = [
    { key: 'letritas', name: 'Letritas (Wordle)' },
    { key: '2048', name: '2048' },
    { key: 'blokes', name: 'Blokes' },
    { key: 'arknoid', name: 'Arknoid' },

    // Agrega aquí más juegos
  ];

  selectGame(gameKey: string) {
    this.gameSelected.emit(gameKey);
  }
}
