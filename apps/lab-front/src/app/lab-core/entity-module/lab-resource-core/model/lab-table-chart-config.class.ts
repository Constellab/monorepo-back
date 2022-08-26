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
  FlSheetSelectionRange,
  FlSpreadsheetChartSerieSelectionInput
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {LabResourceTableService, LabTableChartType} from '../../../entity-service/lab-resource-table.service';
import {LabConfigValues} from '../../../model/entities/lab-config.entity';
import {LabResourceView} from '../../../model/entities/resource/lab-resource-view.entity';
import {
  LabResourceViewPortalComponent,
  LabResourceViewPortalInput
} from '../component/lab-resource-view-portal/lab-resource-view-portal.component';
import {RvTransformerParams} from '@monorepo/resource-view';

/**
 * Main config class to generate chart from the sheet by calling the resource service
 */
export abstract class LabTableChartConfig extends FlSheetChartConfig {

  constructor(private resourceId: string, private tableViewMethodName: string,
              private tableViewConfig: LabConfigValues, private tableTransformers: RvTransformerParams[],
              private resourceTableService: LabResourceTableService, private portalService: FlPortalService) {
    super();
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
  protected openChartPortal(labView: LabResourceView, contextMenuItems?: FlMenuDynamic[]): FlOverlayRef {

    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true,
      });

    const config: LabResourceViewPortalInput = {
      labView: labView,
      contextMenuItems: contextMenuItems
    };

    return this.portalService.createPortal(LabResourceViewPortalComponent, portalConfig, config);
  }
}

/**
 * Main config class to generate 2d chart from the sheet by calling the resource service
 */
export abstract class LabTableChart2dConfig extends LabTableChartConfig {

  generate2dChart(chartType: LabTableChartType, chartConfig: LabConfigValues,
                  additionalFields: FlSheetChartSelectionFormAdditional,
                  contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    const fullChartConfig: LabConfigValues = Object.assign({
      x_axis_label: additionalFields.xAxisLabel,
      y_axis_label: additionalFields.yAxisLabel,
    }, chartConfig);

    return this.callChartOnTable(chartType, fullChartConfig, contextMenuItems);
  }


  getAdditionalFieldsName(): (keyof FlSheetChartSelectionFormAdditional)[] {
    return ['xAxisLabel', 'yAxisLabel'];
  }
}

//////////////////////////////////// LINE PLOT /////////////////////////////////////
export class LabTableChartConfigLinePlot extends LabTableChart2dConfig {

  getChartType(): FlChartType {
    return FlChartType.LINE;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generate2dChart('line-plot-2d', {series: series},
      additionalFields, contextMenuItems);
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

  getAdditionalFieldsName(): (keyof FlSheetChartSelectionFormAdditional)[] {
    return ['xAxisLabel', 'yAxisLabel'];
  }
}

//////////////////////////////////// SCATTER PLOT /////////////////////////////////////
export class LabTableChartConfigScatterPlot extends LabTableChart2dConfig {

  getChartType(): FlChartType {
    return FlChartType.SCATTER_PLOT;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generate2dChart('scatter-plot-2d', {series: series},
      additionalFields, contextMenuItems);
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

  getAdditionalFieldsName(): (keyof FlSheetChartSelectionFormAdditional)[] {
    return ['xAxisLabel', 'yAxisLabel'];
  }
}

//////////////////////////////////// VULCANO PLOT /////////////////////////////////////
export class LabTableChartConfigVulcanoPlot extends LabTableChart2dConfig {

  getChartType(): FlChartType {
    return FlChartType.VULCANO_PLOT;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generate2dChart('vulcano-plot',
      {
        series: series,
        x_threshold: additionalFields.xThreshold,
        y_threshold: additionalFields.yThreshold,
      },
      additionalFields, contextMenuItems);
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


  getNbMaxOfSeries(): number {
    return 1;
  }

  getAdditionalFieldsName(): (keyof FlSheetChartSelectionFormAdditional)[] {
    return ['xThreshold', 'yThreshold', 'xAxisLabel', 'yAxisLabel'];
  }
}


//////////////////////////////////// BAR PLOT /////////////////////////////////////
export class LabTableChartConfigBarPlot extends LabTableChart2dConfig {

  getChartType(): FlChartType {
    return FlChartType.BAR_PLOT;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generate2dChart('bar-plot', {series: series},
      additionalFields, contextMenuItems);
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
    return ['xAxisLabel', 'yAxisLabel'];
  }
}

//////////////////////////////////// STACKED BAR PLOT /////////////////////////////////////
export class LabTableChartConfigStackedBarPlot extends LabTableChart2dConfig {

  getChartType(): FlChartType {
    return FlChartType.STACKED_PLOT;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generate2dChart('stack-bar-plot',
      {
        series: series,
        normalize: additionalFields.normalize,
      },
      additionalFields, contextMenuItems);
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
    return ['normalize', 'xAxisLabel', 'yAxisLabel'];
  }
}

//////////////////////////////////// HISTOGRAM /////////////////////////////////////
export class LabTableChartConfigHistogram extends LabTableChart2dConfig {
  getChartType(): FlChartType {
    return FlChartType.HISTOGRAM;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generate2dChart('histogram',
      {
        series: series,
        nbins: additionalFields.nbOfBins,
        density: additionalFields.density,
      },
      additionalFields, contextMenuItems);
  }


  createSeriesFromDataRange(sheet: FlSheet, selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createSingleSelectionForY(selectionRange);
  }

  getAdditionalFieldsName(): (keyof FlSheetChartSelectionFormAdditional)[] {
    return ['nbOfBins', 'density', 'xAxisLabel', 'yAxisLabel'];
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
export class LabTableChartConfigBoxPlot extends LabTableChart2dConfig {

  getChartType(): FlChartType {
    return FlChartType.BOX_PLOT;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generate2dChart('box-plot', {series: series},
      additionalFields, contextMenuItems);
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
    return ['xAxisLabel', 'yAxisLabel'];
  }
}

//////////////////////////////////// HEAT MAP /////////////////////////////////////
export class LabTableChartConfigHeatMap extends LabTableChart2dConfig {

  getChartType(): FlChartType {
    return FlChartType.HEAT_MAP;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): Observable<FlOverlayRef> {
    return this.generate2dChart('heatmap', {serie: series[0]},
      additionalFields, contextMenuItems);
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

  getAdditionalFieldsName(): (keyof FlSheetChartSelectionFormAdditional)[] {
    return ['xAxisLabel', 'yAxisLabel'];
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
