import {Component, OnInit} from '@angular/core';
import {FlAbstractLoaderDirective} from '../fl-abstract-loader.directive';

/**
 * Loader component, the size can be set with the input or set with CSS. If you
 * set the size with css, also set the min-width and min-height to avoid non circle loader
 *
 * Small : 30px
 *
 * Medium : 50px
 *
 * Large : 100px
 *
 * Extra-large : 150px
 *
 * Custom size in px
 */
@Component({
  selector: 'fl-loader',
  templateUrl: './fl-loader.component.html',
  styleUrls: ['./fl-loader.component.scss']
})
export class FlLoaderComponent extends FlAbstractLoaderDirective implements OnInit {


  ngOnInit(): void {
  }
}
