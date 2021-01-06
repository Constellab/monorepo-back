import {Component, OnInit} from '@angular/core';

/**
 * The actions on top right of the <gen-card> {@link CardComponent}
 *
 * Child of the <gen-card-header> {@link CardHeaderComponent}
 */
@Component({
  selector: 'gen-card-actions',
  templateUrl: './card-actions.component.html',
  styleUrls: ['./card-actions.component.scss']
})
export class CardActionsComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

}
