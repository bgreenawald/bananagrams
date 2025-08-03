import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gameover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gameover.component.html',
  styleUrls: ['./gameover.component.scss']
})
export class GameoverComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}