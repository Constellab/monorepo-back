import {Component, Input, OnInit} from '@angular/core';

export interface HaDocTitle {
  title: string;
  id: string;
  level: number;
}

@Component({
  selector: 'ha-public-brick-right-panel',
  templateUrl: './ha-public-brick-right-panel.component.html',
  styleUrls: ['./ha-public-brick-right-panel.component.scss']
})
export class HaPublicBrickRightPanelComponent implements OnInit {

  @Input()
  brickName: string;
  @Input()
  brickVersion: string;
  @Input()
  currentPage: string;
  @Input()
  docTitles?: HaDocTitle[];

  @Input()
  currentPageAsTranslation: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
