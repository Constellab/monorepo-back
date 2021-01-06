import {Component, OnInit} from '@angular/core';

/**
 * Header of the <gen-card> {@link CardComponent}
 *
 * Can contain a <gen-card-actions> {@link CardActionsComponent}
 */
@Component({
  selector: 'gen-card-header',
  templateUrl: './card-header.component.html',
  styleUrls: ['./card-header.component.scss']
})
export class CardHeaderComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

}
