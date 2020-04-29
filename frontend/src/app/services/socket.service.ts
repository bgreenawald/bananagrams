import { Injectable } from '@angular/core';

import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public gameID: string; // numerical game id formatted as a string

  constructor(
    private socket: Socket
  ) { }


}
