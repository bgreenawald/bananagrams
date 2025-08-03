import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CellComponent } from '../cell/cell.component';
import { TileComponent } from '../tile/tile.component';

@Component({
  selector: 'app-bench',
  standalone: true,
  imports: [CommonModule, CellComponent, TileComponent],
  templateUrl: './bench.component.html',
  styleUrls: ['./bench.component.scss']
})
export class BenchComponent implements OnInit {
  @Input() tiles: string[] = [];

  constructor() { }

  ngOnInit(): void {
  }
}