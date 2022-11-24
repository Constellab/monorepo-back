import {Component, OnInit} from '@angular/core';
import {FlDynamicFieldAbstractDirective} from '../../model/fl-dynamic-field-abstract.directive';

@Component({
  selector: 'fl-dynamic-field-boolean',
  templateUrl: './fl-dynamic-field-boolean.component.html',
  styleUrls: ['./fl-dynamic-field-boolean.component.scss']
})
export class FlDynamicFieldBooleanComponent extends FlDynamicFieldAbstractDirective
  implements OnInit {


  ngOnInit(): void {
  }

}
