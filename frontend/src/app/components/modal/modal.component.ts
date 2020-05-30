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
  private _openModal$ = this.messageBusService.openModal$;
  private _globalClick$ = this._helperService.globalClick$;
  public store$: Observable<any>;

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
  }

  private _listenOpenModals = () => {
    this._openModal$.subscribe((modalType: string) => {
      this.open = true;
      this.modalType = modalType;
    })
    this._listenCloseModals();
  }

  handleReset = () => {
    location.reload();
  }

  handleStartNewGame = () => {
    console.log('game id', this.gameID)
    this.socketService.reset(this.gameID);
  }

  handleClose = () => {
    this.open = false;
  }

  _listenCloseModals = () => {
    this._globalClick$.subscribe(click => {
      if (this.open) this.open = false;
    })
  }
}
