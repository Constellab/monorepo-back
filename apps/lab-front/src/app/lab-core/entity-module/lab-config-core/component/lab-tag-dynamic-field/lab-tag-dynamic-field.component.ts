import {Component, OnInit} from '@angular/core';
import {FlDynamicFieldAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'lab-tag-dynamic-field',
  templateUrl: './lab-tag-dynamic-field.component.html',
  styleUrls: ['./lab-tag-dynamic-field.component.scss']
})
export class LabTagDynamicFieldComponent extends FlDynamicFieldAbstractDirective
  implements OnInit {


  ngOnInit(): void {
  }

}
