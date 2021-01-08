import {Component, Input, OnInit} from '@angular/core';

/**
 * Graphic component to show a round image with a light shadow
 *
 * It support ng-content to display something (mainly text) centered under the image
 *
 */
@Component({
  selector: 'fl-round-image',
  templateUrl: './fl-round-image.component.html',
  styleUrls: ['./fl-round-image.component.scss']
})
export class FlRoundImageComponent implements OnInit {

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
