import { Component, ElementRef, OnInit } from '@angular/core';
import { MessageBusService } from './../../services/message-bus.service';
import { SocketService } from './../../services/socket.service';
import { HelperService } from './../../services/helper.service';
import { Observable } from 'rxjs';
import { skip, take } from 'rxjs/operators';
import { AppComponent } from '../../app.component';
import { Store, select } from '@ngrx/store';
import { AppState } from './../../app.state';

import * as fromStore from './../../store';
import * as Models from './../../models';


@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  public open: boolean;
  public modalType: string;
  public gameID: string;
  public winningWords: any[];
  public winningPlayer: string;
  private _openModal$ = this.messageBusService.openModal$;
  private _globalClick$ = this._helperService.globalClick$;
  public store$: Observable<any>; // REMOVE
  // private _message$ = this._app.getMessages();
  public winningPlayer$ = this._store.pipe(select(fromStore.getWinningPlayer));
  public

  constructor(
    private _app: AppComponent,
    private _helperService: HelperService,
    private messageBusService: MessageBusService,
    private socketService: SocketService,
    private _ref: ElementRef,
    private _store: Store<Models.GameState>  // better name is _store$?
  ) {
  }

  ngOnInit(): void {
    this._listenOpenModals();
    this._listenCloseModals();
    // this.gameID = this._app.getGameID();
    this._listenStore();
  }

  private _listenOpenModals = () => {
    this._openModal$.subscribe((modalType: string) => {
      this.open = true;
      this.modalType = modalType;
    })
  }

  private _listenStore = () => {
    this._store
      .pipe(select(fromStore.selectGameID))
      .subscribe(gameID => {
        this.gameID = gameID;
      })

    this._store.pipe(select(fromStore.getWinningPlayer))
      .subscribe(winningPlayer => {
        this.winningPlayer = winningPlayer
      })

    this._store.pipe(select(fromStore.getWinningWords))
      .subscribe(words => {
        this.winningWords = words
      })
  }

  handleReset = () => {
    location.reload();
  }

  handleStartNewGame = () => {
    this.socketService.reset(this.gameID);
    // ADD here
    this._store.dispatch(new fromStore.ResetGame(this.gameID)); // update with a ref to the gameID from the store. 
  }

  handleClose = () => {
    this.open = false;
  }

  handleInvalidReview = () => {
    this.socketService.continueGame(this.gameID);
    this.handleClose();
  }

  handleGameWin = () => {
    this.socketService.reset(this.gameID);
  }

  setWordStatus = (index: number, status: boolean) => {
    this.winningWords[index][1] = status;
  }

  _listenCloseModals = () => {
    this._globalClick$.subscribe(click => {
      if (this.open && (this.modalType !== "over")) this.open = false;
    })
  }
}
