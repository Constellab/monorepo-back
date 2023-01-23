import {Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {FlAbstractIfDirective} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {HaAuthService} from '../../../ha-service/ha-auth.service';

@Directive({
  selector: '[haIsAuthenticated]'
})
export class HaIsAuthenticatedDirective extends FlAbstractIfDirective implements OnInit, OnDestroy{

  @Input()
  set haIsAuthenticatedElse(templateRef: TemplateRef<any> | null){
    this.elseTemplateRef = templateRef;
  }

  @Input()
  set haIsAuthenticated(c: boolean | null){

  }

  constructor(
    templateRef: TemplateRef<any>,
    viewContainer: ViewContainerRef,
    private loginService: HaAuthService
  ) {
    super(templateRef, viewContainer);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected showView(): boolean | Observable<boolean> {
    return this.loginService.hasAuthorizationCookie();
  }
}
