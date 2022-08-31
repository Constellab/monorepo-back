import {FlCoord} from '../../../model/shared/fl-coord.class';

/**
 * Complete Structured data of a pathway
 */
export interface FlBioNetwork {
  name?: string;
  metabolites: FlBioNetworkMetabolite[];
  reactions: FlBioNetworkReaction[];
  compartments: FlBioNetworkCompartment[];
}

// Level of the metabolite 3 = cofactor
// The lower the level, the more important the metabolite is
export enum FlBioNetworkMetaboliteLevel {
  MAJOR = 1,
  MINOR = 2,
  COFACTOR = 3
}


export interface FlBioNetworkMetabolite {
  id: string;
  name: string;
  compartment: string;
  charge?: any;
  mass?: any;
  formula?: string;
  chebi_id?: string;
  layout?: FlBioNetworkLayout;
  level: FlBioNetworkMetaboliteLevel;
  is_cofactor: boolean;
}


export interface FlBioNetworkReaction {
  id: string;
  name: string;
  metabolites: Record<string, FlBioNetworkReactionLink>;
  lower_bound?: number;
  upper_bound?: number;
  enzyme?: FlBioNetworkEnzyme;
  data: FlBioNetworkReactionData;
  layout?: FlCoord;
  level?: FlBioNetworkMetaboliteLevel;
}

export interface FlBioNetworkLayout {
  // x: number;
  // y: number;
  clusters: Record<string, FlBioNetworkCluster>;
}

export interface FlBioNetworkCluster extends FlCoord {
  x: number;
  y: number;
  level: FlBioNetworkMetaboliteLevel;
  name: string;
  parent: string;
}

export interface FlBioNetworkCompartment {
  id: string;
  go_id: string;
  bigg_d: string;
  name: string;
}

// TODO rename and review format with cluster
export interface FlBioNetworkClusterInfo {
  clusterId: string;
  subClusterIds: string[];
}


export interface FlBioNetworkReactionLink {
  stoich: number;
  points: FlCoord[];
}

// Information about the enzyme in the reaction
export interface FlBioNetworkEnzyme {
  title: string;
  ec_number: string;
  pathways: FlBioNetworkPathways;
}

// list of database ref for a pathway
export type FlPathwayDatabase = keyof FlBioNetworkPathways;

export const flPathwayDatabases: FlPathwayDatabase[] = ['kegg', 'brenda', 'metacyc'];

// info of which pathway the reaction is
// It define the pathway name based for known DB (EU, US, Japan)
export interface FlBioNetworkPathways {
  brenda?: FlBioNetworkPathwayDetail;
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

// TODO to improve when the cluster will be fully activated
export interface FlBioNetworkClusterSelection {
  name: string;
  selected: boolean;
  highlighted: boolean;
  color: string;
}

export interface FlBioNetworkClusterGroupSelection {
  name: string;
  children: FlBioNetworkClusterSelection2[];
}

export interface FlBioNetworkClusterSelection2 {
  name: string;
}

export interface FlBioNetworkReactionData {
  flux_estimates: FlBioNetworkReactionDataFlux;
}

export interface FlBioNetworkReactionDataFlux {
  values: number[];
  lower_bounds: number[];
  upper_bounds: number[];
  // labels?: [];
}

export const flDefaultPathwayReactionValue: FlBioNetworkReactionData = {
  flux_estimates: {values: [1], lower_bounds: [1], upper_bounds: [1]}
};

export const flDefaultPathway: FlBioNetworkPathwayDetail = {
  id: 'Default',
  name: 'Default'
};

