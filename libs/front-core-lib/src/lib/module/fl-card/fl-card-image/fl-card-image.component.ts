import {Component, Input, OnInit} from '@angular/core';

/**
 * Simple graphic component to display a round image on the left of the card
 *
 * It support ng-content to display something (mainly text) centered under the image
 */
@Component({
  selector: 'fl-card-image',
  templateUrl: './fl-card-image.component.html',
  styleUrls: ['./fl-card-image.component.scss']
})
export class FlCardImageComponent implements OnInit {

  /**
   * Image url
   */
  @Input() imageUrl: string;

  /**
   * Size of the image. Support all css sizes.
   */
  @Input() size: string = '3em';

  constructor() {
  }

  ngOnInit(): void {
  }

}
