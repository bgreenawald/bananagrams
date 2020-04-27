import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private socket: Socket
  ) { }

  ngOnInit(): void {
    this.socketConnect();
  }

  socketConnect = (): void => {
    const id = +this.route.snapshot.paramMap.get('id');
    this.socket.on("connect", _ => {
      this.socket.emit("join", {
        "name": id
      })
    })

    this.socket.on("render_game", resp => {
      console.log(resp)
    })
  }


  getUserLetters = () => {
    const username = localStorage.getItem("player_id");
    const allTiles = JSON.parse(localStorage.getItem("players"));
    // for (player in allTiles) {
    //   if (player === username) {
    //     return allTiles[username];
    //   }
    // }
  }

  createTiles = (lettersArray) => {
    let tilesArray = [];
    Array.prototype.forEach.call(lettersArray, function (letter, index) {
      // tilesArray.push(`<div class="cell" data-row="0" data-column="${index}"><span class="tile" data-tile-id="${numberOfTiles}" draggable="true">${letter}</span></div>`);
      // numberOfTiles += 1;
    });

    return tilesArray;
  };


  fillCells = (parentId, childrenArrayOrCellNumber) => {
    const parent = document.getElementById(parentId);
    if (typeof (childrenArrayOrCellNumber) === "number") {
      let num = childrenArrayOrCellNumber;
      for (let i = 0; i < num; i++) {
        parent.innerHTML += `<div class="cell"></div>`;
      }
    } else if (Array.isArray(childrenArrayOrCellNumber)) {
      // children.forEach(child => {
      //   parent.innerHTML += child;
      // })
    }
  }

  populate = (parentid, childrenArray) => {
    const parent = document.getElementById(parentid);
    childrenArray.forEach(child => {
      parent.innerHTML += child;
    })
  }

  selectAllTiles = () => {
    var board = document.querySelector("#board");
    Array.from(document.querySelectorAll('.tile')).forEach(tile => {
      if (board.contains(tile)) {
        tile.classList.add('selected')
      }
    })
  }


}
