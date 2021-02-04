import { Component, OnInit, Input, ElementRef, HostListener, HostBinding, Directive, Host, ChangeDetectorRef } from '@angular/core';

import { EventHandleService } from '../../services/event-handle.service';

import { Tile } from './../../../models/models';
import { MessageBusService } from '../../services/message-bus.service';

// @Directive({
//   selector: '[row]'
// })
@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements OnInit {
  @HostBinding('attr.data-row') @Input() row!: number;
  @HostBinding('attr.data-column') @Input() column!: number;
  // public childTile: Tile;
  @Input('tile') childTile: Tile;
  private _moveCell$ = this.messageBusService.moveChildTile$;
  private _removeTile$ = this.messageBusService.removeChildTile$;

  constructor(
    private cdRef: ChangeDetectorRef,
    private ref: ElementRef,
    private eventHandler: EventHandleService,
    private messageBusService: MessageBusService
  ) { }

  ngOnInit(): void {
    this.listenMoveCell();
    this.removeChildTile();
  }

  @HostListener('dragenter', ['$event'])
  handleDragEnter = ($event) => {
    this.eventHandler.handleDragEnter($event);
  }

  @HostListener('dragleave', ['$event'])
  handleDragLeave = ($event) => {
    this.eventHandler.handleDragLeave($event);
  }

  @HostListener('dragover', ['$event'])
  handleDragOver = ($event) => {
    this.eventHandler.handleDragOver($event);
  }

  @HostListener('dragend', ['$event'])
  handleDragEnd = ($event) => {
    $event.target.classList.remove('over')
  }

  @HostListener('drop', ['$event'])
  handleDrop = ($event) => {
    this.eventHandler.handleDrop($event);
  }

  @HostBinding('class') class = 'cell';
  @HostBinding('class.filled') get filledClass() { return !!this.childTile; }

  @HostListener('click', ['$event'])
  handleClick = ($event) => {
    console.log('cell clicked!')
  }

  listenMoveCell = () => {
    this._moveCell$.subscribe(data => {
      if ((data.row === this.row) && (data.column == this.column)) {
        this.childTile = {
          id: data.id,
          letter: data.letter
        }
      }
    })
  }

  removeChildTile = () => {
    this._removeTile$.subscribe(originCell => {
      if ((originCell.row === this.row) && (originCell.column === this.column)) {
        this.childTile = null;
      }
    })
  }
}
