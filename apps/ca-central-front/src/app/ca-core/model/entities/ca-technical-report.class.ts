export class CaTechnicalReport{
  version: number;

  data: CaTechnicalReportData;
}

export interface CaTechnicalReportData{
  graph: CaTechnicalReportGraph;
}

export interface CaTechnicalReportGraph{
  nodes: Record<string, CaTechnicalReportNode>;

  links: CaTechnicalReportLink[];
}

export interface CaTechnicalReportNode{
  brick_version: string;

  human_name: string;

  instance_name: string;

  process_typing_name: string;

  short_description: string;

  config: any;

  graph?: CaTechnicalReportGraph;
}

export interface CaTechnicalReportLink{
  from: CaTechnicalReportLinkNode;

  to: CaTechnicalReportLinkNode;
}

export interface CaTechnicalReportLinkNode{
  node: string;

  port: string;
}
