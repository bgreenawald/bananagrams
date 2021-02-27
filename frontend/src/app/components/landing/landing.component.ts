import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import * as fromStore from './../../store';
import * as Models from './../../models';
import { ApiService } from '../../services/api.service';
import { Actions } from '@ngrx/effects';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  public reservedGameIDs: any;
  public suggestedID: number;
  public error: string;
  private baseURL = "http://localhost:5000/api/";

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private _store: Store<Models.GameState>
  ) {
  }

  ngOnInit(): void {
    this._generateNewID();
    localStorage.clear();
    this._getReservedIDsFromStore();
  }

  private _getReservedIDsFromStore = () => {
    this._store.select(fromStore.getReservedGameIDs).subscribe(gameIDs => this.reservedGameIDs = gameIDs)
  }

  private _generateNewID = (): void => {
    const min = 0;
    const max = 999999;
    let random = Math.floor(Math.random() * (+max - +min)) + +min;
    this.suggestedID = random;
  }

  public createGame = (id: string) => {
    let submittedID: number = Number(id.trim());
    if (!id) { return; }
    if (this.isIDUnique(submittedID)) {
      this.router.navigate([`/lobby/${submittedID}`]);
    }
    this.error = "ID not available.  Please choose a different room."
  }

  private isIDUnique = (id: number): boolean => {
    console.log(this.reservedGameIDs)
    return !this.reservedGameIDs.includes(id);
  }
}
