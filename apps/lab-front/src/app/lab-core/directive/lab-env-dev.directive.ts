import {Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {FlAbstractIfDirective} from '@monorepo/front-core-lib';
import {LabEnvStore} from '../service/lab-env.store';
import {Observable} from 'rxjs';

@Directive({
  selector: '[labEnvDev]'
})
export class LabEnvDevDirective extends FlAbstractIfDirective implements OnInit, OnDestroy {


  constructor(templateRef: TemplateRef<any>,
              viewContainer: ViewContainerRef,
              private labEnvStore: LabEnvStore) {
    super(templateRef, viewContainer);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  protected showView(): Observable<boolean> {
    return this.labEnvStore.isDev$();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

}
