import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  private _globalClick = new Subject();
  globalClick$ = this._globalClick.asObservable();

  constructor(
    private router: Router
  ) { }

  cleanBench = () => {
    const bench = document.getElementById('bench');

    let emptyCells = [];
    Array.from(bench.children).forEach((cell, i) => {
      if (cell.children.length === 0) {
        emptyCells.push(cell);
      }
    })

    Array.from(emptyCells).forEach(cell => {
      bench.removeChild(cell);
    })

    Array.from(bench.children).forEach((benchCell, i) => {
      benchCell.dataset.column = i;
    })
  }

  public getGameID = (): string => {
    const url = this.router.routerState.snapshot.url;
    const id = url.split("/")[2];
    return id;
  }

  public saveToLocalStorage = (key, rawData) => {
    let data = rawData;
    if (this._isHashMap(data)) {
      data = JSON.stringify(data);
    }
    localStorage.setItem(key, data)
  }


  private _isHashMap = (item) => {
    return (!Array.isArray(item) && typeof (item) === 'object')
  }

  globalClick = (message) => {
    this._globalClick.next(message);
  }
}
