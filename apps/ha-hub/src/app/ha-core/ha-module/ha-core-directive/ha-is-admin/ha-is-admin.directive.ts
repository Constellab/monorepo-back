import {Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {FlAbstractIfDirective} from '@monorepo/front-core-lib';
import {HaAuthenticatedUserService} from '../../../ha-service/ha-authenticated-user.service';
import {Observable} from 'rxjs';

@Directive({
  selector: '[haIsAdmin]'
})
export class HaIsAdminDirective extends FlAbstractIfDirective implements OnInit, OnDestroy {

  constructor(templateRef: TemplateRef<any>,
              viewContainer: ViewContainerRef,
              private authenticatedUserService: HaAuthenticatedUserService) {
    super(templateRef, viewContainer);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  protected showView(): Observable<boolean> {
    return this.authenticatedUserService.isAdmin();
  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
