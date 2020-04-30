import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(
    private router: Router
  ) { }

  saveToLocalStorage = (key, rawData) => {
    let data = rawData;
    if (this._isHashMap(data)) {
      data = JSON.stringify(data);
    }
    localStorage.setItem(key, data)
  }

  getGameID = (): string => {
    const url = this.router.routerState.snapshot.url;
    const id = url.split("/")[2];
    return id;
  }

  private _isHashMap = (item) => {
    return (!Array.isArray(item) && typeof (item) === 'object')
  }

}
