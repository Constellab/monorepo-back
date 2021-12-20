import {Directive, Input} from '@angular/core';
import {FlMouseHoverPortalAbstractDirective, FlMouseHoverPortalConfig} from '@monorepo/front-core-lib';
import {LabProcessTypePortalComponent} from '../component/lab-process-type-portal/lab-process-type-portal.component';
import {LabProcessType} from '../../../model/entities/lab-type/lab-process-type.entity';

/**
 * Directive to open a portal to show process type detail on element hover
 */
@Directive({
  selector: '[labProcessTypeHoverDetail]'
})
export class LabProcessTypeHoverDetailDirective extends FlMouseHoverPortalAbstractDirective {

  @Input() labProcessTypeHoverDetail: LabProcessType;

  getConfig(): FlMouseHoverPortalConfig | null {
    return {
      component: LabProcessTypePortalComponent,
      portalTagName: 'GEN-BIOX-PROCESS-TYPE-PORTAL',
      position: ['left', 'right', 'top', 'bottom'],
      data: this.labProcessTypeHoverDetail
    };
  }

  onPortalClosed(): void {
  }

  onPortalOpened(): void {
  }


}
