import {FlSheet} from '../fl-sheet.class';
import {FlSheetMultiSelection} from '../selection/fl-sheet-multi-selection.class';
import {FlSheetSelection} from '../selection/fl-sheet-selection.class';
import {FlChart2dDatum} from '../../../fl-chart/model/data/fl-chart-data.class';
import {ClHelpService, ClNumberHelper} from '@monorepo/core-lib';
import {FlChartConfig} from '../../../fl-chart/model/fl-chart-config.class';
import {FlSheetChart2dSerieSelectionForm, FlSheetSelectionRange} from './fl-sheet-chart-selection-form.class';
import {FlChartSerie} from '../../../fl-chart/model/data/fl-chart-serie.class';

/**
 * Object to store the chart selection and contain a method to export the selection to series
 */
export abstract class FlSheetChartSelection {

  protected constructor(protected sheet: FlSheet) {
  }

  /**
   * Method to convert the selection to a multiple series
   */
  public abstract exportToChart(): FlChartConfig;

  protected getMultiSelectionFromSelectionRange(selection: FlSheetSelectionRange): FlSheetMultiSelection {
    return !ClHelpService.isNullOrEmpty(selection) ? FlSheetMultiSelection.fromSelectionRange(this.sheet, selection) : null;
  }

  /**
   * Convert the selections values to 2d datum with x = index of the value and y = value as number
   * @param selection
   * @private
   */
  protected convertSelectionTo2dDatum(selection: FlSheetSelection): FlChart2dDatum[] {
    // create a chart datum for each values
    return this.getSelectionValues(selection).map((value, index) => new FlChart2dDatum(index, value));
  }

  /**
   * Convert the selections values to 2d datum with x = xData and y = value as number
   */
  protected convertSelectionTo2dDatumWithXData(xSelection: FlSheetSelection, ySelection: FlSheetSelection): FlChart2dDatum[] {
    const xValues: number[] = this.getSelectionValues(xSelection);
    const yValues: number[] = this.getSelectionValues(ySelection);
    const limit = Math.min(xValues.length, yValues.length);
    // create a chart datum for each values (where x and y exists
    const data: FlChart2dDatum[] = [];
    for (let i = 0; i < limit; i++) {
      data.push(new FlChart2dDatum(xValues[i], yValues[i]));
    }
    return data;
  }

  /**
   * Convert a formSelection serie to a chart serie including x values if provided
   * @param formSelection
   * @protected
   */
  protected convert2DFormSelectionToChartSerie(formSelection: FlSheetChart2dSerieSelectionForm): FlChartSerie<any>{
    const ySelection: FlSheetSelection = this.getMultiSelectionFromSelectionRange(formSelection.y);

    if (!ClHelpService.isNullOrEmpty(formSelection.x)) {
      const xSelection: FlSheetSelection = this.getMultiSelectionFromSelectionRange(formSelection.x);
      return new FlChartSerie<any>(this.convertSelectionTo2dDatumWithXData(xSelection, ySelection), formSelection.name);
    } else {
      return new FlChartSerie<any>(this.convertSelectionTo2dDatum(ySelection), formSelection.name);
    }
  }

  /**
   * return the selection values as numbers, it excludes the value that are not numbers
   */
  protected getSelectionValues(selection: FlSheetSelection): number[] {
    const values: any[] = selection.getCellsValuesFlat();

    // convert the values to number if possible
    return values.map(value => ClNumberHelper.fromString(value));
  }

}

