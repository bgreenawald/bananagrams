import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BoardComponent implements OnInit {
  @Input("rows") rowNumber!: number;
  @Input("columns") columnNumber!: number;

  constructor(
  ) { }

  public rows: number[];
  public columns: number[];


  ngOnInit(): void {
    this.rows = new Array(Number(this.rowNumber)).fill(null).map((x, i) => i);
    this.columns = new Array(Number(this.rowNumber)).fill(null).map((x, i) => i);
  }

}