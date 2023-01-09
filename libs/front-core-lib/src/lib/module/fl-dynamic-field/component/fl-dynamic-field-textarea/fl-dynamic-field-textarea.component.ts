import {Component, OnInit} from '@angular/core';
import {FlDynamicFieldAbstractDirective} from '../../model/fl-dynamic-field-abstract.directive';

@Component({
  selector: 'fl-dynamic-field-textarea',
  templateUrl: './fl-dynamic-field-textarea.component.html',
  styleUrls: ['./fl-dynamic-field-textarea.component.scss']
})
export class FlDynamicFieldTextareaComponent extends FlDynamicFieldAbstractDirective
  implements OnInit {

  ngOnInit(): void {
  }

}
