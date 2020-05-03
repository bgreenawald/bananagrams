import { Component, OnInit, Input } from '@angular/core';

import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-bench',
  templateUrl: './bench.component.html',
  styleUrls: ['./bench.component.scss']
})
export class BenchComponent implements OnInit {
  @Input() tiles: string[];
  // @Input() index: number[];

  constructor(
    private app: AppComponent
  ) { }

  ngOnInit(): void {
    console.log(this.tiles)
    // this._generateTileIndex();
  }

  // private _generateTileIndex = () => {
  //   const length = this.tiles.length;
  //   this.index = Array(length).fill(null).map((x, i) => i);
  // }
}
