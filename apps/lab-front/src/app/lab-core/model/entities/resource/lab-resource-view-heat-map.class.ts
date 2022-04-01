import {ClHelpService, ClNumberHelper} from '@monorepo/core-lib';
import {FlChart3dDatum, FlChartConfig, FlChartHeatMap, FlChartHeatMapDataContainer} from '@monorepo/front-core-lib';
import {LabResourceViewBase} from './lab-resource-view.entity';


export interface LabResourceViewHeatMap extends LabResourceViewBase {
  type: 'heatmap-view';
  data: any[][];
  rows: LabResourceViewHeaderMapHeader[];
  columns: LabResourceViewHeaderMapHeader[];
}

export interface LabResourceViewHeaderMapHeader {
  name: string;
  tags: Record<string, string>;
}

/**
 * Convert the heat map view to a FlChart object
 * @param view
 */
export function labHeatMapToChart(view: LabResourceViewHeatMap): FlChartConfig {
  const viewData = ClHelpService.transpose2dArray(view.data);
  const chartData: FlChart3dDatum[][] = [];

  for (let column = 0; column < viewData.length; column++) {
    const columnInfo: LabResourceViewHeaderMapHeader = view.columns ? view.columns[column] : {name: column.toString(), tags: {}}
    // convert all the column data into a 3d datum, where x = columnIndex, y = index of value and z = value as number
    const data: FlChart3dDatum[] = [];

    for (let row = 0; row < viewData[column].length; row++) {
      const rowInfo: LabResourceViewHeaderMapHeader = view.rows ? view.rows[row] : {name: row.toString(), tags: {}}
      const value = ClNumberHelper.fromString(viewData[column][row], null);
      const datum = new FlChart3dDatum(column, row, value, columnInfo.name, rowInfo.name);
      datum.tags = Object.assign({}, columnInfo.tags, rowInfo.tags)

      data.push(datum)
    }
    chartData.push(data);
  }

  const dataContainer = new FlChartHeatMapDataContainer(chartData);

  view.columns = Array(100).fill('Bonjour à tous ce text est long')
  if (!ClHelpService.isNullOrEmpty(view.columns)) {
    dataContainer.setXTickLabels(view.columns.map(column => column.name));
  }

  if (!ClHelpService.isNullOrEmpty(view.rows)) {
    dataContainer.setYTickLabels(view.rows.map(row => row.name));
  }

  return new FlChartHeatMap(dataContainer);
}

