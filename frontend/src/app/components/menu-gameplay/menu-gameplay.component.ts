import { Component, OnInit } from '@angular/core';

import { Socket } from 'ngx-socket-io';

import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-menu-gameplay',
  templateUrl: './menu-gameplay.component.html',
  styleUrls: ['./menu-gameplay.component.scss']
})
export class MenuGameplayComponent implements OnInit {
  gameID: string = this.app.getGameID();
  playerID: string = this.app.getPlayerID();

  constructor(
    private app: AppComponent,
    private socket: Socket
  ) { }

  ngOnInit(): void {
    console.log(this.app.getGameID())
  }

  reset = () => {
    // refresh the page would work the same??
    this.socket.emit("reset", {
      "name": this.gameID
    });
  }

  peel = () => {
    this.socket.emit("peel", {
      "name": this.gameID
    })
  }


  selectAllTiles = () => {

  }

  bananagrams = () => {
    this.socket.emit("banangrams", {
      "name": this.gameID,
      "player_id": this.playerID,
      // "words": words
    })
  }

  swap = () => {
    this.socket.emit("swap", {
      "name": this.gameID,
      "player_id": this.playerID,
      // "letter": letter
    })
  }

  continueGame = () => {
    this.socket.emit("continue_game", {
      "name": this.gameID
    })
  }
}