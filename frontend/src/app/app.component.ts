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

  }
}
