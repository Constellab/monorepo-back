import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'ha-public-edit-brick-page',
  templateUrl: './ha-public-edit-brick-page.component.html',
  styleUrls: ['./ha-public-edit-brick-page.component.scss']
})
export class HaPublicEditBrickPageComponent implements OnInit {

  loaded = false;

  constructor() {
  }

  ngOnInit(): void {
    this.loaded = true;
  }

}
