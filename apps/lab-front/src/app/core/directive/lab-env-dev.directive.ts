import {Directive, OnDestroy, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {FlAbstractIfDirective} from '@monorepo/front-core-lib';
import {LabEnvStore} from '../service/lab-env.store';
import {Subscription} from 'rxjs';

@Directive({
  selector: '[genLabEnvDev]'
})
export class LabEnvDevDirective extends FlAbstractIfDirective implements OnInit, OnDestroy {

  private subscription: Subscription;

  constructor(templateRef: TemplateRef<any>,
              viewContainer: ViewContainerRef,
              private labEnvStore: LabEnvStore) {
    super(templateRef, viewContainer);
  }

  ngOnInit(): void {
    this.subscription = this.labEnvStore.getLabEnvironment$().subscribe(
      () => this.updateView()
    );
  }


  protected showView(): boolean {
    return this.labEnvStore.isDev();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
