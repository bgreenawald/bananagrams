import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as Selectors from '../../store/selectors';
import * as GameActions from '../../store/actions/game.actions';
import * as UserActions from '../../store/actions/user.actions';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit, OnDestroy {
  public gameID: string = '';
  public playerID: string = '';
  public players: any[] = [];
  public gameData: any = null;
  private ngDestroyed$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _store: Store
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.gameID = params['id'];
      this.initializeGame();
    });
    
    this.listenToStore();
  }

  ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }

  initializeGame(): void {
    this._store.dispatch(GameActions.setGameId({ gameID: this.gameID }));
    this._store.dispatch(GameActions.loadOrCreateGame({ gameID: this.gameID }));
  }

  listenToStore(): void {
    this._store.select(Selectors.selectGameData)
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe(data => {
        this.gameData = data;
        if (data?.players) {
          this.players = Object.keys(data.players).map(key => ({
            id: key,
            tiles: data.players[key]
          }));
        }
      });
  }

  setPlayerName(name: string): void {
    this.playerID = name;
    localStorage.setItem('player_id', name);
    this._store.dispatch(GameActions.setPlayerId({ 
      gameID: this.gameID, 
      playerName: name 
    }));
  }

  startGame(): void {
    this._store.dispatch(GameActions.startGame({ gameID: this.gameID }));
    this.router.navigate(['/game', this.gameID]);
  }
}