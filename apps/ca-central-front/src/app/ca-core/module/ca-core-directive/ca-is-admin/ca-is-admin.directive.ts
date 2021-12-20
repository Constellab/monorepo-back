import {Directive, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {FlAbstractIfDirective} from '@monorepo/front-core-lib';
import {CaAuthenticatedUserService} from '../../../service-api/ca-authenticated-user.service';

/**
 * Structurale directive that work like ngIf, and show element only is user is admin
 */
@Directive({
  selector: '[caIsAdmin]'
})
export class CaIsAdminDirective extends FlAbstractIfDirective implements OnInit{

  constructor(templateRef: TemplateRef<any>,
              viewContainer: ViewContainerRef,
              private authenticatedUserService: CaAuthenticatedUserService) {
    super(templateRef, viewContainer);
  }

  ngOnInit(): void {
    this.updateView();
  }


  protected showView(): boolean {
    return this.authenticatedUserService.isAdmin();
  }


}
