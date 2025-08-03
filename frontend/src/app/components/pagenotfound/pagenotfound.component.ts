import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagenotfound',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagenotfound.component.html',
  styleUrls: ['./pagenotfound.component.scss']
})
export class PagenotfoundComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}