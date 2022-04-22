import {ClHelpService, ClNumberHelper} from '@monorepo/core-lib';
import {FlChart3dDatum, FlChartConfig, FlChartHeatMap, FlChartHeatMapDataContainer} from '@monorepo/front-core-lib';
import {RvResourceViewBase} from './rv-resource-view.class';


export interface RvResourceViewHeatMap extends RvResourceViewBase {
  type: 'heatmap-view';
  data: RvResourceViewHeatMapData
}

export interface RvResourceViewHeatMapData  {
  table: any[][];
  rows: RvResourceViewHeaderMapHeader[];
  columns: RvResourceViewHeaderMapHeader[];
}

export interface RvResourceViewHeaderMapHeader {
  name: string;
  tags: Record<string, string>;
}

/**
 * Convert the heat map view to a FlChart object
 * @param view
 */
export function rvHeatMapToChart(view: RvResourceViewHeatMap): FlChartConfig {
  const viewData = ClHelpService.transpose2dArray(view.data.table);
  const chartData: FlChart3dDatum[][] = [];

  for (let column = 0; column < viewData.length; column++) {
    const columnInfo: RvResourceViewHeaderMapHeader = view.data.columns ? view.data.columns[column] : {name: column.toString(), tags: {}}
    // convert all the column data into a 3d datum, where x = columnIndex, y = index of value and z = value as number
    const data: FlChart3dDatum[] = [];

    for (let row = 0; row < viewData[column].length; row++) {
      const rowInfo: RvResourceViewHeaderMapHeader = view.data.rows ? view.data.rows[row] : {name: row.toString(), tags: {}}
      const value = ClNumberHelper.fromString(viewData[column][row], null);
      const datum = new FlChart3dDatum(column, row, value, columnInfo.name, rowInfo.name);
      datum.tags = Object.assign({}, columnInfo.tags, rowInfo.tags)

      data.push(datum)
    }
    chartData.push(data);
  }

  const dataContainer = new FlChartHeatMapDataContainer(chartData);

  if (!ClHelpService.isNullOrEmpty(view.data.columns)) {
    dataContainer.setXTickLabels(view.data.columns.map(column => column.name));
  }

  if (!ClHelpService.isNullOrEmpty(view.data.rows)) {
    dataContainer.setYTickLabels(view.data.rows.map(row => row.name));
  }

  return new FlChartHeatMap(dataContainer);
}

