import {Component, Input, OnInit} from '@angular/core';

/**
 * Simple graphic component to display a round image on the left of the card
 *
 * It support ng-content to display something (mainly text) centered under the image
 */
@Component({
  selector: 'gen-card-image',
  templateUrl: './card-image.component.html',
  styleUrls: ['./card-image.component.scss']
})
export class CardImageComponent implements OnInit {

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
