import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterState } from '@angular/router';

import { Observable, of, fromEvent, throwError } from 'rxjs';
import { catchError, map, tap, first } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';

import { Socket } from 'ngx-socket-io';
import { SocketService } from './services/socket.service';
import { HelperService } from './services/helper.service'
import { ErrorService } from './services/error.service';
import { MessageBusService } from './services/message-bus.service';

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
  public tiles: string[];
  public store$: Observable<any>;
  private playersTiles: string[];
  private messages$ = this.socketService.receive();
  private openModal$ = this.messageBusService.openModal$;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socket: Socket,
    private errorService: ErrorService,
    private helperService: HelperService,
    private messageBusService: MessageBusService,
    private socketService: SocketService,
    private _store: Store<{ bananagrams: any }>
  ) { this.store$ = _store.pipe(select('bananagrams')) }

  ngOnInit() {
    this.detectIDChange();
    this.setPlayerID();
    this.setGameID();
    this.socketSubscribe();
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

  getUserTiles = () => this.tiles;

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

  // ROUTING
  socketSubscribe = () => {
    this.getMessages()
      .subscribe(value => {
        console.log("SOCKET RESPONSE", value)
        switch (value.data.state) {
          case "IDLE":
            this.router.navigate([`/lobby/${this.gameID}`]);
            break;
          case "ACTIVE":
            const allPlayers: string[] = Object.keys(value.data.players);
            if (allPlayers.includes(this.playerID)) {
              this.router.navigate([`/game/${this.gameID}`]);
            }
            else {
              // show cannot join game until over
              this.router.navigate([`**`]);
            }
            break;
          case "ENDGAME":
            break;
          case "OVER":
            this.messageBusService.openModal('review')
            break;
          default:
            this.router.navigate([`**`]);
            break;
        }
      },
        err => this.errorService.displayError(err)
      )
  }

  handleClick = (e) => {
    // is the clicked element NOT the swap button
    const didClickOutsideSwap: boolean = !e.target.classList.contains('swap');
    const swapButton = document.querySelector('button.swap');
    if (swapButton && didClickOutsideSwap) {
      this.helperService.globalClick('click')
    }
    const isModalOpen: boolean = !!document.querySelector('.modal');
    const didClickOutsideModal: boolean = e.target.classList.contains('overlay');
    if (isModalOpen && didClickOutsideModal) this.helperService.globalClick('click');
  }
}
