import {Component, Input, OnInit} from '@angular/core';
import {FlDynamicFieldAbstractDirective} from '../../model/fl-dynamic-field-abstract.directive';

@Component({
  selector: 'fl-dynamic-field-select',
  templateUrl: './fl-dynamic-field-select.component.html',
  styleUrls: ['./fl-dynamic-field-select.component.scss']
})
export class FlDynamicFieldSelectComponent extends FlDynamicFieldAbstractDirective
  implements OnInit {

  @Input() selectOptions: any[];

  @Input() prefix: string;

  @Input() suffix: string;

  ngOnInit(): void {
  }

}
