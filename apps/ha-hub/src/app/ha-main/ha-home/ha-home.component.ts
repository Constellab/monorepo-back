import {Component, OnInit} from '@angular/core';
import {HaConstellabHelper} from '../../ha-core/ha-model/ha-config/ha-constellab.helper';

@Component({
  selector: 'ha-ha-home',
  templateUrl: './ha-home.component.html',
  styleUrls: ['./ha-home.component.scss']
})
export class HaHomeComponent implements OnInit {

  constellabUrl: string = HaConstellabHelper.getConstellabUrl();

  constructor() {
  }

  ngOnInit(): void {
  }

}
