import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlChartMultiSerie} from '../../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlChartBoxPlotSerie, flChartGetBoxPlotData} from '../../../fl-chart/model/data/fl-chart-box-plot-data.class';
import {FlSheetSelection} from '../selection/fl-sheet-selection.class';
import {FlChartConfig2} from '../../../fl-chart/model/fl-chart-config.class';
import {FlChartBoxPlot} from '../../../fl-chart/model/chart/fl-chart-box-plot.class';

export class FlSheetChartSelectionBoxPlot extends FlSheetChartSelection {

  public chartType: FlChartType.BOX_PLOT;

  exportToChart(): FlChartConfig2 {
    const series: FlChartMultiSerie<any> = new FlChartMultiSerie();

    for (const serie of this.selectionForm.series) {
      const ySelection: FlSheetSelection = this.getMultiSelectionFromString(serie.y);
      const values: number[] = this.getSelectionValues(ySelection);

      series.addSerie(new FlChartBoxPlotSerie([flChartGetBoxPlotData(values)], serie.name));
    }

    return new FlChartBoxPlot(series);
  }


}
