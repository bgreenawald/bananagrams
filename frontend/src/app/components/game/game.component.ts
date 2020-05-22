import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Socket } from 'ngx-socket-io';

import { Observable, of, fromEvent, throwError } from 'rxjs';
import { catchError, map, tap, first } from 'rxjs/operators';

import { ErrorService } from '../../services/error.service';
import { SocketService } from '../../services/socket.service';

import { AppComponent } from '../../app.component';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GameComponent implements OnInit {
  @HostListener('window:beforeunload', ['$event'])
  confirmExit($event: any) {
    $event.preventDefault();
    // Chrome prevents custom navigate away messages. 
    $event.returnValue = 'Are you sure you want to leave? This will clear your board.';
  }

  public error: string;
  public gameID: string; // numerical game id formatted as a string
  public playerJoined: boolean = false;
  public playerID: string = this.app.playerID;
  public playersTiles: string[];
  public tiles: string[];

  private messages$ = this.app.getMessages();

  constructor(
    public app: AppComponent,
    private route: ActivatedRoute,
    private router: Router,
    private socket: Socket,
    private errorService: ErrorService,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this._getPlayerID();
    this.setGameID();
    this.socketSubscribe();
    this.socketService.loadOrCreateGame(this.gameID);
  }

  setGameID = () => {
    const id = +this.route.snapshot.paramMap.get('id');
    this.gameID = id.toString();
  }

  _getPlayerID = () => {
    this.playerID = localStorage.getItem("player_id")
  }

  // TODO: refactor
  socketSubscribe = () => {
    this.messages$
      .subscribe(value => {
        console.log(value)
        // this.tiles = value.data.players[this.playerID]
        this.tiles = ["c", "a", "t"]
      },
        err => this.error = this.errorService.parseError(err)
      )
  }
}
