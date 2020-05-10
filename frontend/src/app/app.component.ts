import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterState } from '@angular/router';

import { Observable, of, fromEvent, throwError } from 'rxjs';
import { catchError, map, tap, first } from 'rxjs/operators';


import { Socket } from 'ngx-socket-io';
import { SocketService } from './services/socket.service';
import { HelperService } from './services/helper.service'
import { ErrorService } from './services/error.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  public gameID: string; // numerical game id formatted as a string
  public playerID: string;
  public playersInLobby: string[];
  private playersTiles: string[];
  private messages$ = this.socketService.receive();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socket: Socket,
    private errorService: ErrorService,
    private helperService: HelperService,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    this.detectIDChange();
    this.setPlayerID();
    this.setGameID();
    this.getMessages();
  }

  detectIDChange = () => {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        const gameID = this.helperService.getGameID();
        if (this.gameID !== gameID && !!gameID) {
          this.gameID = gameID;
          this.socketService.loadOrCreateGame(this.gameID);
          this.socketService.receive();
        }
      }
    })
  }

  setGameID = () => {
    const id = this.route.snapshot.paramMap.get('id');
    this.gameID = id;
  }

  setPlayerID = () => {
    this.playerID = localStorage.getItem("player_id");
  }

  getPlayerID = (): string => this.playerID;

  getGameID = (): string => this.gameID;

  getPlayers = (): string[] => this.playersTiles;

  // TODO: refactor
  getMessages = (): Observable<any> => {
    return this.messages$.pipe(
      map(resp => {
        if (resp.status_code !== 200) throw `error: ${resp.message}`
        const value = {
          ...resp,
          "data": JSON.parse(resp.payload)
        };
        return value;
      }
      ),
      catchError(errorMessage => throwError(errorMessage))
    )
  }

  handleClick = (e) => {
    // is the clicked element NOT the swap button
    const didClickOutsideSwap: boolean = !e.target.classList.contains('swap');
    const swapButton = document.querySelector('button.swap');
    if (swapButton && didClickOutsideSwap) {
      this.helperService.globalClick('click')
    }
  }
}
