import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import * as Selectors from '../../store/selectors';
import * as GameActions from '../../store/actions/game.actions';
import { ApiService } from '../../services/api.service';
import { Actions } from '@ngrx/effects';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
  public reservedGameIDs: any;
  public suggestedID: number = 0;
  public error: string = '';
  public ngDestroyed$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private _store: Store
  ) {
  }

  ngOnInit(): void {
    this._generateNewID();
    this._store.dispatch(GameActions.loadReservedGameIds());
    this._getReservedIDsFromStore();
  }

  public ngOnDestroy() {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }

  private _getReservedIDsFromStore = () => {
    this._store.select(Selectors.getReservedGameIDs).pipe(takeUntil(this.ngDestroyed$)).subscribe(gameIDs => this.reservedGameIDs = gameIDs);
  }

  private _generateNewID = (): void => {
    const min = 0;
    const max = 9999;
    this.suggestedID = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public regenerateID = (): void => {
    this._generateNewID();
  }

  public joinGame = (gameID: string): void => {
    this.router.navigate(['/lobby', gameID]);
  }
}