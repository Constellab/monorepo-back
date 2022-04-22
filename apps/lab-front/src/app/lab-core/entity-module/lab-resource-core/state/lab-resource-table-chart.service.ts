import {Injectable} from '@angular/core';
import {
  FlChartConfig,
  FlSheetChart2dSerieSelectionForm,
  FlSheetChartSerieSelectionForm,
  FlSheetChartService
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabCallTransformerParams} from '../../../model/global/lab-transformer.class';
import {map} from 'rxjs/operators';
import {
  labBasicPlotToChart,
  LabResourceViewBasicPlot2d
} from '../../../model/entities/resource/lab-resource-view-basic-plot-2d.class';
import {
  labBoxPlotToChart,
  LabResourceViewBoxPlot
} from '../../../model/entities/resource/lab-resource-view-box-plot.class';
import {
  labHistogramToChart,
  LabResourceViewHistogram
} from '../../../model/entities/resource/lab-resource-view-histogram.class';
import {
  labHeatMapToChart,
  LabResourceViewHeatMap
} from '../../../model/entities/resource/lab-resource-view-heat-map.class';
import {
  LabResourceVennDiagram,
  labVennDiagramToChart
} from '../../../model/entities/resource/lab-resource-venn-diagram.class';
import {LabResourceTableService, LabTableChartType} from '../../../entity-service/lab-resource-table.service';
import {LabConfigValues} from '../../../model/entities/lab-config.entity';
import {LabResourceView} from '../../../model/entities/resource/lab-resource-view.entity';

/**
 * Service passed to @{LabResourceTableComponent}  to call chart view on spreadsheet actions
 */
@Injectable()
export class LabResourceTableChartService extends FlSheetChartService {

  private resourceId: string;
  private tableViewMethodName: string;
  private tableViewConfig: LabConfigValues;
  private tableTransformers: LabCallTransformerParams[];

  constructor(private resourceTableService: LabResourceTableService) {
    super();
  }

  public init(resourceId: string, tableViewMethodName: string,
              tableViewConfig: LabConfigValues,
              tableTransformers: LabCallTransformerParams[]): void {
    this.resourceId = resourceId;
    this.tableViewMethodName = tableViewMethodName;
    this.tableViewConfig = tableViewConfig;
    this.tableTransformers = tableTransformers;
  }

  generateBar(series: FlSheetChartSerieSelectionForm[]): Observable<FlChartConfig> {
    return this.generateBasic2dChart('bar-plot', series);
  }

  generateBoxPlot(series: FlSheetChartSerieSelectionForm[]): Observable<FlChartConfig> {
    return this.callChartOnTable('box-plot', {series: series}).pipe(
      map((view) => labBoxPlotToChart(view as LabResourceViewBoxPlot))
    );
  }

  generateHeatMap(serie: FlSheetChartSerieSelectionForm): Observable<FlChartConfig> {
    return this.callChartOnTable('heatmap', {serie: serie}).pipe(
      map((view) => labHeatMapToChart(view as LabResourceViewHeatMap))
    );
  }

  generateHistogram(series: FlSheetChartSerieSelectionForm[], nbOfBins?: number, density?: boolean): Observable<FlChartConfig> {
    return this.callChartOnTable('histogram', {
      series: series,
      nbins: nbOfBins,
      density: density,
    }).pipe(
      map((view) => labHistogramToChart(view as LabResourceViewHistogram))
    );
  }

  generateLine2d(series: FlSheetChart2dSerieSelectionForm[]): Observable<FlChartConfig> {
    return this.generateBasic2dChart('line-plot-2d', series);
  }

  generateScatterPlot2d(series: FlSheetChart2dSerieSelectionForm[]): Observable<FlChartConfig> {
    return this.generateBasic2dChart('scatter-plot-2d', series);
  }

  generateStackBar(series: FlSheetChartSerieSelectionForm[], normalize: boolean): Observable<FlChartConfig> {
    return this.callChartOnTable('stack-bar-plot', {
      series: series,
      normalize: normalize,
    }).pipe(
      map((view) => labBasicPlotToChart(view as LabResourceViewBasicPlot2d))
    );
  }

  generateVennDiagram(series: FlSheetChartSerieSelectionForm[]): Observable<FlChartConfig> {
    return this.callChartOnTable('venn-diagram', {series: series}).pipe(
      map((view) => labVennDiagramToChart(view as LabResourceVennDiagram))
    );
  }

  private generateBasic2dChart(chartType: LabTableChartType, series: FlSheetChartSerieSelectionForm[]): Observable<FlChartConfig> {
    return this.callChartOnTable(chartType, {series: series}).pipe(
      map((view) => labBasicPlotToChart(view as LabResourceViewBasicPlot2d))
    );
  }

  private callChartOnTable(chartType: LabTableChartType, chartConfig: LabConfigValues): Observable<LabResourceView> {
    return this.resourceTableService.callChartOnTable(this.resourceId, this.tableViewMethodName,
      this.tableViewConfig, this.tableTransformers, chartType, chartConfig);
  }

}
