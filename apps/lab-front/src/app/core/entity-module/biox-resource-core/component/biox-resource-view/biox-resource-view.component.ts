import {Component, ComponentFactoryResolver, ComponentRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {
  BioxResourceView,
  BioxResourceViewType,
  BioxResourceViewTypeInfo,
  constBioxResourceViewTypeInfos
} from '../../../../model/entities/resource/biox-resource-view.entity';
import {ComponentType} from '@angular/cdk/overlay';
import {BioxResourceViewDirective} from '../../model/biox-resource-view-component.class';
import {BioxResourceJsonComponent} from '../biox-resource-json/biox-resource-json.component';
import {BioxResourceTextComponent} from '../biox-resource-text/biox-resource-text.component';
import {BioxResourceSpreadsheetComponent} from '../biox-resource-spreadsheet/biox-resource-spreadsheet.component';
import {BioxResourceNetworkComponent} from '../biox-resource-network/biox-resource-network.component';
import {BioxResourceChart2dComponent} from '../biox-resource-chart-2d/biox-resource-chart-2d.component';
import {BioxResourceHistogramComponent} from '../biox-resource-histogram/biox-resource-histogram.component';
import {BioxResourceBoxPlotComponent} from '../biox-resource-box-plot/biox-resource-box-plot.component';
import {BioxResourceMultiViewComponent} from '../biox-resource-multi-view/biox-resource-multi-view.component';

export function bioxResourceViewGetComponentType(viewType: BioxResourceViewType): ComponentType<BioxResourceViewDirective> {
  switch (viewType) {
    case 'json-view':
      return BioxResourceJsonComponent;
    case 'text-view':
      return BioxResourceTextComponent;
    case 'table-view':
      return BioxResourceSpreadsheetComponent;
    case 'network-view':
      return BioxResourceNetworkComponent;
    case 'scatter-plot-2d-view':
    case 'line-plot-2d-view':
    case 'bar-plot-view':
    case 'stacked-bar-plot-view':
      return BioxResourceChart2dComponent;
    case 'histogram-view':
      return BioxResourceHistogramComponent;
    case 'box-plot-view':
      return BioxResourceBoxPlotComponent;
    case 'multi-view':
      return BioxResourceMultiViewComponent;
    default:
      console.error(`View of type ${viewType} not supported`);
      return null;
  }
}


/**
 * Component to show a view
 */
@Component({
  selector: 'gen-biox-resource-view',
  templateUrl: './biox-resource-view.component.html',
  styleUrls: ['./biox-resource-view.component.scss']
})
export class BioxResourceViewComponent implements OnInit, OnDestroy {


  @Input() set view(value: BioxResourceView) {
    this._view = value;
    if (this.isReady) {
      this.initView(value);
    }
  }

  private _view: BioxResourceView;

  @Input() fullscreen: boolean = false;

  @ViewChild('viewContainer', {static: true, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  private isReady: boolean = false;

  private viewComponentRef: ComponentRef<BioxResourceViewDirective>;


  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit(): void {
    this.isReady = true;
    if (this._view) {
      this.initView(this._view);
    }
  }

  private initView(view: BioxResourceView): void {
    this.destroyViewComponentRef();
    const componentType = bioxResourceViewGetComponentType(view.type);
    const viewTypeInfo: BioxResourceViewTypeInfo = constBioxResourceViewTypeInfos[view.type];

    if (componentType == null || viewTypeInfo == null) {
      return;
    }

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    this.viewComponentRef = this.viewContainer.createComponent(componentFactory);
    this.viewComponentRef.instance.view = view;
    this.viewComponentRef.instance.fullscreen = this.fullscreen;
  }

  private destroyViewComponentRef(): void {
    this.viewComponentRef?.destroy();
    this.viewComponentRef = null;
  }

  ngOnDestroy(): void {
    this.destroyViewComponentRef();
  }

}
