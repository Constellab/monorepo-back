import {Component, ComponentFactoryResolver, ComponentRef, Inject, OnInit, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {BioxResourceViewDirective} from '../../model/biox-resource-view-component.class';
import {BioxResourceView} from '../../../../model/entities/resource/biox-resource-view.entity';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';

export interface BioxResourcePortalViewInput {
  viewComponentType: Type<BioxResourceViewDirective>;
  view: BioxResourceView;
}

@Component({
  selector: 'gen-biox-resource-view-portal',
  templateUrl: './biox-resource-view-portal.component.html',
  styleUrls: ['./biox-resource-view-portal.component.scss']
})
export class BioxResourceViewPortalComponent implements OnInit {

  @ViewChild('viewContainer', {static: true, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              @Inject(FL_PORTAL_DATA) private input: BioxResourcePortalViewInput) {
  }

  ngOnInit(): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.input.viewComponentType);

    const viewComponentRef: ComponentRef<BioxResourceViewDirective> = this.viewContainer.createComponent(componentFactory);
    viewComponentRef.instance.view = this.input.view;
  }

}
