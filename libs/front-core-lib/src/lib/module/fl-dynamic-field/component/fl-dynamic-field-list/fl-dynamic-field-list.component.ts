import {Component, Input, OnInit} from '@angular/core';
import {FlDynamicFieldAbstractDirective} from '../../model/fl-dynamic-field-abstract.directive';

@Component({
  selector: 'fl-dynamic-field-list',
  templateUrl: './fl-dynamic-field-list.component.html',
  styleUrls: ['./fl-dynamic-field-list.component.scss']
})
export class FlDynamicFieldListComponent extends FlDynamicFieldAbstractDirective
  implements OnInit {

  @Input() prefix: string;

  @Input() suffix: string;

  ngOnInit(): void {
  }

}
