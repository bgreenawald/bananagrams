import { Component, OnInit, Input, ElementRef, HostListener, HostBinding, Directive } from '@angular/core';

import { EventHandleService } from '../../services/event-handle.service';

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

  constructor(
    private ref: ElementRef,
    private eventHandler: EventHandleService
  ) { }

  ngOnInit(): void {
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
  // @HostBinding('attr.data-row') 0;
  // @HostBinding('att.data-column') = this.column;
}
