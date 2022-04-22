import {RvResourceViewType} from './rv-resource-view.class';
import {ComponentType} from '@angular/cdk/overlay';
import {RvResourceViewDirective} from './rv-resource-view.directive';
import {RvViewJsonComponent} from '../component/rv-view-json/rv-view-json.component';
import {RvViewChart2dComponent} from '../component/rv-view-chart-2d/rv-view-chart2d.component';
import {RvViewNetworkComponent} from '../component/rv-view-network/rv-view-network.component';
import {RvViewMultiViewsComponent} from '../component/rv-view-multi-views/rv-view-multi-views.component';


export interface RvResourceViewModuleConfig {
  getComponentType(viewType: RvResourceViewType): ComponentType<RvResourceViewDirective>;
}

export function rvViewComponentFactory(viewType: RvResourceViewType): ComponentType<RvResourceViewDirective> {
  switch (viewType) {
    case 'json-view':
      return RvViewJsonComponent;
    case 'network-view':
      return RvViewNetworkComponent;
    case 'multi-view':
      return RvViewMultiViewsComponent;
    case 'scatter-plot-2d-view':
    case 'line-plot-2d-view':
    case 'bar-plot-view':
    case 'stacked-bar-plot-view':
    case 'box-plot-view':
    case 'heatmap-view':
    case 'histogram-view':
    case 'venn-diagram-view':
      return RvViewChart2dComponent;
    default:
      console.error(`View of type ${viewType} not supported`);
      return null;
  }
}
