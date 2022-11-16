import {Component, OnInit} from '@angular/core';

/**
 * Graphic component to display a card with a colored header
 *
 * It uses ng-content to render the content of the card
 *
 * Insert a Header with <fl-card-header> : {@link FlCardHeaderComponent}
 * Insert some Actions buttons in the header with <fl-card-actions> : {@link FlCardActionsComponent}
 *
 * Insert the body button with <fl-card-body> : {@link FlCardBodyComponent}
 *
 * A <fl-card-image> ({@link FlCardImageComponent})
 * can be added to display a centered image on the left of the card
 */
@Component({
  selector: 'fl-card',
  templateUrl: './fl-card.component.html',
  styleUrls: ['./fl-card.component.scss'],
})
export class FlCardComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

}
