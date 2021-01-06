import {Component, OnInit} from '@angular/core';

/**
 * Graphic component to display a card with a colored header
 *
 * It uses ng-content to render the content of the card
 *
 * Insert a Header with <gen-card-header> : {@link CardHeaderComponent}
 * Insert some Actions buttons in the header with <gen-card-actions> : {@link CardActionsComponent}
 *
 * Insert the body button with <gen-card-body> : {@link CardBodyComponent}
 *
 * A <gen-card-image> ({@link CardImageComponent})
 * can be added to display a centered image on the left of the card
 */
@Component({
  selector: 'gen-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

}
