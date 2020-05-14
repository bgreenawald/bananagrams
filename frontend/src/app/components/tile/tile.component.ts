import { Component, OnInit, Input, ElementRef } from '@angular/core';

import { Socket } from 'ngx-socket-io';

import { EventHandleService } from '../../services/event-handle.service';
import { HelperService } from '../../services/helper.service';

import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {
  @Input() index: number;
  @Input() letter: string;

  public gameID = this.app.gameID;
  public playerID = this.app.playerID;
  public selectedTiles: any[] = [];
  public displaySwap: boolean = false;

  constructor(
    private app: AppComponent,
    private eventHandler: EventHandleService,
    private helperService: HelperService,
    private ref: ElementRef,
    private socket: Socket
  ) {
    helperService.globalClick$.subscribe(click => {
      this.clearSwapButton();
    })
  }

  ngOnInit(): void {

  }

  handleClick = e => {
    this.eventHandler.handleClick(e);
  }

  handleDoubleClick = e => {
    this.displaySwap = !this.displaySwap;
  }

  handleDragStart = e => {
    this.eventHandler.handleDragStart(e, this.selectedTiles);
  }

  handleDragEnd = e => {
    this.eventHandler.handleDragEnd(e);
  }

  handleSwap = () => {
    const tiles = this.app.getUserTiles();
    const letter = this.eventHandler.handleSwap(this.index, tiles);
    this.socket.emit("swap", {
      name: this.gameID,
      "letter": letter,
      "player_id": this.playerID
    })
  }

  clearSwapButton = () => {
    this.displaySwap = false;
  }
}
