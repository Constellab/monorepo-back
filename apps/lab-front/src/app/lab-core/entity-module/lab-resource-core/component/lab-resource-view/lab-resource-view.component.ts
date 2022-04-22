import {Component, ComponentRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {
  labConstResourceViewTypeInfos,
  LabResourceView,
  LabResourceViewConfig,
  LabResourceViewDisplayMode,
  LabResourceViewType,
  LabResourceViewTypeInfo
} from '../../../../model/entities/resource/lab-resource-view.entity';
import {ComponentType} from '@angular/cdk/overlay';
import {LabResourceViewDirective} from '../../model/lab-resource-view.directive';
import {LabResourceJsonComponent} from '../lab-resource-json/lab-resource-json.component';
import {LabResourceTextComponent} from '../lab-resource-text/lab-resource-text.component';
import {LabResourceSpreadsheetComponent} from '../lab-resource-spreadsheet/lab-resource-spreadsheet.component';
import {LabResourceNetworkComponent} from '../lab-resource-network/lab-resource-network.component';
import {LabResourceChart2dComponent} from '../lab-resource-chart-2d/lab-resource-chart2d.component';
import {LabResourceMultiViewComponent} from '../lab-resource-multi-view/lab-resource-multi-view.component';
import {LabResourceFolderComponent} from '../lab-resource-folder/lab-resource-folder.component';
import {LabResourcesListComponent} from '../lab-resources-list/lab-resources-list.component';

export function labResourceViewGetComponentType(viewType: LabResourceViewType): ComponentType<LabResourceViewDirective> {
  switch (viewType) {
    case 'json-view':
      return LabResourceJsonComponent;
    case 'text-view':
      return LabResourceTextComponent;
    case 'table-view':
    case 'dataset-view':
      return LabResourceSpreadsheetComponent;
    case 'network-view':
      return LabResourceNetworkComponent;
    case 'scatter-plot-2d-view':
    case 'line-plot-2d-view':
    case 'bar-plot-view':
    case 'stacked-bar-plot-view':
    case 'box-plot-view':
    case 'heatmap-view':
    case 'histogram-view':
    case 'venn-diagram-view':
      return LabResourceChart2dComponent;
    case 'multi-view':
      return LabResourceMultiViewComponent;
    case 'folder-view':
      return LabResourceFolderComponent;
    case 'resources-list-view':
      return LabResourcesListComponent;
    default:
      console.error(`View of type ${viewType} not supported`);
      return null;
  }
}


/**
 * Component to show a view
 */
@Component({
  selector: 'lab-resource-view',
  templateUrl: './lab-resource-view.component.html',
  styleUrls: ['./lab-resource-view.component.scss']
})
export class LabResourceViewComponent implements OnInit, OnDestroy {


  @Input() set view(value: LabResourceView) {
    this._view = value;
    if (this.isReady) {
      this.initView(value);
    }
  }

  _view: LabResourceView;


  @Input() resourceId: string;

  @Input() config: LabResourceViewConfig;

  @Input() displayMode: LabResourceViewDisplayMode = 'fullScreen';

  @ViewChild('viewContainer', {static: true, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  private isReady: boolean = false;

  private viewComponentRef: ComponentRef<LabResourceViewDirective>;

  viewNotSupportedError: boolean = false;


  constructor() {
  }

  ngOnInit(): void {
    this.isReady = true;
    if (this._view) {
      this.initView(this._view);
    }
  }

  private initView(view: LabResourceView): void {
    // wait for other input to be set
    setTimeout(() => {
      this.destroyViewComponentRef();
      const componentType = labResourceViewGetComponentType(view.type);
      const viewTypeInfo: LabResourceViewTypeInfo = labConstResourceViewTypeInfos[view.type];

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
