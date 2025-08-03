import { Injectable } from '@angular/core';

import { Subject, Observable } from 'rxjs';

import { BoardCell, Tile } from '../interfaces';

interface Cell {
  row: number;
  column: number;
}

@Injectable({
  providedIn: 'root'
})

export class MessageBusService {

  private _socketMessages = new Subject<any>();
  private _modifyCells = new Subject<any>();
  private _openModal = new Subject<string>();
  private _closeModal = new Subject<any>();
  private _moveChildTile = new Subject<any>();
  private _removeChildTile = new Subject<any>();

  socketMessage$: Observable<any> = this._socketMessages.asObservable();
  modifyCell$: Observable<any> = this._modifyCells.asObservable();
  openModal$: Observable<string> = this._openModal.asObservable();
  closeModal$: Observable<any> = this._closeModal.asObservable();
  moveChildTile$: Observable<any> = this._moveChildTile.asObservable();
  removeChildTile$: Observable<any> = this._removeChildTile.asObservable();

  socketMessages() {
    this._socketMessages.next(null);
  }

  modifyCells() {
    this._modifyCells.next(null);
  }

  openModal(modalType: string) {
    this._openModal.next(modalType);
  }

  closeModal() {
    this._closeModal.next(null);
  }

  addChildTile(tileData: Tile, cellData: Cell) {
    this._moveChildTile.next({ ...tileData, ...cellData });
  }

  removeChildTile(originCell: Cell) {
    this._removeChildTile.next({ ...originCell });
  }

  constructor() { }
}