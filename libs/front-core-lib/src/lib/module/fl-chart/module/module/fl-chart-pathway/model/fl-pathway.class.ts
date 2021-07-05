/**
 * Complete Structured data of a pathway
 */
export interface FlPathway {
  name?: string;
  metabolites: FlPathwayMetabolite[];
  reactions: FlPathwayReaction[];
  compartments: Record<string, string>;
}

export interface FlPathwayMetabolite {
  id: string;
  name: string;
  compartment: string;
  charge?: any;
  mass?: any;
  formula?: string;
  chebi_id?: string;
}

export interface FlPathwayReaction {
  id: string;
  name: string;
  metabolites: Record<string, number>;
  lower_bound?: number;
  upper_bound?: number;
  enzyme?: FlPathwayReactionEnzyme;
  estimate: FlPathwayReactionEstimate;
}

// Information about the enzyme in the reaction
export interface FlPathwayReactionEnzyme {
  title: string;
  ec_number: string;
  pathway: FlPathwayReactionPathway;
}

// list of database ref for a pathway
export type FlPathwayDatabase = keyof FlPathwayReactionPathway;

export const flPathwayDatabases: FlPathwayDatabase[] = ['kegg', 'branda', 'metacyc'];

// info of which pathway the reaction is
// It define the pathway name based for known DB (EU, US, Japan)
export interface FlPathwayReactionPathway {
  branda?: FlPathwayReactionPathwayDetail;
  kegg?: FlPathwayReactionPathwayDetail;
  metacyc?: FlPathwayReactionPathwayDetail;
}

export const flPathwayReactionPathwayIdSeparator: string = '; ';

export interface FlPathwayReactionPathwayDetail {
  // list of ids of the pathways separated by the separator
  id: string;
  // list of names of the pathways separated by the separator
  name: string;
}

export interface FlPathwayReactionEstimate {
  value: number;
  lower_bound: number;
  upper_bound: number;
}

export const flDefaultPathwayReactionValue: FlPathwayReactionEstimate = {
  value: 1, lower_bound: 1, upper_bound: 1
};

export const flDefaultSubPathway: FlPathwayReactionPathwayDetail = {
  id: 'Default',
  name: 'Default'
};

