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
    let benchCells = Array.from(document.querySelectorAll('#bench .cell'));
    let emptyCells = [];

    benchCells.forEach((cell, i) => {
      const childTile = cell.children[0].children[0];
      if (!childTile) {
        emptyCells.push(cell);
      }
    })

    emptyCells.forEach(cell => {
      cell.parentNode.removeChild(cell)
    })

    benchCells = Array.from(document.querySelectorAll('#bench .cell'));
    benchCells.forEach((benchCell, i) => {
      // benchCell.dataset.column = i;
      console.log(benchCell)
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
