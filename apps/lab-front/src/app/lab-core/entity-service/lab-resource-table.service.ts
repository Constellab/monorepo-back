import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabResourceView} from '../model/entities/resource/lab-resource-view.entity';
import {LabConfigValues} from '../model/entities/lab-config.entity';
import {RvResourceViewTable, RvTransformerParams} from '@monorepo/resource-view';
import {LabResourceService} from './lab-resource.service';

export type LabTableChartType = 'line-plot-2d' | 'scatter-plot-2d' | 'vulcano-plot' |
  'bar-plot' | 'stack-bar-plot' | 'histogram' |
  'box-plot' | 'heatmap' | 'venn-diagram';

/**
 * Service to call methods on table resource
 */
@Injectable({
  providedIn: 'root'
})
export class LabResourceTableService {

  private readonly route: string = 'resource-table';

  private readonly tableViewFromRowParam = 'from_row';
  private readonly tableViewNbOfRowsPerPageParam = 'number_of_rows_per_page';
  private readonly tableDefaultPageSize: number = 100;

  constructor(private apiService: FlApiService,
              private resourceService: LabResourceService) {
  }

  /**
   * Method used by the Table view to call a Chart view on it
   */
  public callChartOnTable(resourceId: string, tableViewMethodName: string, tableViewConfig: LabConfigValues,
                          tableViewTransformers: RvTransformerParams[],
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

  /**
   *
   * @param id
   * @param viewMethodName
   * @param config
   * @param transformers
   * @param fromRow the first row to load (including)
   */
  public callNextPage(id: string, viewMethodName: string, config: LabConfigValues,
                      transformers: RvTransformerParams[],
                      fromRow: number): Observable<RvResourceViewTable> {
    // merge config with pagination config,
    // add 1 to the fromRow because communication are made using 1-based index
    const viewConfig = Object.assign(config, {[this.tableViewFromRowParam]: fromRow + 1});

    return this.resourceService.callResourceView(id, viewMethodName,
      viewConfig, transformers) as Observable<RvResourceViewTable>;
  }

  /**
   *
   * @param id
   * @param viewMethodName
   * @param config
   * @param transformers
   * @param toRow the last row to load (excluding)
   */
  public callPreviousPage(id: string, viewMethodName: string, config: LabConfigValues,
                          transformers: RvTransformerParams[],
                          toRow: number): Observable<RvResourceViewTable> {
    let pageSize = config[this.tableViewNbOfRowsPerPageParam] ?? this.tableDefaultPageSize;
    let fromRow = toRow - pageSize;

    // if the page size is bigger than the remaining rows to load, reduce
    // the page size, and load rows from 0
    if (fromRow < 0) {
      pageSize += fromRow;
      fromRow = 0;
    }

    // merge config with pagination config
    // add 1 to the fromRow because communication are made using 1-based index
    const viewConfig = Object.assign(config, {
      [this.tableViewFromRowParam]: fromRow + 1,
      [this.tableViewNbOfRowsPerPageParam]: pageSize
    });

    return this.resourceService.callResourceView(id, viewMethodName,
      viewConfig, transformers) as Observable<RvResourceViewTable>;
  }
}
