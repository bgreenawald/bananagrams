import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  saveToLocalStorage = (key, rawData) => {
    let data = rawData;
    if (this._isHashMap(data)) {
      data = JSON.stringify(data);
    }
    localStorage.setItem(key, data)
  }

  private _isHashMap = (item) => {
    return (!Array.isArray(item) && typeof (item) === 'object')
  }

}
