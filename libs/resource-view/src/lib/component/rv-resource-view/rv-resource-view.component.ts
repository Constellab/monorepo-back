import {Component, ComponentRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {
  rvConstResourceViewTypeInfos,
  RvResourceView,
  RvResourceViewTypeInfo,
  RvViewDisplayMode
} from '../../model/rv-resource-view.class';

import {RvViewConfig} from '../../model/rv-view-config.class';
import {RvResourceViewDirective} from '../../model/rv-resource-view.directive';
import {rvViewComponentFactory} from '../../model/rv-resource-view-module.config';

@Component({
  selector: 'rv-resource-view',
  templateUrl: './rv-resource-view.component.html',
  styleUrls: ['./rv-resource-view.component.scss']
})
export class RvResourceViewComponent implements OnInit, OnDestroy {

  @Input() set view(value: RvResourceView) {
    this._view = value;
    if (this.isReady) {
      this.initView(value);
    }
  }

  _view: RvResourceView;


  @Input() resourceId: string;

  @Input() config: RvViewConfig;

  @Input() displayMode: RvViewDisplayMode = 'fullScreen';

  @ViewChild('viewContainer', {static: true, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  private isReady: boolean = false;

  private viewComponentRef: ComponentRef<RvResourceViewDirective>;

  viewNotSupportedError: boolean = false;


  constructor() {
  }

  ngOnInit(): void {
    this.isReady = true;
    if (this._view) {
      this.initView(this._view);
    }
  }

  private initView(view: RvResourceView): void {
    // wait for other input to be set
    setTimeout(() => {
      this.destroyViewComponentRef();
      const componentType = rvViewComponentFactory(view.type);
      const viewTypeInfo: RvResourceViewTypeInfo = rvConstResourceViewTypeInfos[view.type];

      if (componentType == null || viewTypeInfo == null) {
        this.viewNotSupportedError = true;
        return;
      }
      this.viewNotSupportedError = false;

      this.viewComponentRef = this.viewContainer.createComponent(componentType);
      this.viewComponentRef.instance.view = view;
      this.viewComponentRef.instance.resourceId = this.resourceId;
      this.viewComponentRef.instance.config = this.config;
      this.viewComponentRef.instance.displayMode = this.displayMode;
    }, 0);
  }

  private destroyViewComponentRef(): void {
    this.viewComponentRef?.destroy();
    this.viewComponentRef = null;
  }

  ngOnDestroy(): void {
    this.destroyViewComponentRef();
  }

}
