import {Component, ComponentRef, Inject, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {RvResourceViewBase, RvViewDisplayMode} from '../../model/rv-resource-view.class';

import {RvViewConfig} from '../../model/rv-view-config.class';
import {RvResourceViewDirective} from '../../model/rv-resource-view.directive';
import {RvResourceViewTypeInfo} from '../../model/rv-type-info.class';
import {RV_MODULE_CONFIG, RvResourceViewModuleConfig} from '../../model/rv-resource-view-module.config';
import {FlMenuDynamic} from '@monorepo/front-core-lib';

@Component({
  selector: 'rv-resource-view',
  templateUrl: './rv-resource-view.component.html',
  styleUrls: ['./rv-resource-view.component.scss']
})
export class RvResourceViewComponent implements OnInit, OnDestroy {

  @Input() set view(value: RvResourceViewBase) {
    this._view = value;
    if (this.isReady) {
      this.initView(value);
    }
  }

  _view: RvResourceViewBase;


  @Input() resourceId: string;

  @Input() config: RvViewConfig;

  @Input() displayMode: RvViewDisplayMode = 'fullScreen';

  // if provided the view will support a right click. (only supported by view chart2d for now)
  @Input() contextMenuItems?: FlMenuDynamic[];

  @ViewChild('viewContainer', {static: true, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  private isReady: boolean = false;

  private viewComponentRef: ComponentRef<RvResourceViewDirective>;

  viewNotSupportedError: boolean = false;


  constructor(@Inject(RV_MODULE_CONFIG) private moduleConfig: RvResourceViewModuleConfig) {
  }

  ngOnInit(): void {
    this.isReady = true;
    if (this._view) {
      this.initView(this._view);
    }
  }

  private initView(view: RvResourceViewBase): void {
    // wait for other input to be set
    setTimeout(() => {
      this.destroyViewComponentRef();

      const viewTypeInfo: RvResourceViewTypeInfo = this.getViewInfo(view.type);

      if (viewTypeInfo == null || viewTypeInfo.viewComponent == null) {
        this.viewNotSupportedError = true;
        return;
      }

      this.viewNotSupportedError = false;
      this.viewComponentRef = this.viewContainer.createComponent(viewTypeInfo.viewComponent);
      this.viewComponentRef.instance.view = view;
      this.viewComponentRef.instance.resourceId = this.resourceId;
      this.viewComponentRef.instance.config = this.config;
      this.viewComponentRef.instance.displayMode = this.displayMode;
      this.viewComponentRef.instance.contextMenuItems = this.contextMenuItems;
    }, 0);
  }

  private getViewInfo(viewType: string): RvResourceViewTypeInfo {
    return this.moduleConfig.availableViews[viewType];
  }

  private destroyViewComponentRef(): void {
    this.viewComponentRef?.destroy();
    this.viewComponentRef = null;
  }

  ngOnDestroy(): void {
    this.destroyViewComponentRef();
  }

}
