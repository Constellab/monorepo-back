import {FlChartConfig, FlChartVennData, FlChartVennDiagram} from '@monorepo/front-core-lib';
import {LabResourceViewBase} from './lab-resource-view.entity';

export interface LabResourceVennDiagram extends LabResourceViewBase{
  type: 'venn-diagram-view';
  data: LabResourceVennDiagramData;
}

export interface LabResourceVennDiagramData {
  label: string;
  total_number_of_groups: number; // number of group for the venn diagram
  group_names: string[];
  sections: {
    group_names: string[]; // column ensemble
    data: any[]; // list of data that are in all columns
  }[];
}


/**
 * Convert a venn diagram view to a FlChart object
 * @param view
 */
export function labVennDiagramToChart(view: LabResourceVennDiagram): FlChartConfig {
  const data: FlChartVennData = {
    totalNbOfGroups: view.data.total_number_of_groups,
    groupNames: view.data.group_names,
    sections: view.data.sections.map(section => ({groupNames: section.group_names, data: section.data}))
  };

  return new FlChartVennDiagram(data);
}
