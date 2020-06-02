import { Injectable } from '@angular/core';

import { Subject, Observable } from 'rxjs';

import { Cell, Modals, Tile } from '../models';

@Injectable({
  providedIn: 'root'
})

export class MessageBusService {

  private _socketMessages = new Subject();
  private _modifyCells = new Subject();
  private _openModal = new Subject<string>();
  private _closeModal = new Subject();
  private _moveChildTile = new Subject();
  private _removeChildTile = new Subject();

  socketMessage$: Observable<any> = this._socketMessages.asObservable();
  modifyCell$: Observable<any> = this._modifyCells.asObservable();
  openModal$: Observable<any> = this._openModal.asObservable();
  closeModal$: Observable<any> = this._closeModal.asObservable();
  moveChildTile$: Observable<any> = this._moveChildTile.asObservable();
  removeChildTile$: Observable<any> = this._removeChildTile.asObservable();

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

  addChildTile(tileData: Tile, cellData: Cell) {
    this._moveChildTile.next({ ...tileData, ...cellData });
  }

  removeChildTile(originCell: Cell) {
    this._removeChildTile.next({ ...originCell });
  }

  constructor() { }
}
