import {Directive, Input} from '@angular/core';
import {FlMouseHoverPortalAbstractDirective, FlMouseHoverPortalConfig, FlOverlayRef} from '@monorepo/front-core-lib';
import {CaUser} from '../../../model/entities/ca-user.class';
import {CaUserInfoPortalComponent} from '../component/ca-user-info-portal/ca-user-info-portal.component';

@Directive({
  selector: '[caMouseUserHoverPortal]'
})
export class CaMouseHoverUserPortalDirective extends FlMouseHoverPortalAbstractDirective {

  @Input()
  data: CaUser;

  getConfig(): FlMouseHoverPortalConfig | null {
    return  {
      data : this.data,
      position : ['left', 'bottom', 'top', 'right'],
      component: CaUserInfoPortalComponent,
      portalTagName: 'CA-USER-INFO-PORTAL'
    };
  }

  onPortalClosed(event: MouseEvent): void {
  }

  onPortalOpened(overlay: FlOverlayRef, event: MouseEvent): void {
  }

}
