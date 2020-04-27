import { Component, OnInit } from '@angular/core';
import { Socket }
  from 'ngx-socket-io';
import { SocketService } from './services/socket.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter } from 'rxjs/operators';

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
    // this.socketService.socketInit();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setGameID(event.url);
      }
    }
    )
  }

  // setGameID = () => {
  //   console.log('snapshot', this.route.snapshot)
  //   const id = +this.route.snapshot.paramMap.get('id');
  //   console.log('snapshot id', id)
  //   this.gameID = id.toString();
  // }

  setGameID = (url: string) => {
    if (url.includes('game') || url.includes('lobby')) {
      let gameID = url.split('/')[2];
      this.gameID = gameID;
    }
  }
}
