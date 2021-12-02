import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlChart2dMultiSerie} from '../../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlChartSerie} from '../../../fl-chart/model/data/fl-chart-serie.class';
import {ClNumberHelper} from '@monorepo/core-lib';
import {FlSheetSingleSelection} from '../selection/fl-sheet-single-selection.class';
import {FlChart3dDatum} from '../../../fl-chart/model/data/fl-chart-data.class';
import {FlChartConfig2} from '../../../fl-chart/model/fl-chart-config.class';
import {FlChartHeatMap} from '../../../fl-chart/model/chart/fl-chart-heat-map.class';

export class FlSheetChartSelectionHeatMap extends FlSheetChartSelection {

  public chartType: FlChartType.HEAT_MAP;

  exportToChart(): FlChartConfig2 {
    const series: FlChart2dMultiSerie<FlChart3dDatum> = new FlChart2dMultiSerie();

    const ySelection: FlSheetSingleSelection = this.getSingleSelectionFromString(this.serie.y);
    const columnSelections: FlSheetSingleSelection[] = ySelection.splitToColumnSelections();

    for (let i = 0; i < columnSelections.length; i++) {
      const columnData: any[] = columnSelections[i].getCellsValuesFlat();

      // convert all the column data into a 3d datum, where x = columnIndex, y = index of value and z = value as number
      const data: FlChart3dDatum[] = columnData.map(
        (value, index) => new FlChart3dDatum(i, index, ClNumberHelper.fromString(value, 0))
      );
      series.addSerie(new FlChartSerie(data, i.toString()));
    }

    return new FlChartHeatMap(series);
  }

  get serie(): FlSheetChartSerieSelectionForm {
    return this.selectionForm.series[0];
  }


}
