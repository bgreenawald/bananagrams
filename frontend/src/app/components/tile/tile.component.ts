import { Component, OnInit, Input, ElementRef, HostListener, HostBinding } from '@angular/core';

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
  @HostBinding('attr.data-tile-id') @Input() index: number;
  @Input() letter: string;

  public gameID = this.app.gameID;
  public playerID = this.app.playerID;
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

  @HostBinding('draggable') true;

  @HostListener('click', ['$event'])
  handleClick = $event => {
    this.eventHandler.handleClick($event, this.ref.nativeElement);
  }

  @HostListener('dblclick', ['$event'])
  handleDoubleClick = $event => {
    this.displaySwap = !this.displaySwap;
  }

  @HostListener('dragstart', ['$event'])
  handleDragStart = $event => {
    this.eventHandler.handleDragStart($event);
  }

  @HostListener('dragend', ['$event'])
  handleDragEnd = $event => {
    this.eventHandler.handleDragEnd($event);
  }

  handleSwap = $event => {
    const tiles = this.app.getUserTiles();
    const letter = this.eventHandler.handleSwap(this.index, tiles);
  }

  clearSwapButton = () => {
    this.displaySwap = false;
  }
}
