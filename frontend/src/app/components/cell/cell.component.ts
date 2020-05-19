import { Component, OnInit, Input, ElementRef } from '@angular/core';

import { EventHandleService } from '../../services/event-handle.service';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements OnInit {
  @Input() row!: number;
  @Input() column!: number;

  constructor(
    private ref: ElementRef,
    private eventHandler: EventHandleService
  ) { }

  ngOnInit(): void {
  }

  handleOnMouseDown = (e) => {
    // console.log('mouse down')
    // this.eventHandler.handleOnMouseDown(e);
  }

  handleDragEnter = (e) => {
    this.eventHandler.handleDragEnter(e);
  }

  handleDragLeave = (e) => {
    this.eventHandler.handleDragLeave(e);
  }

  handleDragOver = (e) => {
    this.eventHandler.handleDragOver(e);
  }

  handleDragEnd = (e) => {
    e.target.classList.remove('over')
  }

  handleDrop = (e) => {
    this.eventHandler.handleDrop(e);
  }


}
