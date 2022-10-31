import {Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {CaCurrentOrganizationService} from '../../../service-api/ca-current-organization.service';
import {CaAuthenticatedUserService} from '../../../service-api/ca-authenticated-user.service';
import {FlAbstractIfDirective} from '@monorepo/front-core-lib';

/**
 * Structural directive that work like ngIf, and show element only is user is admin of the current organization (or g admin)
 */
@Directive({
  selector: '[caIsOrganizationAdmin]'
})
export class CaIsOrganizationAdminDirective extends FlAbstractIfDirective implements OnInit, OnDestroy {

  constructor(templateRef: TemplateRef<any>,
              viewContainer: ViewContainerRef,
              private currentOrganizationService: CaCurrentOrganizationService,
              private authenticatedUserService: CaAuthenticatedUserService) {
    super(templateRef, viewContainer);
  }


  ngOnInit(): void {
    super.ngOnInit();
  }

  protected showView(): boolean {
    return this.authenticatedUserService.isAdmin() || this.currentOrganizationService.isOrganizationAdmin();
  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
