import { Injectable } from '@angular/core';

import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageBusService {

  private _mySubject = new Subject();
  private _socketMessages = new Subject();
  private _modifyCells = new Subject();
  private _openModal = new Subject<string>();

  mySubject$: Observable<any> = this._mySubject.asObservable();
  socketMessage$: Observable<any> = this._socketMessages.asObservable();
  modifyCell$: Observable<any> = this._modifyCells.asObservable();
  openModal$: Observable<any> = this._openModal.asObservable();

  mySubject(input: any) {
    this._mySubject.next(input);
  }

  openModal(message: string) {
    this._openModal.next(message);
  }

  constructor() { }
}
