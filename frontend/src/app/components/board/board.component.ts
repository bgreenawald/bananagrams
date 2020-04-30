import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { SocketService } from '../../services/socket.service';


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  public gameID: string; // numerical game id formatted as a string
  public playerJoined: boolean = false;
  public playerID: string;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private socket: Socket,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.getPlayerID();
  }

  setGameID = () => {
    const id = +this.route.snapshot.paramMap.get('id');
    this.gameID = id.toString();
  }

  getPlayerID = () => {
    this.playerID = localStorage.getItem("player_id")
    console.log(this.playerID)
  }

}
