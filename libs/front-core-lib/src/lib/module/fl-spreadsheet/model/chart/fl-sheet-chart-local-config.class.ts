import {FlSheet} from '../fl-sheet.class';
import {
  FlSheetChart2dSerieSelectionForm,
  FlSheetChartSelectionFormAdditional,
  FlSheetSelectionRange
} from './fl-sheet-chart-selection-form.class';
import {FlChartPortalConfig, FlChartPortalService, FlChartType} from '../../../fl-chart/public-api';
import {FlSheetChartSelectionBarPlot, FlSheetChartSelectionHistogram} from './fl-sheet-chart-selection-bar-plot.class';
import {FlSheetChartSelectionBoxPlot} from './fl-sheet-chart-selection-box-plot.class';
import {FlSheetChartSelectionHeatMap} from './fl-sheet-chart-selection-heat-map.class';
import {FlSheetChartSelectionBasic} from './fl-sheet-chart-selection-basic.class';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {FlPortalConfig} from '../../../fl-portal/model/fl-portal-config.class';
import {FlMenuDynamic} from '../../../fl-menu-dynamic/model/fl-menu-dynamic.class';
import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlSheetChartConfig, FlSpreadsheetChartSerieSelectionInput} from './fl-sheet-chart-config.class';


/**
 * Main config class to generate chart from the sheet locally
 */
export abstract class FlSheetLocalChartConfig extends FlSheetChartConfig {
  constructor(private chartPortalService: FlChartPortalService) {
    super();
  }

  protected openChartPortal(chartSelection: FlSheetChartSelection, contextMenuItems: FlMenuDynamic[]): FlOverlayRef {
    const chartPortalConfig: FlChartPortalConfig = {
      chart: chartSelection.exportToChart(),
      contextMenuItems: contextMenuItems
    };


    const portalConfig: FlPortalConfig = this.chartPortalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true
      });

    return this.chartPortalService.createDynamicChartPortal(chartPortalConfig, portalConfig);
  }
}

//////////////////////////////////// LINE PLOT /////////////////////////////////////
export class FlSheetLocalChartConfigLinePlot extends FlSheetLocalChartConfig {

  getChartType(): FlChartType.LINE {
    return FlChartType.LINE;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): FlOverlayRef {
    const selection = new FlSheetChartSelectionBasic(sheet, this.getChartType(), series,
      additionalFields.xAxisLabel, additionalFields.yAxisLabel);
    return this.openChartPortal(selection, contextMenuItems);
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
export class FlSheetLocalChartConfigScatterPlot extends FlSheetLocalChartConfig {

  getChartType(): FlChartType.SCATTER_PLOT {
    return FlChartType.SCATTER_PLOT;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): FlOverlayRef {
    const selection = new FlSheetChartSelectionBasic(sheet, this.getChartType(), series,
      additionalFields.xAxisLabel, additionalFields.yAxisLabel);
    return this.openChartPortal(selection, contextMenuItems);
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


//////////////////////////////////// BAR PLOT /////////////////////////////////////
export class FlSheetLocalChartConfigBarPlot extends FlSheetLocalChartConfig {

  getChartType(): FlChartType.BAR_PLOT {
    return FlChartType.BAR_PLOT;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): FlOverlayRef {
    const selection = new FlSheetChartSelectionBarPlot(sheet, this.getChartType(), series,
      additionalFields.xAxisLabel, additionalFields.yAxisLabel);
    return this.openChartPortal(selection, contextMenuItems);
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
export class FlSheetLocalChartConfigStackedBarPlot extends FlSheetLocalChartConfig {

  getChartType(): FlChartType.STACKED_PLOT {
    return FlChartType.STACKED_PLOT;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): FlOverlayRef {
    const selection = new FlSheetChartSelectionBarPlot(sheet, this.getChartType(), series,
      additionalFields.xAxisLabel, additionalFields.yAxisLabel);
    return this.openChartPortal(selection, contextMenuItems);
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

//////////////////////////////////// HISTOGRAM /////////////////////////////////////
export class FlSheetLocalChartConfigHistogram extends FlSheetLocalChartConfig {
  getChartType(): FlChartType {
    return FlChartType.HISTOGRAM;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): FlOverlayRef {
    const selection = new FlSheetChartSelectionHistogram(sheet, series, additionalFields.nbOfBins,
      additionalFields.xAxisLabel, additionalFields.yAxisLabel);
    return this.openChartPortal(selection, contextMenuItems);
  }


  createSeriesFromDataRange(sheet: FlSheet, selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createSingleSelectionForY(selectionRange);
  }

  getAdditionalFieldsName(): (keyof FlSheetChartSelectionFormAdditional)[] {
    return ['nbOfBins', 'xAxisLabel', 'yAxisLabel'];
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
export class FlSheetLocalChartConfigBoxPlot extends FlSheetLocalChartConfig {

  getChartType(): FlChartType {
    return FlChartType.BOX_PLOT;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): FlOverlayRef {
    const selection = new FlSheetChartSelectionBoxPlot(sheet, series,
      additionalFields.xAxisLabel, additionalFields.yAxisLabel);
    return this.openChartPortal(selection, contextMenuItems);
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
export class FlSheetLocalChartConfigHeatMap extends FlSheetLocalChartConfig {

  getChartType(): FlChartType {
    return FlChartType.HEAT_MAP;
  }

  generateChart(series: FlSheetChart2dSerieSelectionForm[], additionalFields: FlSheetChartSelectionFormAdditional,
                sheet: FlSheet, contextMenuItems?: FlMenuDynamic[]): FlOverlayRef {
    const selection = new FlSheetChartSelectionHeatMap(sheet, series[0],
      additionalFields.xAxisLabel, additionalFields.yAxisLabel);
    return this.openChartPortal(selection, contextMenuItems);
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


