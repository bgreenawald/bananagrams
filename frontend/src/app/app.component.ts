import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import { Observable, of } from 'rxjs';
import { filter, switchMap, map } from 'rxjs/operators';

import { Socket } from 'ngx-socket-io';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  public gameID: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socket: Socket,
    private socketService: SocketService
  ) { }
  ngOnInit() {
    // if url has new game id,
    // connect socket
    this.router.events.subscribe(event => {
      this.detectGameIDChange(event);
    })
    this.socketService.socketInit(this.gameID);
    this.socketService
      .socketReceive()
      .subscribe((message: string) => {
        console.log(message)
      })
  }


  detectGameIDChange = (event) => {
    if (event instanceof NavigationEnd) {
      let currentGameID: string = event.url.split("/")[2];
      if (this.gameID !== currentGameID && !!currentGameID) {
        this.setGameID(currentGameID);
        this.socketService.socketInit(this.gameID);
      }
    }
  }

  setGameID = (newGameID: string) => {
    console.log('setting game id from: ', this.gameID)
    this.gameID = newGameID;
    console.log('to: ', this.gameID)
  }
}
