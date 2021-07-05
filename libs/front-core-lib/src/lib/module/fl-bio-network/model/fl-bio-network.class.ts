/**
 * Complete Structured data of a pathway
 */
export interface FlBioNetwork {
  name?: string;
  metabolites: FlBioNetworkMetabolite[];
  reactions: FlBioNetworkReaction[];
  compartments: Record<string, string>;
}

export interface FlBioNetworkMetabolite {
  id: string;
  name: string;
  compartment: string;
  charge?: any;
  mass?: any;
  formula?: string;
  chebi_id?: string;
}

export interface FlBioNetworkReaction {
  id: string;
  name: string;
  metabolites: Record<string, number>;
  lower_bound?: number;
  upper_bound?: number;
  enzyme?: FlBioNetworkEnzyme;
  estimate: FlBioNetworkReactionEstimate;
}

// Information about the enzyme in the reaction
export interface FlBioNetworkEnzyme {
  title: string;
  ec_number: string;
  pathway: FlBioNetworkPathways;
}

// list of database ref for a pathway
export type FlPathwayDatabase = keyof FlBioNetworkPathways;

export const flPathwayDatabases: FlPathwayDatabase[] = ['kegg', 'branda', 'metacyc'];

// info of which pathway the reaction is
// It define the pathway name based for known DB (EU, US, Japan)
export interface FlBioNetworkPathways {
  branda?: FlBioNetworkPathwayDetail;
  kegg?: FlBioNetworkPathwayDetail;
  metacyc?: FlBioNetworkPathwayDetail;
}

export const flBioNetworkPathwayIdSeparator: string = '; ';

export interface FlBioNetworkPathwayDetail {
  // list of ids of the pathways separated by the separator
  id: string;
  // list of names of the pathways separated by the separator
  name: string;
}

export interface FlBioNetworkReactionEstimate {
  value: number;
  lower_bound: number;
  upper_bound: number;
}

export const flDefaultPathwayReactionValue: FlBioNetworkReactionEstimate = {
  value: 1, lower_bound: 1, upper_bound: 1
};

export const flDefaultPathway: FlBioNetworkPathwayDetail = {
  id: 'Default',
  name: 'Default'
};

