import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlChart2dMultiSerie, FlChartMultiSerie} from '../../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlSheetSelection} from '../selection/fl-sheet-selection.class';
import {FlChartSerie} from '../../../fl-chart/model/data/fl-chart-serie.class';
import {ClNumberHelper} from '@monorepo/core-lib';
import {FlChartDataBin, flChartGetDataBins} from '../../../fl-chart/model/data/fl-chart-data-bin.class';

export class FlSheetChartSelectionHistogram extends FlSheetChartSelection {

  public chartType: FlChartType.HISTOGRAM;

  exportToSeries(): FlChartMultiSerie<any> {
    const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();

    const ySelection: FlSheetSelection = this.getMultiSelectionFromString(this.serie.y);
    // convert all the data to numbers
    const data: number[] = ySelection.getCellsValuesFlat().map(
      cellValue => ClNumberHelper.fromString(cellValue))
      .filter(value => value != null);

    // create the serie with bin data
    const serie: FlChartSerie<any> = new FlChartSerie<any>(flChartGetDataBins(data, this.selectionForm.nbOfBins),
      this.serie.name);

    // define the axisXLabelFormat
    series.axisXLabelFormat = (index: number) => {
      const dataHisto: FlChartDataBin = serie.data[index];
      return dataHisto.getIntervalText();
    };
    series.addSerie(serie);
    return series;
  }

  get serie(): FlSheetChartSerieSelectionForm {
    return this.selectionForm.series[0];
  }


}
