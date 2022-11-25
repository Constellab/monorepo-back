import {Component, OnDestroy, OnInit} from '@angular/core';
import {FlDynamicFieldAbstractDirective} from '@monorepo/front-core-lib';

/**
 * Component used under {@link FlDynamicFieldComponent} to show
 * tag input
 */
@Component({
  selector: 'lab-tag-dynamic-field',
  templateUrl: './lab-tag-dynamic-field.component.html',
  styleUrls: ['./lab-tag-dynamic-field.component.scss']
})
export class LabTagDynamicFieldComponent extends FlDynamicFieldAbstractDirective
  implements OnInit, OnDestroy {


  ngOnInit(): void {
    console.log("LabTagDynamicFieldComponent.ngOnInit");
  }

  ngOnDestroy(): void {
    console.log("LabTagDynamicFieldComponent.ngOnDestroy");
  }

}
