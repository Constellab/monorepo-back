import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabResourceView} from '../model/entities/resource/lab-resource-view.entity';
import {LabConfigValues} from '../model/entities/lab-config.entity';
import {LabCallTransformerParams} from '../model/global/lab-transformer.class';

export type LabTableChartType = 'line-plot-2d' | 'scatter-plot-2d' | 'bar-plot' |
  'stack-bar-plot' | 'histogram' | 'box-plot' | 'heatmap' | 'venn-diagram';

/**
 * Service to call methods on table resource
 */
@Injectable({
  providedIn: 'root'
})
export class LabResourceTableService {

  private readonly route: string = 'resource-table';

  constructor(private apiService: FlApiService) {
  }

  /**
   * Method used by the Table view to call a Chart view on it
   */
  public callChartOnTable(resourceId: string, tableViewMethodName: string, tableViewConfig: LabConfigValues,
                          tableViewTransformers: LabCallTransformerParams[],
                          chartType: LabTableChartType, chartConfig: LabConfigValues): Observable<LabResourceView> {

    const data = {
      table_view_name: tableViewMethodName,
      table_config_values: tableViewConfig,
      table_transformers: tableViewTransformers,
      chart_type: chartType,
      chart_config_values: chartConfig
    };

    return this.apiService.post(`${this.route}/${resourceId}/call-chart`, data);
  }
}
