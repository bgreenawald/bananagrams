import { Component, OnInit, Input, ElementRef, HostListener, HostBinding, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventHandleService } from '../../services/event-handle.service';
import { Tile } from '../../interfaces';
import { MessageBusService } from '../../services/message-bus.service';
import { TileComponent } from '../tile/tile.component';

@Component({
  selector: 'app-cell',
  standalone: true,
  imports: [CommonModule, TileComponent],
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements OnInit {

  constructor(
    private cdRef: ChangeDetectorRef,
    private ref: ElementRef,
    private eventHandler: EventHandleService,
    private messageBusService: MessageBusService
  ) { }

  @HostBinding('class.filled') get filledClass() { return !!this.childTile; }
  @HostBinding('attr.data-row') @Input() row!: number;
  @HostBinding('attr.data-column') @Input() column!: number;
  @Input('tile') childTile: Tile | null = null;
  
  private _moveCell$ = inject(MessageBusService).moveChildTile$;
  private _removeTile$ = inject(MessageBusService).removeChildTile$;

  @HostBinding('class') class = 'cell';

  ngOnInit(): void {
    this.listenMoveCell();
    this.removeChildTile();
  }

  @HostListener('dragenter', ['$event'])
  handleDragEnter = ($event: DragEvent) => {
    this.eventHandler.handleDragEnter($event);
  }

  @HostListener('dragleave', ['$event'])
  handleDragLeave = ($event: DragEvent) => {
    this.eventHandler.handleDragLeave($event);
  }

  @HostListener('dragover', ['$event'])
  handleDragOver = ($event: DragEvent) => {
    this.eventHandler.handleDragOver($event);
  }

  @HostListener('dragend', ['$event'])
  handleDragEnd = ($event: DragEvent) => {
    ($event.target as HTMLElement).classList.remove('over');
  }

  @HostListener('drop', ['$event'])
  handleDrop = ($event: DragEvent) => {
    this.eventHandler.handleDrop($event);
  }

  @HostListener('click', ['$event'])
  handleClick = ($event: Event) => {
    console.log('cell clicked!');
  }

  listenMoveCell = () => {
    this._moveCell$.subscribe((data: any) => {
      if ((data.row === this.row) && (data.column == this.column)) {
        this.childTile = {
          id: data.id,
          letter: data.letter
        };
      }
    });
  }

  removeChildTile = () => {
    this._removeTile$.subscribe((originCell: any) => {
      if ((originCell.row === this.row) && (originCell.column === this.column)) {
        this.childTile = null;
      }
    });
  }
}