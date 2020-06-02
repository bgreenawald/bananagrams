import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

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
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.getIDs()
    this._generateNewID();
    localStorage.clear();
  }

  getIDs = (): void => {
    this.apiService.getIDs()
      .subscribe(ids => this.gameIDs = ids);
  }

  private _generateNewID = (): void => {
    const min = 0;
    const max = 999999;
    let random = Math.floor(Math.random() * (+max - +min)) + +min;
    this.suggestedID = random;
  }

  createGame = (id: string) => {
    let submittedID: number = Number(id.trim());
    if (!id) { return; }
    if (this.isIDUnique(submittedID)) {
      this.router.navigate([`/lobby/${submittedID}`]);
    }
    else {
      this.error = "ID not available.  Please choose a different room."
    }
  }

  private isIDUnique = (id: number): boolean => {
    return !this.gameIDs.includes(id);
  }
}
