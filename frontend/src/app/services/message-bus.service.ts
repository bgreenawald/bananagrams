import { Injectable } from '@angular/core';

import { Subject, Observable } from 'rxjs';

import { Modals } from '../models';

@Injectable({
  providedIn: 'root'
})

export class MessageBusService {

  private _socketMessages = new Subject();
  private _modifyCells = new Subject();
  private _openModal = new Subject<string>();
  private _closeModal = new Subject();

  socketMessage$: Observable<any> = this._socketMessages.asObservable();
  modifyCell$: Observable<any> = this._modifyCells.asObservable();
  openModal$: Observable<any> = this._openModal.asObservable();
  closeModal$: Observable<any> = this._closeModal.asObservable();

  socketMessages() {
    this._socketMessages.next();
  }

  modifyCells() {
    this._modifyCells.next();
  }

  openModal(modalType: string) {
    this._openModal.next(modalType);
  }

  closeModal() {
    this._closeModal.next();
  }

  constructor() { }
}
