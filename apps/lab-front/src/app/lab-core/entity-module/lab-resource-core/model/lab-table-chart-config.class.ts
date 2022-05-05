import {
  FlChartType,
  FlMenuDynamic,
  FlOverlayRef,
  FlPortalConfig,
  FlPortalService,
  FlSheet,
  FlSheetChart2dSerieSelectionForm,
  FlSheetChartConfig,
  FlSheetChartSelectionFormAdditional,
  FlSheetChartSerieSelectionForm,
  FlSheetSelectionRange,
  FlSpreadsheetChartSerieSelectionInput
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
 * Main config class to generate chart from the sheet by calling the resource service
 */
export abstract class LabTableChartConfig extends FlSheetChartConfig {

  constructor(private resourceId: string, private tableViewMethodName: string,
              private tableViewConfig: LabConfigValues, private tableTransformers: LabCallTransformerParams[],
              private resourceTableService: LabResourceTableService, private portalService: FlPortalService) {
    super();
  }

  protected generateBasic2dChart(chartType: LabTableChartType, series: FlSheetChartSerieSelectionForm[],
                                 contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.callChartOnTable(chartType, {series: series}, contextMenuItems).pipe(
    );
  }

  protected callChartOnTable(chartType: LabTableChartType, chartConfig: LabConfigValues,
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
  protected openChartPortal(view: LabResourceView, contextMenuItems?: FlMenuDynamic[]): FlOverlayRef {

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

//////////////////////////////////// LINE PLOT /////////////////////////////////////
export class LabTableChartConfigLinePlot extends LabTableChartConfig {

  getChartType(): FlChartType {
    return FlChartType.LINE;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generateBasic2dChart('line-plot-2d', series, contextMenuItems);
  }

  createSeriesFromDataRange(sheet: FlSheet, selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createMultipleSeriesForY(sheet, selectionRange);
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'full',
      ySelectionMode: 'multi',
      xSelectionMode: 'multi'
    };
  }
}

//////////////////////////////////// SCATTER PLOT /////////////////////////////////////
export class LabTableChartConfigScatterPlot extends LabTableChartConfig {

  getChartType(): FlChartType {
    return FlChartType.SCATTER_PLOT;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generateBasic2dChart('scatter-plot-2d', series, contextMenuItems);
  }

  createSeriesFromDataRange(sheet: FlSheet, selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createMultipleSeriesForXAndY(sheet, selectionRange);
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'full',
      ySelectionMode: 'multi',
      xSelectionMode: 'multi'
    };
  }
}


//////////////////////////////////// BAR PLOT /////////////////////////////////////
export class LabTableChartConfigBarPlot extends LabTableChartConfig {

  getChartType(): FlChartType {
    return FlChartType.BAR_PLOT;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generateBasic2dChart('bar-plot', series, contextMenuItems);
  }

  createSeriesFromDataRange(sheet: FlSheet, selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createMultipleSeriesForY(sheet, selectionRange);
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'onlyY',
      ySelectionMode: 'multi',
    };
  }
}

//////////////////////////////////// STACKED BAR PLOT /////////////////////////////////////
export class LabTableChartConfigStackedBarPlot extends LabTableChartConfig {

  getChartType(): FlChartType {
    return FlChartType.STACKED_PLOT;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.callChartOnTable('stack-bar-plot', {
      series: series,
      normalize: additionalFields.normalize,
    }, contextMenuItems);
  }

  createSeriesFromDataRange(sheet: FlSheet, selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createMultipleSeriesForY(sheet, selectionRange);
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'onlyY',
      ySelectionMode: 'multi',
    };
  }

  getAdditionalFieldsName(): (keyof FlSheetChartSelectionFormAdditional)[] {
    return ['normalize'];
  }
}

//////////////////////////////////// HISTOGRAM /////////////////////////////////////
export class LabTableChartConfigHistogram extends LabTableChartConfig {
  getChartType(): FlChartType {
    return FlChartType.HISTOGRAM;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.callChartOnTable('histogram', {
      series: series,
      nbins: additionalFields.nbOfBins,
      density: additionalFields.density,
    }, contextMenuItems);
  }


  createSeriesFromDataRange(sheet: FlSheet, selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createSingleSelectionForY(selectionRange);
  }

  getAdditionalFieldsName(): (keyof FlSheetChartSelectionFormAdditional)[] {
    return ['nbOfBins', 'density'];
  }


  getNbMaxOfSeries(): number {
    return 1;
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'onlyY',
      ySelectionMode: 'multi',
    };
  }
}

//////////////////////////////////// BOX PLOT /////////////////////////////////////
export class LabTableChartConfigBoxPlot extends LabTableChartConfig {

  getChartType(): FlChartType {
    return FlChartType.BOX_PLOT;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.callChartOnTable('box-plot', {series: series}, contextMenuItems);
  }

  createSeriesFromDataRange(sheet: FlSheet, selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createMultipleSeriesForY(sheet, selectionRange);
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'onlyY',
      ySelectionMode: 'multi',
    };
  }
}

//////////////////////////////////// HEAT MAP /////////////////////////////////////
export class LabTableChartConfigHeatMap extends LabTableChartConfig {

  getChartType(): FlChartType {
    return FlChartType.HEAT_MAP;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.callChartOnTable('heatmap', {serie: series[0]}, contextMenuItems);
  }

  createSeriesFromDataRange(sheet: FlSheet, selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createSingleSelectionForY(selectionRange);
  }

  getNbMaxOfSeries(): number {
    return 1;
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'onlyY',
      ySelectionMode: 'single',
    };
  }
}


//////////////////////////////////// VENN DIAGRAM /////////////////////////////////////
export class LabTableChartConfigVennDiagram extends LabTableChartConfig {

  getChartType(): FlChartType {
    return FlChartType.VENN_DIAGRAM;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.callChartOnTable('venn-diagram', {series: series}, contextMenuItems);
  }

  createSeriesFromDataRange(sheet: FlSheet, selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createMultipleSeriesForY(sheet, selectionRange);
  }

  getNbMaxOfSeries(): number {
    return 4;
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'onlyY',
      ySelectionMode: 'multi',
    };
  }
}
