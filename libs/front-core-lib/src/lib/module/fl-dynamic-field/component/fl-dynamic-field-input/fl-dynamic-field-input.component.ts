import {Component, Input, OnInit} from '@angular/core';
import {FlDynamicFieldAbstractDirective} from '../../model/fl-dynamic-field-abstract.directive';

@Component({
  selector: 'fl-dynamic-field-input',
  templateUrl: './fl-dynamic-field-input.component.html',
  styleUrls: ['./fl-dynamic-field-input.component.scss']
})
export class FlDynamicFieldInputComponent extends FlDynamicFieldAbstractDirective
  implements OnInit {

  @Input() prefix: string;

  @Input() suffix: string;

  @Input() inputType: 'text' | 'number';

  @Input() min: number;

  @Input() max: number;

  @Input() integer: boolean;

  ngOnInit(): void {
  }

}
