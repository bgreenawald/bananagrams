import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageBusService } from '../../services/message-bus.service';
import { SocketService } from '../../services/socket.service';
import { HelperService } from '../../services/helper.service';
import { Observable } from 'rxjs';
import { skip, take } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';

import * as Selectors from '../../store/selectors';
import * as UserActions from '../../store/actions/user.actions';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  private _helperService = inject(HelperService);
  private messageBusService = inject(MessageBusService);
  private socketService = inject(SocketService);
  private _ref = inject(ElementRef);
  private _store = inject(Store);

  public open: boolean = false;
  public modalType: string = '';
  public gameID: string = '';
  public winningWords: any[] = [];
  public winningPlayer: string = '';
  private _openModal$ = this.messageBusService.openModal$;
  private _globalClick$ = this._helperService.globalClick$;
  public winningPlayer$ = this._store.pipe(select(Selectors.getWinningPlayer));

  ngOnInit(): void {
    this._listenOpenModals();
    this._listenCloseModals();
    this._listenStore();
  }

  private _listenOpenModals = () => {
    this._openModal$.subscribe((modalType: string) => {
      this.open = true;
      this.modalType = modalType;
    });
  }

  private _listenStore = () => {
    this._store
      .pipe(select(Selectors.selectGameID))
      .subscribe(gameID => {
        this.gameID = gameID;
      });

    this._store.pipe(select(Selectors.getWinningPlayer))
      .subscribe(winningPlayer => {
        this.winningPlayer = winningPlayer;
      });

    this._store.pipe(select(Selectors.getWinningWords))
      .subscribe(words => {
        if (!words) { return; }
        words.forEach((wordPair: any, index: number) => {
          this.winningWords.push([wordPair[0], wordPair[1]]);
        });
      });
  }

  handleReset = () => {
    location.reload();
  }

  handleStartNewGame = () => {
    this.socketService.reset(this.gameID);
    this._store.dispatch(UserActions.resetGame({ gameID: this.gameID }));
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
      if (this.open && (this.modalType !== 'over')) { this.open = false; }
    });
  }
}