import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlChart2dMultiSerie} from '../../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlChartSerie} from '../../../fl-chart/model/data/fl-chart-serie.class';
import {ClNumberHelper} from '@monorepo/core-lib';
import {FlSheetSingleSelection} from '../selection/fl-sheet-single-selection.class';
import {FlChart3dDatum} from '../../../fl-chart/model/data/fl-chart-data.class';

export class FlSheetChartSelectionHeatMap extends FlSheetChartSelection {

  public chartType: FlChartType.HEAT_MAP;

  exportToSeries(): FlChart2dMultiSerie<FlChart3dDatum> {
    const series: FlChart2dMultiSerie<FlChart3dDatum> = new FlChart2dMultiSerie();

    const ySelection: FlSheetSingleSelection = this.getSingleSelectionFromString(this.serie.y);
    const columnSelections: FlSheetSingleSelection[] = ySelection.splitToColumnSelections();

    const data: FlChart3dDatum[] = [];
    for (let i = 0; i < columnSelections.length; i++) {
      const columnData: any[] = columnSelections[i].getCellsValuesFlat();
      for (let j = 0; j < columnData.length; j++) {
        // invert the Y position so the first data are on top of the chart
        data.push(new FlChart3dDatum(i + 1, (columnData.length - j), ClNumberHelper.fromString(columnData[j], null)));
      }
    }

    // create the serie with bin data
    const serie: FlChartSerie<FlChart3dDatum> = new FlChartSerie(data, this.serie.name);

    series.addSerie(serie);
    return series;
  }

  get serie(): FlSheetChartSerieSelectionForm {
    return this.selectionForm.series[0];
  }


}
