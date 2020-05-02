import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements OnInit {
  @Input() row!: number;
  @Input() column!: number;

  constructor() { }

  ngOnInit(): void {
    console.log(this.row)
  }

}
