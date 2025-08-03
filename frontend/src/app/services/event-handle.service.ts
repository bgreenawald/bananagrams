import { Injectable } from '@angular/core';
import { HelperService } from './helper.service';
import { ErrorService } from './error.service';
import { Subject } from 'rxjs';
import { MessageBusService } from './message-bus.service';

@Injectable({
  providedIn: 'root'
})
export class EventHandleService {
  // HTMLElement is of type app-tile
  public selectedTiles: HTMLElement[] = [];
  public tilesToDrag: any[] = [];
  private _emptyCellColumns: number[] = [];
  private _removeCells = new Subject<number[]>();
  public removeCell$ = this._removeCells.asObservable();

  constructor(
    private errorService: ErrorService,
    private helperService: HelperService,
    private _messageBusService: MessageBusService
  ) { }

  handleClick = (e: Event, appTile?: HTMLElement) => {
    e.preventDefault();
    const tile = this.getTile(e.target as HTMLElement, appTile);

    this.errorService.clearError();
    this.toggleSelectedClass(tile);
  }

  getTile = (targetElement: HTMLElement, appTile?: HTMLElement): HTMLElement | null => {
    let tile: HTMLElement | null = null;
    if (targetElement.tagName === 'APP-TILE') {
      tile = targetElement;
    }
    else if (appTile) {
      tile = appTile;
    }
    return tile;
  }

  toggleSelectedClass = (tile: HTMLElement | null) => {
    if (tile) {
      const classes = tile.classList;
      if (classes.contains('selected')) {
        classes.remove('selected');
      }
      else {
        classes.add('selected');
      }
    }
  }

  handleDragStart = (e: DragEvent) => {
    const currentTile = e.target as HTMLElement;
    if (!this.selectedTiles.includes(currentTile)) {
      // dataset.tileId is casing is determined by the DOM.
      const tileID = (e.target as HTMLElement).dataset['tileId'];
      const tile = document.querySelector(`app-tile[data-tile-id='${tileID}']`);
      if (tile) {
        tile.classList.add('selected');
      }
    }

    (e.target as HTMLElement).style.cursor = 'grabbing';
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text', (e.target as HTMLElement).dataset['tileId'] || '');
    }
  }

  handleDragEnd = (e: DragEvent) => {
    e.preventDefault();
    this.selectedTiles.forEach(tile => {
      tile.classList.remove('selected');
    });
    this.selectedTiles = [];
  }

  handleDoubleClick = (e: Event) => {
    e.preventDefault();
    return false;
  }

  handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (target.children.length === 0) {
      target.classList.add('over');
    }
  }

  handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (target.classList.contains('over')) {
      target.classList.remove('over');
    }
  }

  handleDragOver = (e: DragEvent) => {
    if (e.preventDefault) { e.preventDefault(); }
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    return false;
  }

  handleOnMouseDown = (e: MouseEvent) => {
    if (e.preventDefault) { e.preventDefault(); }
    return false;
  }

  handleSwap = (activeTileID: number, tilesArray: string[]) => {
    const tileToRemove = document.querySelector(`app-tile[data-tile-id="${activeTileID}"]`);
    if (!tileToRemove) return '';
    
    const parentCell = tileToRemove.parentElement;
    const letterElement = tileToRemove.children[0] as HTMLElement;
    const letter = letterElement ? letterElement.textContent || '' : '';

    if (parentCell) {
      this.clearParentCell(parentCell);
    }
    this._removeCells.next(this._emptyCellColumns);
    this._emptyCellColumns = [];

    return letter;
  }

  clearSelectedTiles = () => {
    const selectedTiles = Array.from(document.querySelectorAll('app-tile.selected'));
    selectedTiles.forEach(tile => {
      tile.classList.remove('selected');
    });
  }

  handleDrop = (e: DragEvent) => {
    e.preventDefault();

    const primaryDestinationCell = e.target as HTMLElement;

    // Get the tile ID and handle the null case
    const id = e.dataTransfer?.getData('text') || '';

    if (id === null || id.trim() === '') {
      if (primaryDestinationCell.classList.contains('over')) {
        primaryDestinationCell.classList.remove('over');
      }
      return;
    }

    const primaryTile = document.querySelector(`app-tile[data-tile-id="${id}"]`);
    if (!primaryTile) return;

    const [rowChange, columnChange] = this.calculateDistanceChange(primaryTile as HTMLElement, primaryDestinationCell);

    // move additional cells
    const selectedTiles = Array.from(document.querySelectorAll('app-tile.selected'));
    if (selectedTiles.length > 0) {
      selectedTiles.forEach((tile, i) => {
        this.moveTile(tile as HTMLElement, rowChange, columnChange);
      });
    }

    this.tilesToDrag = [];
    this.clearSelectedTiles();
    this._removeCells.next(this._emptyCellColumns);
    this._emptyCellColumns = [];
    primaryDestinationCell.classList.remove('over');
  }

  calculateDistanceChange = (primaryTile: HTMLElement, primaryDestinationCell: HTMLElement): [number, number] => {
    const sourceRow = Number(primaryTile.parentElement?.dataset['row'] || 0);
    const sourceColumn = Number(primaryTile.parentElement?.dataset['column'] || 0);

    const destinationRow = Number(primaryDestinationCell.dataset['row'] || 0);
    const destinationColumn = Number(primaryDestinationCell.dataset['column'] || 0);

    const rowChange = destinationRow - sourceRow;
    const columnChange = destinationColumn - sourceColumn;

    return [rowChange, columnChange];
  }

  moveTile = (tile: HTMLElement, rowChange: number, columnChange: number) => {
    const tileID = tile.dataset['tileId'];
    const currentTile = document.querySelector(`app-tile[data-tile-id="${tileID}"]`);
    if (!currentTile) return;

    const letterSpan = currentTile.querySelector('span');
    const letter = letterSpan ? letterSpan.textContent || '' : '';

    const newChildTile = {
      id: tileID || '',
      letter
    };

    // tile is of type app-tile
    const parentCell = tile.parentElement;
    if (!parentCell) return;

    const sourceRow = Number(parentCell.dataset['row'] || 0);
    const sourceColumn = Number(parentCell.dataset['column'] || 0);

    const destinationRow = rowChange + sourceRow;
    const destinationColumn = columnChange + sourceColumn;

    const secondaryDestination = document.querySelector(
      `#board app-cell[data-row="${destinationRow}"][data-column="${destinationColumn}"]`
    );
    
    if (!secondaryDestination) return;

    const destinationCell = {
      row: destinationRow,
      column: destinationColumn
    };

    // if desired target cell has no tile in it already
    if (secondaryDestination.children.length === 0) {
      this._messageBusService.addChildTile(
        newChildTile, destinationCell);
      // if bench cell, remove
      this.clearParentCell(parentCell);
      tile.dataset['row'] = destinationRow.toString();
      tile.dataset['column'] = destinationColumn.toString();
    }
  }

  clearParentCell = (parentCell: HTMLElement) => {
    const parentElement = parentCell.parentElement;
    if (parentElement && parentElement.id === 'bench') {
      this._emptyCellColumns.push(Number(parentCell.dataset['column'] || 0));
    }
    // else, clear child tile
    else {
      this._messageBusService.removeChildTile({
        row: parseInt(parentCell.dataset['row'] || '0'),
        column: parseInt(parentCell.dataset['column'] || '0')
      });
    }
  }
}