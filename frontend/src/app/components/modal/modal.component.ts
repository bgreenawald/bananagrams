import { Component, ElementRef, OnInit } from '@angular/core';
import { MessageBusService } from './../../services/message-bus.service';
import { SocketService } from './../../services/socket.service';
import { HelperService } from './../../services/helper.service';
import { Observable } from 'rxjs';
import { skip, take } from 'rxjs/operators';
import { AppComponent } from '../../app.component';
import { Store, select } from '@ngrx/store';
import { AppState } from './../../app.state';

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
  public store$: Observable<any>;
  private _message$ = this._app.getMessages();

  constructor(
    private _app: AppComponent,
    private _helperService: HelperService,
    private messageBusService: MessageBusService,
    private socketService: SocketService,
    private _ref: ElementRef,
    private store: Store<AppState>
  ) {
    this.store$ = store.pipe(select('bananagrams'));
  }

  ngOnInit(): void {
    this._listenOpenModals();
    this._listenCloseModals();
    this.gameID = this._app.getGameID();
    console.log(this.store$)
    this.socketSubscribe();
  }

  private _listenOpenModals = () => {
    this._openModal$.subscribe((modalType: string) => {
      this.open = true;
      this.modalType = modalType;
    })
  }

  handleReset = () => {
    location.reload();
  }

  handleStartNewGame = () => {
    this.socketService.reset(this.gameID);
  }

  handleClose = () => {
    this.open = false;
  }

  handleInvalidReview = () => {
    this.socketService.continueGame(this.gameID);
  }

  handleGameWin = () => {
    this.socketService.reset(this.gameID);
  }

  _listenCloseModals = () => {
    this._globalClick$.subscribe(click => {
      if (this.open && (this.modalType !== "over")) this.open = false;
    })
  }

  socketSubscribe = () => {
    this._message$
      .subscribe(value => {
        if (value.message === "Game continued.") {
          this.open = false;
        }
        else if (value.data.state === "OVER") {
          this.winningWords = value.data.winning_words
          this.winningPlayer = value.data.winning_player
        }
      },
    )
  }
}
