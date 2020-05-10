import { Component, OnInit, Input, ElementRef } from '@angular/core';

import { EventHandleService } from '../../services/event-handle.service';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {
  @Input() index: number;
  @Input() letter: string;

  public selectedTiles: any[] = [];
  public displaySwap: boolean = false;

  constructor(
    private ref: ElementRef,
    private eventHandler: EventHandleService,
    private helperService: HelperService
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

  clearSwapButton = () => {
    this.displaySwap = false;
  }
}
