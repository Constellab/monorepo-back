import {Injectable} from '@angular/core';
import {
  FlMenuDynamic,
  FlOverlayRef,
  FlPortalConfig,
  FlPortalService,
  FlSheetChart2dSerieSelectionForm,
  FlSheetChartSerieSelectionForm,
  FlSheetChartService
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabCallTransformerParams} from '../../../model/global/lab-transformer.class';
import {map} from 'rxjs/operators';
import {LabResourceTableService, LabTableChartType} from '../../../entity-service/lab-resource-table.service';
import {LabConfigValues} from '../../../model/entities/lab-config.entity';
import {LabResourceView} from '../../../model/entities/resource/lab-resource-view.entity';
import {
  LabResourceViewPortalComponent,
  LabResourceViewPortalInput
} from '../component/lab-resource-view-portal/lab-resource-view-portal.component';

/**
 * Service passed to @{LabResourceTableComponent}  to call chart view on spreadsheet actions
 */
@Injectable()
export class LabResourceTableChartService extends FlSheetChartService {

  private resourceId: string;
  private tableViewMethodName: string;
  private tableViewConfig: LabConfigValues;
  private tableTransformers: LabCallTransformerParams[];

  constructor(private resourceTableService: LabResourceTableService,
              private portalService: FlPortalService) {
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

  generateBar(series: FlSheetChartSerieSelectionForm[], contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generateBasic2dChart('bar-plot', series, contextMenuItems);
  }

  generateBoxPlot(series: FlSheetChartSerieSelectionForm[], contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.callChartOnTable('box-plot', {series: series}, contextMenuItems);
  }

  generateHeatMap(serie: FlSheetChartSerieSelectionForm, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.callChartOnTable('heatmap', {serie: serie}, contextMenuItems);
  }

  generateHistogram(series: FlSheetChartSerieSelectionForm[], nbOfBins?: number, density?: boolean,
                    contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.callChartOnTable('histogram', {
      series: series,
      nbins: nbOfBins,
      density: density,
    }, contextMenuItems);
  }

  generateLine2d(series: FlSheetChart2dSerieSelectionForm[], contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generateBasic2dChart('line-plot-2d', series, contextMenuItems);
  }

  generateScatterPlot2d(series: FlSheetChart2dSerieSelectionForm[], contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generateBasic2dChart('scatter-plot-2d', series, contextMenuItems);
  }

  generateStackBar(series: FlSheetChartSerieSelectionForm[], normalize: boolean,
                   contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.callChartOnTable('stack-bar-plot', {
      series: series,
      normalize: normalize,
    }, contextMenuItems);
  }

  generateVennDiagram(series: FlSheetChartSerieSelectionForm[], contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.callChartOnTable('venn-diagram', {series: series}, contextMenuItems).pipe(
    );
  }

  private generateBasic2dChart(chartType: LabTableChartType, series: FlSheetChartSerieSelectionForm[],
                               contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.callChartOnTable(chartType, {series: series}, contextMenuItems).pipe(
    );
  }

  private callChartOnTable(chartType: LabTableChartType, chartConfig: LabConfigValues,
                           contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.resourceTableService.callChartOnTable(this.resourceId, this.tableViewMethodName,
      this.tableViewConfig, this.tableTransformers, chartType, chartConfig).pipe(
      map((view) => this.openChartPortal(view, contextMenuItems)),
    );
  }

  /**
   * Open the chart portal after chart selection
   * @private
   */
  private openChartPortal(view: LabResourceView, contextMenuItems?: FlMenuDynamic[]): FlOverlayRef {

    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true,
      });

    const config: LabResourceViewPortalInput = {
      view: view,
      config: {
        methodName: this.tableViewMethodName,
        configValues: this.tableViewConfig,
        transformers: this.tableTransformers,
      },
      resourceId: this.resourceId,
      contextMenuItems: contextMenuItems
    };

    return this.portalService.createPortal(LabResourceViewPortalComponent, portalConfig, config);
  }

}
