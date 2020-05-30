import { Component, ElementRef, OnInit } from '@angular/core';
import { MessageBusService } from './../../services/message-bus.service';
import { SocketService } from './../../services/socket.service';
import { HelperService } from './../../services/helper.service';
import { Observable } from 'rxjs';
import { skip, take } from 'rxjs/operators';

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

  constructor(
    private _helperService: HelperService,
    private messageBusService: MessageBusService,
    private socketService: SocketService,
    private _ref: ElementRef
  ) {
  }

  ngOnInit(): void {
    this._listenOpenModals();
    this._listenCloseModals();
  }

  private _listenOpenModals = () => {
    this._openModal$.subscribe((modalType: string) => {
      this.open = true;
      this.modalType = modalType;
    })
    this._listenCloseModals();
  }

  reset = () => {
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
