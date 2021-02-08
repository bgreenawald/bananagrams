import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';

import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseURL: string = environment.backendUrl + '/api/';

  constructor(
    private http: HttpClient,
    private socket: Socket
  ) { }

  getIDs(): Observable<String[]> {
    return this.http.get<any>(this.baseURL + "get_names")
      .pipe(
        map(resp => resp.ids),
        catchError(this.handleError<any>('getIDs', []))
      );
  }

  /**
   * * Handle Http operation that failed.
   * Let the app continue
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error)
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    }
  }

}
