import {FlSheet} from '../fl-sheet.class';
import {FlSheetChart2dSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlChartConfig} from '../../../fl-chart/model/fl-chart-config.class';
import {FlChart2dMultiSerie} from '../../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartVulcanoPlot} from '../../../fl-chart/model/chart/fl-chart-vulcano-plot.class';


export class FlSheetChartSelectionVulcanoPlot extends FlSheetChartSelection {
  constructor(sheet: FlSheet,
              private serie: FlSheetChart2dSerieSelectionForm,
              private xThreshold: number, private yThreshold: number,
              private xAxisLabel?: string, private yAxisLabel?: string) {
    super(sheet);
  }

  exportToChart(): FlChartConfig {

    // only take the first serie
    const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();
    series.addSerie(this.convert2DFormSelectionToChartSerie(this.serie));

    series.axisXLabel = this.xAxisLabel;
    series.axisYLabel = this.yAxisLabel;

    return new FlChartVulcanoPlot(series, this.xThreshold, this.yThreshold);
  }
}
