import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlChartConfig} from '../../../fl-chart/model/fl-chart-config.class';
import {FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlSheet} from '../fl-sheet.class';


// Basic bar plot and stack plot
export class FlSheetChartSelectionBarPlot extends FlSheetChartSelection {


  constructor(sheet: FlSheet, private chartType: FlChartType.BAR_PLOT | FlChartType.STACKED_PLOT,
              private series: FlSheetChartSerieSelectionForm[]) {
    super(sheet);
  }

  exportToChart(): FlChartConfig {
    // const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();
    // for (const serie of this.series) {
    //   const ySelection: FlSheetSelection = this.getMultiSelectionFromString(serie.y);
    //   series.addSerie(new FlChartSerie<any>(this.convertSelectionTo2dDatum(ySelection), serie.name));
    // }
    //
    // if (this.chartType === FlChartType.BAR_PLOT) {
    //   return new FlChartBarPlot(series);
    // } else {
    //   return new FlChartStackedBar(series);
    // }
    return null;
  }
}


// Histogram
export class FlSheetChartSelectionHistogram extends FlSheetChartSelection {

  constructor(sheet: FlSheet, private series: FlSheetChartSerieSelectionForm[], private nbOfBins?: number) {
    super(sheet);
  }

  exportToChart(): FlChartConfig {
    // const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();
    //
    // const ySelection: FlSheetSelection = this.getMultiSelectionFromString(this.serie.y);
    // // convert all the data to numbers
    // const data: number[] = ySelection.getCellsValuesFlat().map(
    //   cellValue => ClNumberHelper.fromString(cellValue))
    //   .filter(value => value != null);
    //
    // // create the serie with bin data
    // const serie: FlChartSerie<any> = new FlChartSerie<any>(flChartGetDataBins(data, this.nbOfBins),
    //   this.serie.name);
    //
    // // define the axisXLabelFormat
    // series.axisXLabelFormat = (index: number) => {
    //   const ChartDataBin: FlChartDataBin = serie.data[index];
    //   return ChartDataBin.getIntervalText();
    // };
    // series.addSerie(serie);
    // return new FlChartHistogram(series);
    return null;

  }
}
