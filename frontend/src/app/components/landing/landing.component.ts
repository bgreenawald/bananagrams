import { Component, OnInit } from '@angular/core';
import { RenderService } from '../../services/render.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  public gameIDs: any;
  public suggestedID: number;
  private baseURL = "http://localhost:5000/api/";

  constructor(
    private apiService: ApiService,
    private renderService: RenderService,
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.getIDs()
    this.generateNewID();
  }

  getIDs = () => {
    this.apiService.getIDs()
      .subscribe(ids => this.gameIDs = ids);
  }

  generateNewID = () => {
    this.suggestedID = this.renderService.generateID();
  }

  createGame = (id: string) => {

  }

}
