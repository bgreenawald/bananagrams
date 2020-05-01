import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterState } from '@angular/router';

import { Observable, of } from 'rxjs';
import { filter, switchMap, map } from 'rxjs/operators';

import { Socket } from 'ngx-socket-io';
import { SocketService } from './services/socket.service';
import { HelperService } from './services/helper.service'

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
    private helperService: HelperService,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    this.detectIDChange();
    // this.socketSubscribe();
  }

  detectIDChange = () => {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        const gameID = this.helperService.getGameID();
        if (this.gameID !== gameID && !!gameID) {
          this.gameID = gameID;
          this.socketService.loadOrCreateGame(this.gameID);
          this.socketService.receive();
        }
      }
    })
  }

  // socketSubscribe = () => {
  //   this.socketService.receive()
  //     .subscribe(resp => {
  //       let parsedPayload = JSON.parse(resp.payload);
  //       console.log(parsedPayload)
  //     })
  // }
}
