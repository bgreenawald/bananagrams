import { Component, OnInit, Input, ElementRef, HostListener, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';

import { SocketService } from '../../services/socket.service';
import { EventHandleService } from '../../services/event-handle.service';
import { HelperService } from '../../services/helper.service';
import { GameState } from '../../interfaces';
import * as UserActions from '../../store/actions/user.actions';
import * as Selectors from '../../store/selectors';

@Component({
  selector: 'app-tile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {

  constructor(
    private eventHandler: EventHandleService,
    private helperService: HelperService,
    private ref: ElementRef,
    private socketService: SocketService,
    private _store: Store<{ game: GameState }>
  ) {
    helperService.globalClick$.subscribe(click => {
      this.clearSwapButton();
    });
  }

  @HostBinding('attr.data-tile-id') @Input() index: number | string = '';
  @Input() letter: string = '';

  public displaySwap = false;

  @HostBinding('draggable') draggable: boolean = true;

  ngOnInit(): void {

  }

  @HostListener('click', ['$event'])
  handleClick = ($event: Event) => {
    this.eventHandler.handleClick($event, this.ref.nativeElement);
  }

  @HostListener('dblclick', ['$event'])
  handleDoubleClick = ($event: Event) => {
    this.displaySwap = !this.displaySwap;
  }

  @HostListener('dragstart', ['$event'])
  handleDragStart = ($event: DragEvent) => {
    this.eventHandler.handleDragStart($event);
  }

  @HostListener('dragend', ['$event'])
  handleDragEnd = ($event: DragEvent) => {
    this.eventHandler.handleDragEnd($event);
  }

  handleSwap = ($event: Event) => {
    this._store.select(Selectors.getPlayerTiles).pipe(first()).subscribe(tiles => {
      const letter = this.eventHandler.handleSwap(Number(this.index), tiles);
    });
    this._store.dispatch(UserActions.swapTiles({ letter: this.letter }));
    this.clearSwapButton();
  }

  clearSwapButton = () => {
    this.displaySwap = false;
  }
}