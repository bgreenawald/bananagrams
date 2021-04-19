import { Component, OnInit, Input, ElementRef, HostListener, HostBinding } from '@angular/core';

import { Socket } from 'ngx-socket-io';

import { EventHandleService } from '../../services/event-handle.service';
import { HelperService } from '../../services/helper.service';
import { Store } from '@ngrx/store';
import * as Models from './../../models';
import * as GameActions from './../../store/actions';
import * as Selectors from './../../store/selectors';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {

  constructor(
    private eventHandler: EventHandleService,
    private helperService: HelperService,
    private ref: ElementRef,
    private socket: Socket,
    private _store: Store<Models.GameState>
  ) {
    helperService.globalClick$.subscribe(click => {
      this.clearSwapButton();
    });
  }
  @HostBinding('attr.data-tile-id') @Input() index: number;
  @Input() letter: string;

  public displaySwap = false;

  @HostBinding('draggable') true;

  ngOnInit(): void {

  }

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
    this._store.select(Selectors.getPlayerTiles).pipe(first()).subscribe(tiles => {
      const letter = this.eventHandler.handleSwap(this.index, tiles);
    })
    this._store.dispatch(new GameActions.SwapTiles(this.letter));
    this.clearSwapButton();
  }

  clearSwapButton = () => {
    this.displaySwap = false;
  }
}
