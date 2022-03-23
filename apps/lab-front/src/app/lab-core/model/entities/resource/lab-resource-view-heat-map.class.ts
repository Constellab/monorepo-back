import {ClHelpService, ClNumberHelper} from '@monorepo/core-lib';
import {FlChart3dDatum, FlChartConfig, FlChartHeatMap, FlChartHeatMapDataContainer} from '@monorepo/front-core-lib';
import {LabResourceViewBase} from './lab-resource-view.entity';


export interface LabResourceViewHeatMap extends LabResourceViewBase {
  type: 'heatmap-view';
  data: any[][];
  row_names: string[];
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
    const columnName: string = view.columns ? view.columns[column]?.name ?? column.toString() : column.toString();
    // convert all the column data into a 3d datum, where x = columnIndex, y = index of value and z = value as number
    const data: FlChart3dDatum[] = [];

    for (let row = 0; row < viewData[column].length; row++) {
      const rowName: string = view.rows ? view.rows[row]?.name ?? row.toString() : row.toString();
      const value = ClNumberHelper.fromString(viewData[column][row], 0);
      data.push(new FlChart3dDatum(column, row, value, columnName, rowName));
    }
    chartData.push(data);
  }

  const dataContainer = new FlChartHeatMapDataContainer(chartData);

  // x tick labels = columns names
  dataContainer.setXTickLabels(Object.keys(view.data));

  if (!ClHelpService.isNullOrEmpty(view.rows)) {
    dataContainer.setYTickLabels(view.rows.map(row => row.name));
  }

  return new FlChartHeatMap(dataContainer);
}

