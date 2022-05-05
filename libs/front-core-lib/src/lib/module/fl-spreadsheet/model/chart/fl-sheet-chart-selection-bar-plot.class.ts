import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlChartConfig} from '../../../fl-chart/model/fl-chart-config.class';
import {FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlSheet} from '../fl-sheet.class';
import {FlChart2dMultiSerie} from '../../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlSheetSelection} from '../selection/fl-sheet-selection.class';
import {FlChartBarPlot, FlChartHistogram, FlChartStackedBar} from '../../../fl-chart/model/chart/fl-chart-bar.class';
import {FlChartSerie} from '../../../fl-chart/model/data/fl-chart-serie.class';
import {ClNumberHelper} from '@monorepo/core-lib';
import {FlChartDataBin, flChartGetDataBins} from '../../../fl-chart/model/data/fl-chart-data-bin.class';


// Basic bar plot and stack plot
export class FlSheetChartSelectionBarPlot extends FlSheetChartSelection {


  constructor(sheet: FlSheet, private chartType: FlChartType.BAR_PLOT | FlChartType.STACKED_PLOT,
              private series: FlSheetChartSerieSelectionForm[]) {
    super(sheet);
  }

  exportToChart(): FlChartConfig {
    const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();
    for (const serie of this.series) {
      const ySelection: FlSheetSelection = this.getMultiSelectionFromSelectionRange(serie.y);
      series.addSerie(new FlChartSerie<any>(this.convertSelectionTo2dDatum(ySelection), serie.name));
    }

    if (this.chartType === FlChartType.BAR_PLOT) {
      return new FlChartBarPlot(series);
    } else {
      return new FlChartStackedBar(series);
    }
  }
}

// Basic bar plot and stack plot
export class FlSheetChartSelectionStackedBarPlot extends FlSheetChartSelection {


  constructor(sheet: FlSheet, private chartType: FlChartType.STACKED_PLOT,
              private series: FlSheetChartSerieSelectionForm[]) {
    super(sheet);
  }

  exportToChart(): FlChartConfig {
    const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();
    for (const serie of this.series) {
      const ySelection: FlSheetSelection = this.getMultiSelectionFromSelectionRange(serie.y);
      series.addSerie(new FlChartSerie<any>(this.convertSelectionTo2dDatum(ySelection), serie.name));
    }



    return new FlChartStackedBar(series);

  }
}


// Histogram
export class FlSheetChartSelectionHistogram extends FlSheetChartSelection {

  constructor(sheet: FlSheet, private series: FlSheetChartSerieSelectionForm[], private nbOfBins?: number) {
    super(sheet);
  }

  exportToChart(): FlChartConfig {
    const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();

    const ySelection: FlSheetSelection = this.getMultiSelectionFromSelectionRange(this.series[0].y);
    // convert all the data to numbers
    const data: number[] = ySelection.getCellsValuesFlat().map(
      cellValue => ClNumberHelper.fromString(cellValue))
      .filter(value => value != null);

    // create the serie with bin data
    const serie: FlChartSerie<any> = new FlChartSerie<any>(flChartGetDataBins(data, this.nbOfBins),
      this.series[0].name);

    // define the axisXLabelFormat
    series.axisXLabelFormat = (index: number) => {
      const ChartDataBin: FlChartDataBin = serie.data[index];
      return ChartDataBin.getIntervalText();
    };
    series.addSerie(serie);
    return new FlChartHistogram(series);

  }
}
