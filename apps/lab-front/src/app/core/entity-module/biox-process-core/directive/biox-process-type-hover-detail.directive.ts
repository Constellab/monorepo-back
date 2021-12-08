import {Directive, Input} from '@angular/core';
import {FlMouseHoverPortalAbstractDirective, FlMouseHoverPortalConfig} from '@monorepo/front-core-lib';
import {BioxProcessTypePortalComponent} from '../component/biox-process-type-portal/biox-process-type-portal.component';
import {BioxProcessType} from '../../../model/entities/lab-type/biox-process-type.entity';

/**
 * Directive to open a portal to show process type detail on element hover
 */
@Directive({
  selector: '[genBioxProcessTypeHoverDetail]'
})
export class BioxProcessTypeHoverDetailDirective extends FlMouseHoverPortalAbstractDirective {

  @Input() genBioxProcessTypeHoverDetail: BioxProcessType;

  getConfig(): FlMouseHoverPortalConfig | null {
    return {
      component: BioxProcessTypePortalComponent,
      portalTagName: 'GEN-BIOX-PROCESS-TYPE-PORTAL',
      position: ['left', 'right', 'top', 'bottom'],
      data: this.genBioxProcessTypeHoverDetail
    };
  }

  onPortalClosed(): void {
  }

  onPortalOpened(): void {
  }


}
