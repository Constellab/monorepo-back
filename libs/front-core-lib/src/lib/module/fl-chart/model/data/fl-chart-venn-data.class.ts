export interface FlChartVennData {
  groupNames: string[]; // all the group names
  totalNbOfGroups: number;
  sections: FlChartVennDataSection[];
}

export interface FlChartVennDataSection {
  groupNames: string[]; // column ensemble
  data: any[]; // list of values that are in all the group listed in groupNames
}
