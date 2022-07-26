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

  interfaces: Record<string, CaTechnicalReportIntOut>;

  outerfaces: Record<string, CaTechnicalReportIntOut>;
}

export interface CaTechnicalReportNode{
  brick_version: string;

  human_name: string;

  instance_name: string;

  process_typing_name: string;

  short_description: string;

  config: CaTechnicalReportConfig;

  graph?: CaTechnicalReportGraph;
}

export interface CaTechnicalReportConfig{
  specs: any;

  data: any;
}

export interface CaTechnicalReportLink{
  from: CaTechnicalReportLinkNode;

  to: CaTechnicalReportLinkNode;
}

export interface CaTechnicalReportIntOut extends CaTechnicalReportLink{
  name: string;
}

export interface CaTechnicalReportLinkNode{
  node: string;

  port: string;
}
