import {Directive, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {FlAbstractIfDirective} from '@monorepo/front-core-lib';
import {AuthenticatedUserService} from '../../../service-api/authenticated-user.service';

/**
 * Structurale directive that work like ngIf, and show element only is user is admin
 */
@Directive({
  selector: '[genIsAdmin]'
})
export class IsAdminDirective extends FlAbstractIfDirective implements OnInit{

  constructor(templateRef: TemplateRef<any>,
              viewContainer: ViewContainerRef,
              private authenticatedUserService: AuthenticatedUserService) {
    super(templateRef, viewContainer);
  }

  ngOnInit(): void {
    this.updateView();
  }


  protected showView(): boolean {
    return this.authenticatedUserService.isAdmin();
  }


}
