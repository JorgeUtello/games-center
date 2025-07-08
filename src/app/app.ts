import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LetritasComponent } from './letritas/letritas.component';
import { Game2048Component } from './game-2048/game-2048.component';
import { GamesMenuComponent } from './games-menu.component';
import { BlokesComponent } from './blokes/blokes.component';
import { ArknoidComponent } from './arknoid/arknoid.component';


@Component({
  selector: 'app-root',
  imports: [CommonModule, LetritasComponent, GamesMenuComponent, Game2048Component, BlokesComponent, ArknoidComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  showMenu = true;
  selectedGame: string | null = null;

  onGameSelected(game: string) {
    this.selectedGame = game;
    this.showMenu = false;
  }

  backToMenu() {
    this.selectedGame = null;
    this.showMenu = true;
  }
}
