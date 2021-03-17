import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-bench',
  templateUrl: './bench.component.html',
  styleUrls: ['./bench.component.scss']
})
export class BenchComponent implements OnInit {
  @Input() tiles: string[];

  constructor(
  ) { }

  ngOnInit(): void {
  }
}
