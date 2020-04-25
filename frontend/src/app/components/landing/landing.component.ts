import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { RenderService } from '../../services/render.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  public gameIDs: any;
  public suggestedID: number;
  public error: string;
  private baseURL = "http://localhost:5000/api/";

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private renderService: RenderService,
    private route: ActivatedRoute,
    private router: Router,
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
    let submittedID: number = Number(id.trim());
    if (!id) { return; }
    if (this.isIDUnique(submittedID)) {
      this.router.navigate(['/game', { id: submittedID }]);
    }
    else {
      this.error = "ID not available.  Please choose a different room."
    }
  }

  private isIDUnique = (id: number): boolean => {
    return !this.gameIDs.contains(id);
  }
}
