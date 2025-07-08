import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'games-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="games-menu-container">
      <h2>Centro de Juegos</h2>
      <ul>
        <li *ngFor="let game of games">
          <button (click)="selectGame(game.key)">
            <span class="game-icon material-icons">{{ game.icon }}</span>
            {{ game.name }}
          </button>
        </li>
      </ul>
    </div>
    <div class="games-menu-version">Versión v0.1.0</div>
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
        display: flex;
        align-items: center;
        gap: 1em;
        box-shadow: 0 2px 12px #0002;
      }
      button:hover {
        background: #4e7c4e;
      }
      .game-icon.material-icons {
        font-size: 2em;
        vertical-align: middle;
        color: #fffbe6;
        filter: drop-shadow(0 2px 6px #0003);
      }
      .games-menu-version {
        margin-top: 2.5em;
        color: #888;
        font-size: 1em;
        letter-spacing: 0.05em;
        text-align: center;
        opacity: 0.8;
      }
    `,
  ],
})
export class GamesMenuComponent {
  @Output() gameSelected = new EventEmitter<string>();

  games = [
    { key: 'letritas', name: 'Letritas (Wordle)', icon: 'spellcheck' },
    { key: '2048', name: '2048', icon: 'grid_on' },
    { key: 'blokes', name: 'Blokes', icon: 'view_module' },
    { key: 'arknoid', name: 'Arknoid', icon: 'sports_esports' },

    // Agrega aquí más juegos
  ];

  selectGame(gameKey: string) {
    this.gameSelected.emit(gameKey);
  }
}
