import {Injectable} from '@angular/core';
import {
  FlChartConfig,
  FlSheetChart2dSerieSelectionForm,
  FlSheetChartSerieSelectionForm,
  FlSheetChartService
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabResourceService} from '../../../entity-service/lab-resource.service';
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

/**
 * State of the @{LabResourceTableComponent} use to call chart view on spreadsheet actions
 */
@Injectable()
export class LabResourceTableChartState extends FlSheetChartService {

  private resourceId: string;
  private transformers: LabCallTransformerParams[];

  constructor(private resourceService: LabResourceService) {
    super();
  }

  public init(resourceId: string, transformers: LabCallTransformerParams[]): void {
    this.resourceId = resourceId;
    this.transformers = transformers;
  }

  generateBar(series: FlSheetChartSerieSelectionForm[]): Observable<FlChartConfig> {
    return this.generateBasic2dChart('view_as_bar_plot', series);
  }

  generateBoxPlot(series: FlSheetChartSerieSelectionForm[]): Observable<FlChartConfig> {
    return this.resourceService.callResourceView(this.resourceId, 'view_as_box_plot', {series: series}, this.transformers).pipe(
      map((view) => labBoxPlotToChart(view.viewData as LabResourceViewBoxPlot))
    );
  }

  generateHeatMap(serie: FlSheetChartSerieSelectionForm): Observable<FlChartConfig> {
    return this.resourceService.callResourceView(this.resourceId, 'view_as_heatmap', {serie: serie}, this.transformers).pipe(
      map((view) => labHeatMapToChart(view.viewData as LabResourceViewHeatMap))
    );
  }

  generateHistogram(series: FlSheetChartSerieSelectionForm[], nbOfBins?: number): Observable<FlChartConfig> {
    return this.resourceService.callResourceView(this.resourceId, 'view_as_histogram', {
      series: series,
      nbins: nbOfBins
    }, this.transformers).pipe(
      map((view) => labHistogramToChart(view.viewData as LabResourceViewHistogram))
    );
  }

  generateLine2d(series: FlSheetChart2dSerieSelectionForm[]): Observable<FlChartConfig> {
    return this.generateBasic2dChart('view_as_line_plot_2d', series);
  }

  generateScatterPlot2d(series: FlSheetChart2dSerieSelectionForm[]): Observable<FlChartConfig> {
    return this.generateBasic2dChart('view_as_scatter_plot_2d', series);
  }

  generateStackBar(series: FlSheetChartSerieSelectionForm[]): Observable<FlChartConfig> {
    return this.generateBasic2dChart('view_as_stacked_bar_plot', series);
  }

  generateVennDiagram(series: FlSheetChartSerieSelectionForm[]): Observable<FlChartConfig> {
    return this.resourceService.callResourceView(this.resourceId, 'view_as_venn_diagram', {series: series}, this.transformers).pipe(
      map((view) => labVennDiagramToChart(view.viewData as LabResourceVennDiagram))
    );
  }

  private generateBasic2dChart(viewMethodeName: string, series: FlSheetChartSerieSelectionForm[]): Observable<FlChartConfig> {
    return this.resourceService.callResourceView(this.resourceId, viewMethodeName, {series: series}, this.transformers).pipe(
      map((view) => labBasicPlotToChart(view.viewData as LabResourceViewBasicPlot2d))
    );
  }


}
