import {ClCsvJson, ClNumberHelper} from '@monorepo/core-lib';
import {
  FlChart2dMultiSerie,
  FlChart3dDatum,
  FlChartConfig,
  FlChartHeatMap,
  FlChartSerie
} from '@monorepo/front-core-lib';


export interface LabResourceViewHeatMap {
  type: 'heatmap-view';
  data: ClCsvJson;
  row_names: string[];
}

/**
 * Convert the heat map view to a FlChart object
 * @param view
 */
export function labHeatMapToChart(view: LabResourceViewHeatMap): FlChartConfig {
  const series: FlChart2dMultiSerie<FlChart3dDatum> = new FlChart2dMultiSerie();

  let columnIndex: number = 0;
  for (const columnName in view.data) {
    // convert all the column data into a 3d datum, where x = columnIndex, y = index of value and z = value as number
    const data: FlChart3dDatum[] = view.data[columnName].map(
      (value, index) => new FlChart3dDatum(columnIndex, index, ClNumberHelper.fromString(value, 0), columnName, view.row_names[index])
    );
    series.addSerie(new FlChartSerie(data, columnName));

    columnIndex++;
  }

  // x tick labels = columns names
  series.setXTickLabels(Object.keys(view.data));
  series.setYTickLabels(view.row_names);
  return new FlChartHeatMap(series);
}
