import {Directive, Input} from '@angular/core';
import {FlMouseHoverPortalAbstractDirective, FlMouseHoverPortalConfig} from '@monorepo/front-core-lib';
import {CaUser} from '../../../model/entities/ca-user.class';
import {CaUserInfoPortalComponent} from '../component/ca-user-info-portal/ca-user-info-portal.component';

@Directive({
  selector: '[caMouseHoverUserPortal]'
})
export class CaMouseHoverUserPortalDirective extends FlMouseHoverPortalAbstractDirective {

  @Input()
  data: CaUser;

  getConfig(): FlMouseHoverPortalConfig | null {
    return  {
      data : this.data,
      position : ['left', 'bottom', 'top', 'right'],
      component: CaUserInfoPortalComponent,
      portalTagName: 'CA-USER-INFO-PORTAL',
      overlayConfig: {
        disposeOnNavigation: true
      }
    };
  }

  onPortalClosed(): void {
  }

  onPortalOpened(): void {
  }

}
