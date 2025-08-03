import { Component, OnInit, Input, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellComponent } from '../cell/cell.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, CellComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BoardComponent implements OnInit, AfterViewInit {
  @Input('rows') rowNumber!: number;
  @Input('columns') columnNumber!: number;

  constructor(
    private ref: ElementRef
  ) { }

  public rows: number[] = [];
  public columns: number[] = [];

  ngOnInit(): void {
    this.rows = new Array(Number(this.rowNumber)).fill(null).map((x, i) => i);
    this.columns = new Array(Number(this.columnNumber)).fill(null).map((x, i) => i);
  }

  ngAfterViewInit(): void {
    this.centerBoard();
  }

  centerBoard = (): void => {
    const scrollPositionX = this.ref.nativeElement.offsetLeft + (this.ref.nativeElement.offsetWidth / 3);
    const scrollPositionY = this.ref.nativeElement.offsetTop + (this.ref.nativeElement.offsetHeight / 4);

    this.ref.nativeElement.scrollLeft = scrollPositionX;
    this.ref.nativeElement.scrollTop = scrollPositionY;
  }
}