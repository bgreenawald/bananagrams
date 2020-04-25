import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RenderService {
  private readonly baseURL = "http:localhost:4200"
  public gameIDArray: Observable<string[]>;

  constructor(
    private http: HttpClient
  ) {
  }

  public generateID = () => {
    const min = 0;
    const max = 999999;
    let random = Math.floor(Math.random() * (+max - +min)) + +min;
    return random;
  }

  // public getIDs(): Observable<string[]> {
  //   return of(ids)
  // }

  private _createGame(): void {
    this.gameIDArray = this.http.get<string[]>(`${this.baseURL}/api/get_names`)
  }

}
