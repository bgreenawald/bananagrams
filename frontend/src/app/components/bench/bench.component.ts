import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-bench',
  templateUrl: './bench.component.html',
  styleUrls: ['./bench.component.scss']
})
export class BenchComponent implements OnInit {
  @Input() tiles: string[];

  constructor(
    private app: AppComponent
  ) { }

  ngOnInit(): void {
  }
}
