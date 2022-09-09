import {PrConfigValues, PrIO, PrProcessStatus} from '@monorepo/protocol';

export class CaTechnicalReport {
  version: number;

  data: CaTechnicalReportData;
}

export interface CaTechnicalReportData {
  graph: CaTechnicalReportGraph;
  human_name: string;
}

export interface CaTechnicalReportGraph {
  nodes: Record<string, CaTechnicalReportProcess>;

  links: CaTechnicalReportLink[];

  interfaces: Record<string, CaTechnicalReportIntOut>;

  outerfaces: Record<string, CaTechnicalReportIntOut>;

}

export interface CaTechnicalReportProcess {
  brick_version: string;

  human_name: string;

  instance_name: string;

  process_typing_name: string;

  short_description: string;

  config: CaTechnicalReportConfig;

  inputs: Record<string, PrIO>;

  outputs: Record<string, PrIO>;

  graph?: CaTechnicalReportGraph;

  status: PrProcessStatus;
}

export interface CaTechnicalReportConfig {
  specs: any;

  values: PrConfigValues;
}

export interface CaTechnicalReportLink {
  from: CaTechnicalReportLinkNode;

  to: CaTechnicalReportLinkNode;
}

export interface CaTechnicalReportIntOut extends CaTechnicalReportLink {
  name: string;
}

export interface CaTechnicalReportLinkNode {
  node: string;

  port: string;
}
